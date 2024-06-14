import { z as zod } from 'zod';

export const findOneUserSchema = {
  params: zod.object({ id: zod.string() }),
};

export type FindOneUserParams = zod.infer<typeof findOneUserSchema.params>;
