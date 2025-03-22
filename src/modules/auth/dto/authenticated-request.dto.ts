import { Request } from 'express';
import { SignedInUserDto } from './signed-in-user.dto';

export interface AuthenticatedRequest extends Request {
  user: SignedInUserDto;
}
