import * as bcrypt from 'bcrypt';

export default () => {
  return bcrypt as jest.Mocked<typeof bcrypt>;
};
