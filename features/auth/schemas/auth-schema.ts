// features/auth/schemas/auth-schema.ts

import { z } from "zod";

const passwordSchema = z
  .string()
  .min(1, "Password is required.")
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must not exceed 128 characters.");

const strongPasswordSchema = z
  .string()
  .min(1, "New password is required.")
  .min(8, "Password must contain at least 8 characters.")
  .max(128, "Password must not exceed 128 characters.")
  .regex(
    /[A-Z]/,
    "Password must contain at least one uppercase letter.",
  )
  .regex(
    /[a-z]/,
    "Password must contain at least one lowercase letter.",
  )
  .regex(
    /[0-9]/,
    "Password must contain at least one number.",
  )
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character.",
  );

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),

  password: passwordSchema,
});

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),
});

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Current password is required."),

    new_password: strongPasswordSchema,

    confirm_password: z
      .string()
      .min(1, "Confirm your new password."),
  })
  .refine(
    (values) =>
      values.new_password === values.confirm_password,
    {
      message: "New password and confirmation do not match.",
      path: ["confirm_password"],
    },
  )
  .refine(
    (values) =>
      values.current_password !== values.new_password,
    {
      message:
        "New password must be different from the current password.",
      path: ["new_password"],
    },
  );

export const resetPasswordSchema = z
  .object({
    token: z
      .string()
      .min(1, "Password reset token is missing."),

    new_password: strongPasswordSchema,

    confirm_password: z
      .string()
      .min(1, "Confirm your new password."),
  })
  .refine(
    (values) =>
      values.new_password === values.confirm_password,
    {
      message: "New password and confirmation do not match.",
      path: ["confirm_password"],
    },
  );

/**
 * Types automatically generated from the Zod schemas.
 *
 * These types will be used by React Hook Form.
 */
export type LoginFormValues = z.infer<
  typeof loginSchema
>;

export type ForgotPasswordFormValues = z.infer<
  typeof forgotPasswordSchema
>;

export type ChangePasswordFormValues = z.infer<
  typeof changePasswordSchema
>;

export type ResetPasswordFormValues = z.infer<
  typeof resetPasswordSchema
>;