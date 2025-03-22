import { z as zod } from 'zod';

export const deleteAttachmentSchema = {
  params: zod.object({
    id: zod.string().uuid(),
  }),
};

export type DeleteAttachmentDTO = zod.infer<typeof deleteAttachmentSchema.params>;
