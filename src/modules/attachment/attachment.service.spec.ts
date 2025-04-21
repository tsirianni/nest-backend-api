import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';

import { DatabaseException, NotFoundException } from '../../common/exceptions';
import { errorCodes, PrismaService } from '../../common/database/prisma';
import { CipherService } from '../../common/cipher/cipher.service';
import { SignedInUserDTO } from '../auth/dto/signed-in-user.dto';
import { AttachmentDTOs, AttachmentResponseDTOs } from './dto';
import { S3Service } from '../../common/aws/S3/s3.service';
import { AttachmentService } from './attachment.service';
import * as mocks from '../../common/testing/mocks';
import * as entities from '../../common/entities';
import { FILE_MIMETYPE } from '../../enums';

describe('attachmentsService', () => {
  const configService = mocks.createConfigService();
  const attachmentsBucketName = '{{awsAttachmentsBucketName}}';
  let cipherService: mocks.MockCipherService;
  let attachmentsService: AttachmentService;
  let database: typeof mocks.prismaMock;
  let s3Service: mocks.MockS3Service;
  let user: SignedInUserDTO;

  beforeEach(async () => {
    configService.get.mockReturnValueOnce(attachmentsBucketName);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        { provide: CipherService, useValue: mocks.createCipherService() },
        {
          provide: ConfigService,
          useValue: configService,
        },
        {
          provide: CipherService,
          useValue: mocks.createCipherService(),
        },
        {
          provide: PrismaService,
          useValue: mocks.prismaMock,
        },
        {
          provide: S3Service,
          useValue: mocks.createS3Service(),
        },
      ],
    }).compile();

    attachmentsService = module.get<AttachmentService>(AttachmentService);
    cipherService = module.get<mocks.MockCipherService>(CipherService);
    database = module.get<typeof mocks.prismaMock>(PrismaService);
    s3Service = module.get<mocks.MockS3Service>(S3Service);

    user = {
      id: 'ea2e66ec-be53-44ed-a0b6-138f2b0c4412',
      accountId: '8a809065-87e2-492b-b5d6-495c5236bad5',
      createdAt: new Date().toISOString(),
      email: 'john.doe@gmail.com',
      name: 'John Doe',
    };

    // Necessary to test logic inside the transaction
    jest.spyOn(database, '$transaction').mockImplementation((callback) => {
      return callback(database);
    });
  });

  describe('create', () => {
    let files: AttachmentDTOs['create']['files'];
    let mockCreateUploadedFileReturn: entities.UploadedFile;
    let encryptedUploadedFileId: string;
    let encryptedUploadedFileKey: string;

    beforeEach(() => {
      files = [
        {
          parsedFilename: 'dummy.pdf',
          originalName: 'dummy.pdf',
          size: 10000,
          buffer: Buffer.from('some file data'),
          mimeType: FILE_MIMETYPE.PDF,
          extension: FILE_MIMETYPE.PDF,
        },
      ];

      mockCreateUploadedFileReturn = {
        id: '9d11b812-33c2-4cc3-ba2c-1a4eb586aa9e',
        extension: files[0].extension,
        originalName: files[0].originalName,
        key: '9a26fc5e-46b2-4e44-b7c7-58994a9925bc',
        owner: user.accountId,
        name: files[0].parsedFilename,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      encryptedUploadedFileId = '{{encryptedUploadedFileId}}';
      encryptedUploadedFileKey = '{{encryptedUploadedFileKey}}';
    });

    it('should return the created uploaded files details', async () => {
      database.uploadedFile.create.mockResolvedValueOnce(mockCreateUploadedFileReturn);
      s3Service.uploadS3Object.mockResolvedValueOnce();
      cipherService.encryptUUID.mockReturnValueOnce(encryptedUploadedFileId);
      cipherService.encryptUUID.mockReturnValueOnce(encryptedUploadedFileKey);

      const response = await attachmentsService.create(files, user);

      expect(response).toStrictEqual([
        {
          id: encryptedUploadedFileId,
          key: encryptedUploadedFileKey,
        },
      ]);
    });

    it('should throw a DatabaseException if any occurs', async () => {
      const mockedPrismaError = new Prisma.PrismaClientKnownRequestError('Null constraint violation on the {constraint}', {
        code: errorCodes.NULL_CONSTRAINT_FAILED,
        clientVersion: '1.0.0',
      });
      database.uploadedFile.create.mockRejectedValueOnce(mockedPrismaError);

      try {
        await attachmentsService.create(files, user);
      } catch (error) {
        expect(error).toBeInstanceOf(DatabaseException);
      }
    });

    it('should throw the error returned by the S3 service if any', async () => {
      database.uploadedFile.create.mockResolvedValueOnce(mockCreateUploadedFileReturn);
      s3Service.uploadS3Object.mockRejectedValueOnce(new Error('BucketNotFound'));

      try {
        await attachmentsService.create(files, user);
      } catch (error) {
        expect(error).not.toBeInstanceOf(DatabaseException);
      }
    });

    describe('Transaction Validation', () => {
      it('should create the transaction with an isolation level of REPEATABLE READ', async () => {
        database.uploadedFile.create.mockResolvedValueOnce(mockCreateUploadedFileReturn);
        s3Service.uploadS3Object.mockResolvedValueOnce();
        cipherService.encryptUUID.mockReturnValueOnce(encryptedUploadedFileId);
        cipherService.encryptUUID.mockReturnValueOnce(encryptedUploadedFileKey);

        await attachmentsService.create(files, user);

        expect(database.$transaction.mock.calls[0][1]).toStrictEqual({
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        });
      });
    });
  });

  describe('download', () => {
    let attachmentId: string;
    let mockFindUniqueUploadedFileReturn: { key: string };
    let mockGetS3ObjectUrlReturn: AttachmentResponseDTOs['download'];

    beforeEach(() => {
      attachmentId = '540f2984-1768-4d27-be02-3ee5e34d9f92';

      mockFindUniqueUploadedFileReturn = { key: '14e32a01-be45-4bb6-ae59-5536823475a8' };

      mockGetS3ObjectUrlReturn = {
        url: 'https://theCorrectUrl.com',
      };
    });

    it('should return the url to download the attachment', async () => {
      database.uploadedFile.findUnique.mockResolvedValueOnce(mockFindUniqueUploadedFileReturn as entities.UploadedFile);
      s3Service.getS3ObjectUrl.mockResolvedValueOnce(mockGetS3ObjectUrlReturn);

      const response = await attachmentsService.download(attachmentId, user);

      expect(response).toStrictEqual(mockGetS3ObjectUrlReturn);
    });

    it('should throw a NotFoundException if no attachment is found', async () => {
      database.uploadedFile.findUnique.mockResolvedValueOnce(null);

      try {
        await attachmentsService.download(attachmentId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });
  });

  describe('delete', () => {
    let attachmentId: string;
    let mockFindUniqueUploadedFileReturn: { key: string };

    beforeEach(() => {
      attachmentId = '540f2984-1768-4d27-be02-3ee5e34d9f92';

      mockFindUniqueUploadedFileReturn = { key: '14e32a01-be45-4bb6-ae59-5536823475a8' };
    });

    it('should attempt to delete the object from S3 bucket', async () => {
      database.uploadedFile.findUnique.mockResolvedValueOnce(mockFindUniqueUploadedFileReturn as entities.UploadedFile);
      s3Service.deleteS3Object.mockResolvedValueOnce();

      await attachmentsService.delete(attachmentId, user);

      expect(s3Service.deleteS3Object).toHaveBeenCalledWith(attachmentsBucketName, mockFindUniqueUploadedFileReturn.key);
    });

    it('should throw a NotFoundException if no attachment is found', async () => {
      database.uploadedFile.findUnique.mockResolvedValueOnce(null);

      try {
        await attachmentsService.delete(attachmentId, user);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
      }
    });

    describe('Transaction Validation', () => {
      it('should open the transaction with an isolation level of REPEATABLE READ', async () => {
        database.uploadedFile.findUnique.mockResolvedValueOnce(mockFindUniqueUploadedFileReturn as entities.UploadedFile);
        s3Service.deleteS3Object.mockResolvedValueOnce();

        await attachmentsService.delete(attachmentId, user);

        expect(database.$transaction.mock.calls[0][1]).toStrictEqual({
          isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        });
      });
    });
  });
});
