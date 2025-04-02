import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { CipherService } from '../../common/cipher/cipher.service';
import * as mocks from '../../common/testing/mocks';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserDTOs } from './dto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: mocks.MockUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mocks.createUsersService(),
        },
        {
          provide: ConfigService,
          useValue: mocks.createConfigService(),
        },
        {
          provide: CipherService,
          useValue: mocks.createCipherService(),
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<mocks.MockUsersService>(UsersService);
  });

  describe('create', () => {
    let payload: UserDTOs['createUser'];

    beforeEach(() => {
      payload = {
        name: 'John Doe',
        email: 'john.doe@email.com',
        password: 'superSecretPassword',
      };
    });

    it('should call "usersService.create" with the provided payload', async () => {
      await controller.create(payload);

      expect(usersService.create).toHaveBeenCalledWith(payload);
    });
  });

  describe('validateSignUp', () => {
    let payload: UserDTOs['validateSignUp'];

    beforeEach(() => {
      payload = {
        email: 'john.doe@email.com',
        code: '684742',
      };
    });

    it('should call "usersService.validateSignUp" with the provided payload', async () => {
      await controller.validateSignUp(payload);

      expect(usersService.validateSignUp).toHaveBeenCalledWith(payload);
    });
  });

  describe('findOne', () => {
    let payload: UserDTOs['findOneById'];

    beforeEach(() => {
      payload = {
        id: '{{encryptedID}}',
      };
    });

    it('should call "usersService.validateSignUp" with the provided payload', async () => {
      await controller.findOne(payload);

      expect(usersService.findOneById).toHaveBeenCalledWith(payload);
    });
  });
});
