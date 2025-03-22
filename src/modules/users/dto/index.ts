import { ValidateSignUpDTO, validateSignUpSchema } from './validate-sign-up';
import { CreateUserDTO, createUserDtoSchema } from './create.dto';
import { FindOneUserByEmailDTO, findOneUserByEmailSchema } from './find-one-by-email.dto';
import { FindOneUserByIdDTO, findOneUserByIdSchema } from './find-one-by-id.dto';

export type UserDTOs = {
  findOneByEmail: FindOneUserByEmailDTO;
  validateSignUp: ValidateSignUpDTO;
  findOneById: FindOneUserByIdDTO;
  createUser: CreateUserDTO;
};

export default {
  findOneByEmail: findOneUserByEmailSchema,
  validateSignUp: validateSignUpSchema,
  findOneById: findOneUserByIdSchema,
  createUser: createUserDtoSchema,
};
