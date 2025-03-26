import { UsersService } from '../../../modules/users/users.service';

type findOneByEmail = UsersService['findOneByEmail'];
type findOneById = UsersService['findOneById'];
type validateSignUp = UsersService['validateSignUp'];
type create = UsersService['create'];

export type MockUsersService = {
  findOneByEmail: jest.Mock<ReturnType<findOneByEmail>, Parameters<findOneByEmail>>;
  findOneById: jest.Mock<ReturnType<findOneById>, Parameters<findOneById>>;
  validateSignUp: jest.Mock<ReturnType<validateSignUp>, Parameters<validateSignUp>>;
  create: jest.Mock<ReturnType<create>, Parameters<create>>;
};

export default () => {
  return {
    findOneByEmail: jest.fn(),
    findOneById: jest.fn(),
    validateSignUp: jest.fn(),
    create: jest.fn(),
  };
};
