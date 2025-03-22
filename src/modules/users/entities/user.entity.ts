import { User as UserModel } from '@prisma/client';

/* 
  The intended use for this class is to just pass a return type to key functions (such as findOne),
  and so it does not need its properties initialized in a constructor or anything, that's why the
  definite assignment symbol is being used as a way to suppress typescript errors.

  Again, this class is NOT intended to be used in any way other than offering a type.
*/

export default class User implements UserModel {
  id!: string;
  name!: string;
  email!: string;
  password!: string;
  verified!: boolean;
  accountId!: string;
  createdAt!: Date;
  updatedAt!: Date | null;
  deletedAt!: Date | null;
}
