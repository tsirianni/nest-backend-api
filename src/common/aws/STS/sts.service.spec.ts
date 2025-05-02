import { AssumeRoleCommand, AssumeRoleCommandOutput, STSClient, STSServiceException } from '@aws-sdk/client-sts';
import { Test, TestingModule } from '@nestjs/testing';
import { mockClient } from 'aws-sdk-client-mock';

import { STSService } from './sts.service';
import { ConfigService } from '@nestjs/config';
import * as mocks from '../../testing/mocks';
import AmazonSTSException from '../../exceptions/AmazonSTS.exception';

describe('STS Service', () => {
  let stsService: STSService;
  const mockedSTSClient = mockClient(STSClient);

  beforeEach(async () => {
    const configService = mocks.createConfigService();

    configService.get.mockReturnValueOnce('{region}');
    configService.get.mockReturnValueOnce('{accessKeyId}');
    configService.get.mockReturnValueOnce('{secretAccessKey}');
    configService.get.mockReturnValue('arn:aws:iam::123456789012:role/FakeRoleName');

    const module: TestingModule = await Test.createTestingModule({
      providers: [STSService, { provide: ConfigService, useValue: configService }],
    }).compile();

    stsService = module.get(STSService);
  });

  describe('assumeRole', () => {
    let mockedAssumeRoleOutput: AssumeRoleCommandOutput;

    beforeEach(() => {
      mockedAssumeRoleOutput = {
        $metadata: {},
        Credentials: {
          AccessKeyId: '{accessKeyId}',
          SecretAccessKey: '{sessionToken}',
          SessionToken: '{secretAccessKey}',
          Expiration: new Date(),
        },
      };
    });

    it('should return the credentials', async () => {
      mockedSTSClient.on(AssumeRoleCommand).resolves(mockedAssumeRoleOutput);

      const response = await stsService.assumeRole('testing session');

      expect(response).toStrictEqual({
        accessKeyId: mockedAssumeRoleOutput.Credentials?.AccessKeyId,
        secretAccessKey: mockedAssumeRoleOutput.Credentials?.SecretAccessKey,
        sessionToken: mockedAssumeRoleOutput.Credentials?.SessionToken,
      });
    });

    it('should throw an AmazonSTSException if the request fails', async () => {
      const mockedError = new STSServiceException({
        message: 'Some internal error message',
        $metadata: {},
        $fault: 'server',
        name: 'STSServiceException',
      });
      mockedSTSClient.on(AssumeRoleCommand).rejects(mockedError);

      try {
        await stsService.assumeRole('testing session');
      } catch (error) {
        expect(error).toBeInstanceOf(AmazonSTSException);
        expect((error as AmazonSTSException).message).toStrictEqual(mockedError.message);
      }
    });
  });
});
