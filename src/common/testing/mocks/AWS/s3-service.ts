import { S3Service } from '../../../aws/S3/s3.service';

type uploadS3Object = S3Service['uploadS3Object'];
type getS3ObjectUrl = S3Service['getS3ObjectUrl'];
type deleteS3Object = S3Service['deleteS3Object'];

export type MockS3Service = {
  uploadS3Object: jest.Mock<ReturnType<uploadS3Object>, Parameters<uploadS3Object>>;
  getS3ObjectUrl: jest.Mock<ReturnType<getS3ObjectUrl>, Parameters<getS3ObjectUrl>>;
  deleteS3Object: jest.Mock<ReturnType<deleteS3Object>, Parameters<deleteS3Object>>;
};

export default () => {
  return {
    uploadS3Object: jest.fn(),
    getS3ObjectUrl: jest.fn(),
    deleteS3Object: jest.fn(),
  };
};
