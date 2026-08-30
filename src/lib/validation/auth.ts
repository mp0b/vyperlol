import { z } from "zod";
import { validateUsernameFormat } from "@/lib/username";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .email("Enter a valid email address")
  .max(200);

export const passwordSchema = z
  .string()
  .min(8, "At least 8 characters")
  .max(200, "Password is too long");

export const usernameSchema = z
  .string()
  .trim()
  .refine((v) => validateUsernameFormat(v).ok, (v) => {
    const check = validateUsernameFormat(v);
    return { message: check.ok ? "" : check.reason };
  });

export const registerSchema = z.object({
  email: emailSchema,
  username: usernameSchema,
  password: passwordSchema,
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({ email: emailSchema });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(10),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
