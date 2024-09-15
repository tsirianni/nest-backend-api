import { SignInDTO, signInSchema } from './sign-in.dto';

export type AuthDTOs = {
  signIn: SignInDTO;
};

export default {
  signIn: signInSchema,
};
