import { CreateAttachmentDTO, createAttachmentSchema } from './create.dto';

export type AttachmentDTOs = {
  create: CreateAttachmentDTO;
};

export default {
  create: createAttachmentSchema,
};
