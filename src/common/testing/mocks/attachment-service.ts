import { AttachmentService } from '../../../modules/attachment/attachment.service';

type createAttachment = AttachmentService['create'];
type downloadAttachment = AttachmentService['download'];
type deleteAttachment = AttachmentService['delete'];

export type MockAttachmentService = {
  create: jest.Mock<ReturnType<createAttachment>, Parameters<createAttachment>>;
  download: jest.Mock<ReturnType<downloadAttachment>, Parameters<downloadAttachment>>;
  delete: jest.Mock<ReturnType<deleteAttachment>, Parameters<deleteAttachment>>;
};

export default () => {
  return {
    create: jest.fn(),
    download: jest.fn(),
    delete: jest.fn(),
  };
};
