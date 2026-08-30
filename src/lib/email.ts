import "server-only";
import { env } from "@/lib/env";

interface SendOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Sends email through SMTP when configured, otherwise logs to the console so
 * local development never blocks on an email provider. nodemailer is imported
 * lazily so the driver isn't loaded unless SMTP is actually used.
 */
export async function sendEmail(opts: SendOptions): Promise<void> {
  if (env.EMAIL_DRIVER === "smtp" && env.SMTP_HOST) {
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT ?? 587,
      secure: (env.SMTP_PORT ?? 587) === 465,
      auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
    await transport.sendMail({
      from: env.SMTP_FROM,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return;
  }

  // Console driver — visible in the dev server logs.
  console.info(
    `\n──────────── ✉️  EMAIL (console driver) ────────────\n` +
      `To:      ${opts.to}\n` +
      `Subject: ${opts.subject}\n\n` +
      `${opts.text}\n` +
      `────────────────────────────────────────────────\n`,
  );
}

function layout(title: string, body: string, cta?: { label: string; url: string }): string {
  return `<!doctype html><html><body style="margin:0;background:#0b0b12;font-family:Inter,Arial,sans-serif;color:#e8e8f0;padding:32px">
  <table role="presentation" width="100%" style="max-width:520px;margin:0 auto;background:#14141f;border:1px solid #24243a;border-radius:16px;overflow:hidden">
    <tr><td style="padding:28px 32px 8px">
      <div style="font-size:20px;font-weight:800;letter-spacing:-0.02em">Vyper<span style="color:#7c5cff">.lol</span></div>
    </td></tr>
    <tr><td style="padding:8px 32px 4px"><h1 style="font-size:20px;margin:12px 0">${title}</h1></td></tr>
    <tr><td style="padding:0 32px 12px;color:#a1a1b5;font-size:14px;line-height:1.6">${body}</td></tr>
    ${
      cta
        ? `<tr><td style="padding:12px 32px 28px"><a href="${cta.url}" style="display:inline-block;background:#7c5cff;color:#fff;text-decoration:none;padding:12px 20px;border-radius:10px;font-weight:600;font-size:14px">${cta.label}</a></td></tr>`
        : ""
    }
    <tr><td style="padding:16px 32px;border-top:1px solid #24243a;color:#6b6b80;font-size:12px">If you didn't request this, you can safely ignore this email.</td></tr>
  </table></body></html>`;
}

export async function sendVerificationEmail(to: string, url: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Verify your Vyper email",
    text: `Confirm your email to activate your Vyper account:\n${url}`,
    html: layout(
      "Confirm your email",
      "Welcome to Vyper. Confirm your email address to activate your account and publish your profile.",
      { label: "Verify email", url },
    ),
  });
}

export async function sendPasswordResetEmail(to: string, url: string): Promise<void> {
  await sendEmail({
    to,
    subject: "Reset your Vyper password",
    text: `Reset your password using this link (valid 1 hour):\n${url}`,
    html: layout(
      "Reset your password",
      "We received a request to reset your password. This link is valid for one hour.",
      { label: "Reset password", url },
    ),
  });
}
