import { STSService } from '../../../aws/STS/sts.service';

type assumeRole = STSService['assumeRole'];

export type MockSTSService = {
  assumeRole: jest.Mock<ReturnType<assumeRole>, Parameters<assumeRole>>;
};

export default () => {
  return {
    assumeRole: jest.fn(),
  };
};
