import { AssumeRoleCommand, AssumeRoleCommandOutput, STSClient } from '@aws-sdk/client-sts';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { EnvSchema } from '../../../config';
import AmazonSTSException, { AmazonSTSError } from '../../exceptions/AmazonSTS.exception';

export type AssumeRoleResponse = {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
};

@Injectable()
export class STSService {
  private readonly stsClient: STSClient;

  constructor(private config: ConfigService<EnvSchema, true>) {
    this.stsClient = new STSClient({
      region: config.get('AWS_REGION'),
      credentials: {
        accessKeyId: this.config.get('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.config.get('AWS_SECRET_ACCESS_KEY'),
      },
    });
  }

  async assumeRole(roleSessionName: string): Promise<AssumeRoleResponse | undefined> {
    const roleARN: string = this.config.get('AWS_ROLE_ARN');

    const command = new AssumeRoleCommand({
      RoleArn: roleARN,
      RoleSessionName: roleSessionName,
      DurationSeconds: 900, // 15 minutes
    });

    try {
      const response: AssumeRoleCommandOutput = await this.stsClient.send(command);

      if (this.isValidAssumeRoleCredential(response.Credentials)) {
        return {
          accessKeyId: response.Credentials.AccessKeyId,
          secretAccessKey: response.Credentials.SecretAccessKey,
          sessionToken: response.Credentials.SessionToken,
        };
      }
    } catch (error) {
      throw new AmazonSTSException(error as AmazonSTSError);
    }
  }

  private isValidAssumeRoleCredential(credentials: AssumeRoleCommandOutput['Credentials']): credentials is {
    AccessKeyId: string;
    SecretAccessKey: string;
    SessionToken: string;
    Expiration: Date;
  } {
    return !!credentials?.AccessKeyId && !!credentials.SecretAccessKey && !!credentials.SessionToken && !!credentials.Expiration;
  }
}
