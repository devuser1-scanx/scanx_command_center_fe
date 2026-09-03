// features/users/schemas/user-schema.ts

import { z } from "zod";

export const createUserSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email address is required.")
    .email("Enter a valid email address."),

  first_name: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name must not exceed 100 characters."),

  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name must not exceed 100 characters."),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number must not exceed 30 characters.")
    .optional()
    .or(z.literal("")),
});

export type CreateUserFormValues = z.infer<typeof createUserSchema>;
