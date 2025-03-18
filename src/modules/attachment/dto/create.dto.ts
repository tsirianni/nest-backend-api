import { z as zod } from 'zod';

export const createAttachmentSchema = {
  body: zod.object({
    files: zod.array(
      zod.object({
        buffer: zod.instanceof(Buffer),
        mimeType: zod.string(),
        extension: zod.string(),
        size: zod.number(),
        originalName: zod.string(),
        parsedFilename: zod.string(),
      }),
    ),
  }),
};

export type CreateAttachmentDTO = zod.infer<typeof createAttachmentSchema.body>;
