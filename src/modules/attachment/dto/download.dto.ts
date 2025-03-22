import { z as zod } from 'zod';

export const downloadAttachmentSchema = {
  params: zod.object({
    id: zod.string().uuid(),
  }),
};

export type DownloadAttachmentDTO = zod.infer<typeof downloadAttachmentSchema.params>;
