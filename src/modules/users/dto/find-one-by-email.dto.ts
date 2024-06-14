import { z as zod } from 'zod';

export const findOneUserByEmailSchema = {
  body: zod.object({ email: zod.string() }),
};

export type FindOneUserByEmail = zod.infer<
  typeof findOneUserByEmailSchema.body
>;
