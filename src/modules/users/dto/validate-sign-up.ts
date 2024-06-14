import { z as zod } from 'zod';

export const validateSignUpSchema = {
  body: zod.object({ email: zod.string().email(), code: zod.string() }),
};

export type ValidateSignUp = zod.infer<typeof validateSignUpSchema.body>;
