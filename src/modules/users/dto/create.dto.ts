import { z as zod } from 'zod';
import enums from 'src/enums';

const userTypes = {
  TECHNICAL: enums.USER_TYPE.TECHNICAL,
  NON_TECHNICAL: enums.USER_TYPE.NON_TECHNICAL,
} as const;

export const createUserDtoSchema = {
  body: zod
    .object({
      name: zod.string(),
      email: zod.string().email(),
      // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
      password: zod
        .string()
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
          { message: 'Invalid password format' },
        ),
      profileType: zod.nativeEnum(userTypes),
    })
    .strict(),
};

export type CreateUserDto = zod.infer<typeof createUserDtoSchema.body>;
