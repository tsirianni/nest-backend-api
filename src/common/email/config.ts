import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import enums from 'src/enums';

export default function getTransporter(
  configService: ConfigService,
): nodemailer.Transporter {
  const transporter = nodemailer.createTransport({
    host: configService.get(enums.CONFIG.SMTP.HOST),
    port: configService.get(enums.CONFIG.SMTP.PORT),
    auth: {
      user: configService.get(enums.CONFIG.SMTP.AUTH.USER),
      pass: configService.get(enums.CONFIG.SMTP.AUTH.PASSWORD),
    },
  });

  return transporter;
}
