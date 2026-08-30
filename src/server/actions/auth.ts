"use server";

import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { env, adminEmails } from "@/lib/env";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { startSession, invalidateSession, invalidateUserSessions, clearSessionCookie, getAuth } from "@/lib/auth/session";
import { generateToken, sha256 } from "@/lib/crypto";
import { getRequestMeta } from "@/lib/request";
import { limiters } from "@/lib/rate-limit";
import { createProfileForUser } from "@/lib/profile/create";
import { isUsernameAvailable } from "@/lib/username-server";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  type RegisterInput,
  type LoginInput,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/lib/validation/auth";
import { ok, fail, fieldErrorsFromZod, type ActionResult } from "@/lib/action-result";

const EMAIL_TOKEN_TTL = 24 * 60 * 60 * 1000; // 24h
const RESET_TOKEN_TTL = 60 * 60 * 1000; // 1h

async function issueEmailVerification(userId: string, email: string) {
  const token = generateToken();
  await db.emailVerificationToken.create({
    data: {
      userId,
      email,
      hashedToken: sha256(token),
      expiresAt: new Date(Date.now() + EMAIL_TOKEN_TTL),
    },
  });
  await sendVerificationEmail(email, absoluteUrl(`/verify-email?token=${token}`));
}

export async function registerAction(
  input: RegisterInput,
): Promise<ActionResult<{ verified: boolean }>> {
  const meta = await getRequestMeta();
  const rl = await limiters.register(meta.ipHash);
  if (!rl.success) return fail("Too many attempts. Try again later.");

  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return fail("Please fix the errors below.", fieldErrorsFromZod(parsed.error));
  const { email, username, password } = parsed.data;

  if (!(await isUsernameAvailable(username))) {
    return fail("That username is taken.", { username: "That username is taken." });
  }
  const existing = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) {
    return fail("An account with this email already exists.", {
      email: "An account with this email already exists.",
    });
  }

  const isAdmin = adminEmails.includes(email);
  const passwordHash = await hashPassword(password);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: isAdmin ? "OWNER" : "USER",
      emailVerified: isAdmin ? new Date() : null,
      lastLoginAt: new Date(),
    },
  });

  await createProfileForUser(user.id, username, { makeDefault: true });

  if (!isAdmin) {
    await issueEmailVerification(user.id, email);
  }

  await db.auditLog.create({
    data: { userId: user.id, action: "auth.register", ipHash: meta.ipHash },
  });

  await startSession(user.id, {
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
    country: meta.country,
  });

  return ok({ verified: isAdmin });
}

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const meta = await getRequestMeta();
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("Enter your email and password.");
  const { email, password } = parsed.data;

  const ipLimit = await limiters.login(meta.ipHash);
  const emailLimit = await limiters.login(`email:${email}`);
  if (!ipLimit.success || !emailLimit.success) {
    return fail("Too many attempts. Please wait a few minutes and try again.");
  }

  const user = await db.user.findUnique({ where: { email } });
  // Generic message to avoid account enumeration.
  const invalid = fail("Invalid email or password.");
  if (!user || !user.passwordHash) return invalid;
  if (user.status === "DELETED" || user.deletedAt) return invalid;

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) return invalid;

  if (user.status === "BANNED") return fail("This account has been banned.");
  if (user.status === "SUSPENDED") return fail("This account is suspended.");

  // Suspicious-login heuristic: notify on a first-seen device/location.
  const seen = await db.session.findFirst({
    where: { userId: user.id, ipHash: meta.ipHash },
    select: { id: true },
  });
  if (!seen) {
    await db.notification.create({
      data: {
        userId: user.id,
        type: "SECURITY",
        title: "New sign-in to your account",
        body: `A new sign-in was detected${meta.country ? ` from ${meta.country}` : ""}. If this wasn't you, reset your password.`,
      },
    });
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await db.auditLog.create({
    data: { userId: user.id, action: "auth.login", ipHash: meta.ipHash },
  });

  await startSession(user.id, {
    ipHash: meta.ipHash,
    userAgent: meta.userAgent,
    country: meta.country,
  });

  return ok(undefined);
}

export async function logoutAction(): Promise<void> {
  const auth = await getAuth();
  if (auth) await invalidateSession(auth.sessionId);
  await clearSessionCookie();
  redirect("/");
}

export async function forgotPasswordAction(
  input: ForgotPasswordInput,
): Promise<ActionResult> {
  const meta = await getRequestMeta();
  const rl = await limiters.passwordReset(meta.ipHash);
  if (!rl.success) return fail("Too many requests. Try again later.");

  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Enter a valid email.");
  const { email } = parsed.data;

  const user = await db.user.findUnique({ where: { email }, select: { id: true } });
  if (user) {
    const token = generateToken();
    await db.passwordResetToken.create({
      data: {
        userId: user.id,
        hashedToken: sha256(token),
        expiresAt: new Date(Date.now() + RESET_TOKEN_TTL),
      },
    });
    await sendPasswordResetEmail(email, absoluteUrl(`/reset-password?token=${token}`));
  }

  // Always report success to avoid revealing whether the email exists.
  return ok(undefined);
}

export async function resetPasswordAction(
  input: ResetPasswordInput,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return fail("Please choose a valid password.", fieldErrorsFromZod(parsed.error));
  }
  const { token, password } = parsed.data;

  const record = await db.passwordResetToken.findUnique({
    where: { hashedToken: sha256(token) },
  });
  if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
    return fail("This reset link is invalid or has expired.");
  }

  const passwordHash = await hashPassword(password);
  await db.$transaction([
    db.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    db.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    db.session.deleteMany({ where: { userId: record.userId } }),
  ]);
  await invalidateUserSessions(record.userId);
  await db.auditLog.create({
    data: { userId: record.userId, action: "auth.password_reset" },
  });

  return ok(undefined);
}

export async function resendVerificationAction(): Promise<ActionResult> {
  const auth = await getAuth();
  if (!auth) return fail("You must be signed in.");
  if (auth.user.emailVerified) return ok(undefined);
  await db.emailVerificationToken.deleteMany({ where: { userId: auth.user.id } });
  await issueEmailVerification(auth.user.id, auth.user.email);
  return ok(undefined);
}

/** Verify an email token (called from the /verify-email route). */
export async function verifyEmailToken(
  token: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (!token) return { ok: false, reason: "Missing token." };
  const record = await db.emailVerificationToken.findUnique({
    where: { hashedToken: sha256(token) },
  });
  if (!record || record.expiresAt.getTime() < Date.now()) {
    return { ok: false, reason: "This verification link is invalid or has expired." };
  }
  await db.$transaction([
    db.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    db.emailVerificationToken.deleteMany({ where: { userId: record.userId } }),
  ]);
  return { ok: true };
}
