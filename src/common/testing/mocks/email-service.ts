import { EmailService } from '../../email';

type sendMail = EmailService['sendMail'];
type getTransporter = EmailService['getTransporter'];

export type MockEmailService = {
  sendMail: jest.Mock<ReturnType<sendMail>, Parameters<sendMail>>;
  getTransporter: jest.Mock<ReturnType<getTransporter>, Parameters<getTransporter>>;
};

export default () => {
  return {
    sendMail: jest.fn(),
    getTransporter: jest.fn(),
  };
};
