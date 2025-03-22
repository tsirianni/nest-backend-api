import { Request } from 'express';
import { SignedInUserDTO } from './signed-in-user.dto';

export interface AuthenticatedRequest extends Request {
  user: SignedInUserDTO;
}
