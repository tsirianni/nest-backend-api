import { Test, TestingModule } from '@nestjs/testing';

import { CipherService } from '../../common/cipher/cipher.service';
import { AttachmentDTOs, AttachmentResponseDTOs } from './dto';
import { AttachmentController } from './attachment.controller';
import { PrismaService } from '../../common/database/prisma';
import { S3Service } from '../../common/aws/S3/s3.service';
import { AttachmentService } from './attachment.service';
import * as mocks from '../../common/testing/mocks';
import { AuthenticatedRequest } from '../auth/dto';
import { getMockReq } from '@jest-mock/express';
import { ConfigService } from '@nestjs/config';

describe('AttachmentsController', () => {
  let controller: AttachmentController;
  let attachmentService: mocks.MockAttachmentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AttachmentController],
      providers: [
        {
          provide: AttachmentService,
          useValue: mocks.createAttachmentService(),
        },
        {
          provide: ConfigService,
          useValue: mocks.createConfigService(),
        },
        {
          provide: CipherService,
          useValue: mocks.createCipherService(),
        },
        {
          provide: S3Service,
          useValue: mocks.createS3Service(),
        },
        {
          provide: PrismaService,
          useValue: mocks.prismaMock,
        },
      ],
    }).compile();

    controller = module.get<AttachmentController>(AttachmentController);
    attachmentService = module.get<mocks.MockAttachmentService>(AttachmentService);
  });

  describe('create', () => {
    let request: AuthenticatedRequest;
    let mockCreateAttachmentReturn: AttachmentResponseDTOs['create'][];

    beforeEach(() => {
      // @ts-expect-error Type from getMockReq is missing some non-required properties
      request = {
        ...getMockReq({ body: { files: [] } }),
        user: {
          id: '756e1900-5f48-422e-be17-f21e7657b967',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          accountId: '312e4607-2c5d-493f-821d-7232b1419db8',
          createdAt: new Date().toISOString(),
        },
      };

      mockCreateAttachmentReturn = [
        {
          id: '{{encryptedId}}',
          key: '{{encryptedKey}}',
        },
      ];
    });

    it('should return the response from "attachmentService.create"', async () => {
      attachmentService.create.mockResolvedValueOnce(mockCreateAttachmentReturn);

      const response = await controller.create(request);

      expect(response).toStrictEqual([
        {
          id: mockCreateAttachmentReturn[0].id,
          key: mockCreateAttachmentReturn[0].key,
        },
      ]);
    });
  });

  describe('download', () => {
    let request: AuthenticatedRequest;
    let mockDownloadAttachmentReturn: AttachmentResponseDTOs['download'];

    beforeEach(() => {
      // @ts-expect-error Type from getMockReq is missing some non-required properties
      request = {
        ...getMockReq({ params: { id: '{{encryptedId}}' } }),
        user: {
          id: '756e1900-5f48-422e-be17-f21e7657b967',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          accountId: '312e4607-2c5d-493f-821d-7232b1419db8',
          createdAt: new Date().toISOString(),
        },
      };

      mockDownloadAttachmentReturn = {
        url: 'https://theCorrectUrl.com',
      };
    });

    it('should return the response from "attachmentService.download"', async () => {
      attachmentService.download.mockResolvedValueOnce(mockDownloadAttachmentReturn);

      const response = await controller.download(request, request.params as AttachmentDTOs['download']);

      expect(response).toStrictEqual({
        url: mockDownloadAttachmentReturn.url,
      });
    });
  });

  describe('delete', () => {
    let request: AuthenticatedRequest;

    beforeEach(() => {
      // @ts-expect-error Type from getMockReq is missing some non-required properties
      request = {
        ...getMockReq({ params: { id: '{{encryptedId}}' } }),
        user: {
          id: '756e1900-5f48-422e-be17-f21e7657b967',
          name: 'John Doe',
          email: 'john.doe@gmail.com',
          accountId: '312e4607-2c5d-493f-821d-7232b1419db8',
          createdAt: new Date().toISOString(),
        },
      };
    });

    it('should return the response from "attachmentService.delete"', async () => {
      attachmentService.delete.mockResolvedValueOnce();

      await expect(controller.delete(request, request.params as AttachmentDTOs['delete'])).resolves.toBeUndefined();
    });
  });
});
