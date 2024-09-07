import { z as zod } from 'zod';

export const envSchema = zod.object({
  NODE_ENV: zod.string(),
  API_DOMAIN: zod.string(),
  API_PORT: zod.coerce.number().optional().default(4000),
  ALLOWED_ORIGINS: zod.string(),

  // SMTP Config
  SMTP_HOST: zod.string(),
  SMTP_PORT: zod.coerce.number().default(587),
  SMTP_SECURE: zod.coerce.boolean(),
  SMTP_USER: zod.string(),
  SMTP_PASSWORD: zod.string(),
  SMTP_FROM: zod.string(),

  // Database
  DATABASE_URL: zod.string(),
  DATABASE_USER: zod.string(),
  DATABASE_PASSWORD: zod.coerce.number(),
  DATABASE_NAME: zod.string(),

  // JWT
  JWT_PUBLIC_KEY: zod.string(),
  JWT_PRIVATE_KEY: zod.string(),

  // BCRYPT
  BCRYPT_ROUNDS: zod.coerce.number().optional().default(8),
});

export type EnvSchema = zod.infer<typeof envSchema>;
