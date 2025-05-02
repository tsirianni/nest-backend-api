import { z as zod } from 'zod';
import { getCiphers } from 'crypto';

const cryptoCiphers = getCiphers();

export const envSchema = zod.object({
  NODE_ENV: zod.string(),
  API_DOMAIN: zod.string(),
  API_PORT: zod.coerce.number().optional().default(4000),
  ALLOWED_ORIGINS: zod.string(),
  ACCESS_TOKEN_EXPIRATION_TIME: zod.string(),
  REFRESH_TOKEN_EXPIRATION_TIME: zod.string(),

  // Encryption
  UUID_CIPHER_ALGORITHM: zod.union(
    cryptoCiphers.map((name) => zod.literal(name)) as [zod.ZodLiteral<string>, zod.ZodLiteral<string[]>],
  ),
  UUID_CIPHER_KEY: zod.string().length(64, 'Invalid cipher secret (must be 64 hex chars)'),

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

  // AWS
  AWS_ACCESS_KEY_ID: zod.string(),
  AWS_SECRET_ACCESS_KEY: zod.string(),
  AWS_REGION: zod.string(),
  AWS_ATTACHMENTS_BUCKET: zod.string(),
  AWS_ROLE_ARN: zod.string(),
});

export type EnvSchema = zod.infer<typeof envSchema>;
