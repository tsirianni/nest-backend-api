import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import enums from 'src/enums';
import assembleTemplate from './assemble-template';

interface MailOptions {
  to: string;
  templateId: number;
  templateArgs: any;
}

@Injectable()
export class EmailService {
  constructor(private config: ConfigService) {}

  async sendMail(options: MailOptions): Promise<void> {
    const transporter = this.getTransporter();
    const { html, subject } = assembleTemplate(
      options.templateId,
      options.templateArgs,
    );

    await transporter.sendMail({
      from: this.config.get(enums.CONFIG.SMTP.FROM),
      to: options.to,
      subject,
      html,
    });
  }

  getTransporter(): nodemailer.Transporter {
    const transporter = nodemailer.createTransport({
      host: this.config.get(enums.CONFIG.SMTP.HOST),
      port: this.config.get(enums.CONFIG.SMTP.PORT),
      auth: {
        user: this.config.get(enums.CONFIG.SMTP.AUTH.USER),
        pass: this.config.get(enums.CONFIG.SMTP.AUTH.PASSWORD),
      },
    });

    return transporter;
  }
}
