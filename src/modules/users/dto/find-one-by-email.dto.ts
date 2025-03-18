import { z as zod } from 'zod';

export const findOneUserByEmailSchema = {
  body: zod.object({ email: zod.string() }),
};

export type FindOneUserByEmailDTO = zod.infer<typeof findOneUserByEmailSchema.body>;
