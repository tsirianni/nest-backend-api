import { z as zod } from 'zod';

export const deleteAttachmentSchema = {
  params: zod.object({
    id: zod.string(),
  }),
};

export type DeleteAttachmentDTO = zod.infer<typeof deleteAttachmentSchema.params>;
