import { z } from "zod";

// User Register Schema
export const registerUserSchema = z
  .object({
    email: z.email("Invalid email").trim().toLowerCase(),
    password: z
      .string()
      .min(5, "Password should have atleast 5 characters")
      .max(20, "Password can't be more than 20 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  })
  .strict();

// User Login Schema
export const loginUserSchema = z
  .object({
    email: z.email("Invalid email").trim().toLowerCase(),
    password: z.string(),
  })
  .strict();

export type registerUserDTO = z.infer<typeof registerUserSchema>;
export type loginUserDTO = z.infer<typeof loginUserSchema>;
