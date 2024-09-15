import { z as zod } from 'zod';

export const findOneUserByIdSchema = {
  params: zod.object({ id: zod.string() }),
};

export type FindOneUserByIdDTO = zod.infer<typeof findOneUserByIdSchema.params>;
