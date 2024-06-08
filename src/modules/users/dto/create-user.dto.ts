import { z as zod } from 'zod';
import enums from 'src/enums';

type profileType = (typeof enums.PROFILE_TYPE)[keyof typeof enums.PROFILE_TYPE];
const profileTypeEnum = [...Object.values(enums.PROFILE_TYPE)] as [
  string,
  ...string[],
];

export class CreateUserBodyDto {
  public email: string | undefined;
  public password: string | undefined;
  public profileType: profileType | undefined;
}

export class CreateUserIdDto {
  public id: number | undefined;
}

export const createUserDtoSchema = {
  params: zod.object({ id: zod.string() }).strict(),
  body: zod
    .object({
      email: zod.string().email(),
      // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
      password: zod
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          { message: 'Invalid password format' },
        ),
      profileType: zod.enum(profileTypeEnum),
    })
    .strict(),
  // query: zod.object({
  //   page: zod.number().positive().optional(),
  //   limit: zod.number().positive().optional(),
  // }),
};
