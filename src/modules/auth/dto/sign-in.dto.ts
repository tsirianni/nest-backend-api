import { z as zod } from 'zod';

export const signInSchema = {
  body: zod.object({
    username: zod.string(),
    password: zod.string(),
  }),
};

export type SignInDTO = zod.infer<typeof signInSchema.body>;
