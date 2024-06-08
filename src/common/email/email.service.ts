import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import getTransporter from './config';
import enums from 'src/enums';

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendMail(options: MailOptions): Promise<void> {
    const transporter = getTransporter(this.configService);

    await transporter.sendMail({
      from: this.configService.get(enums.CONFIG.SMTP.FROM),
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
