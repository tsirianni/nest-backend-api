import { z as zod } from 'zod';

export const downloadAttachmentSchema = {
  params: zod.object({
    id: zod.string(),
  }),
};

export type DownloadAttachmentDTO = zod.infer<typeof downloadAttachmentSchema.params>;
