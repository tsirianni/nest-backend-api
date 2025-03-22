import { Request } from 'express';

import { SignInDTO, signInSchema } from './sign-in.dto';
import { SignedInUserDTO } from './signed-in-user.dto';

export type AuthDTOs = {
  signIn: SignInDTO;
};

export default {
  signIn: signInSchema,
};

export interface AuthenticatedRequest extends Request {
  user: SignedInUserDTO;
}
