import { z as zod } from 'zod';

export const createUserDtoSchema = {
  body: zod
    .object({
      name: zod.string(),
      email: zod.string().email(),
      // Minimum eight characters, at least one uppercase letter, one lowercase letter, one number and one special character
      password: zod
        .string()
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, { message: 'Invalid password format' }),
    })
    .strict(),
};

export type CreateUserDTO = zod.infer<typeof createUserDtoSchema.body>;
