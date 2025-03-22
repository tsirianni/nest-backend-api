import { DownloadAttachmentDTO, downloadAttachmentSchema } from './download.dto';
import { CreateAttachmentDTO, createAttachmentSchema } from './create.dto';
import { DeleteAttachmentDTO, deleteAttachmentSchema } from './delete.dto';
import { DownloadAttachmentResponseDTO } from './download.response.dto';
import { CreateAttachmentResponseDTO } from './create.response.dto';

export type AttachmentDTOs = {
  create: CreateAttachmentDTO;
  download: DownloadAttachmentDTO;
  delete: DeleteAttachmentDTO;
};

export type AttachmentResponseDTOs = {
  create: CreateAttachmentResponseDTO;
  download: DownloadAttachmentResponseDTO;
};

export default {
  create: createAttachmentSchema,
  download: downloadAttachmentSchema,
  delete: deleteAttachmentSchema,
};
