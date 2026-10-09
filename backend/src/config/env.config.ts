import dotenv from "dotenv";
import { z } from "zod";

dotenv.config({
  path: "./.env",
});

const envSchema = z.object({
  PORT: z.coerce.number(),
  NODE_ENV: z.enum(["development", "production", "test"]),
  FRONTEND_URL: z.url(),
  DATABASE_URL: z.string(),
  ADMIN_EMAIL: z.email("Invalid admin email"),
  ADMIN_PASSWORD: z
    .string()
    .min(8, "Admin password must be atleast 8 characters")
    .max(20, "Admin password can't be greater than 20 characters"),
  SALT_ROUND: z.coerce.number(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES: z.string(),
  REFRESH_TOKEN_EXPIRES: z.string(),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error(
    "Invalid environment variables: ",
    z.treeifyError(parsedEnv.error),
  );

  process.exit(1);
}

export const env = parsedEnv.data;
