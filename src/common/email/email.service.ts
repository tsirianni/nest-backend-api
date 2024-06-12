import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import assembleTemplate from './assemble-template';
import { EnvSchema } from 'src/config';

interface MailOptions {
  to: string;
  templateId: number;
  templateArgs: any;
}

@Injectable()
export class EmailService {
  constructor(private config: ConfigService<EnvSchema, true>) {}

  async sendMail(options: MailOptions): Promise<void> {
    const transporter = this.getTransporter();
    const { html, subject } = assembleTemplate(
      options.templateId,
      options.templateArgs,
    );

    await transporter.sendMail({
      from: this.config.get('SMTP_FROM'),
      to: options.to,
      subject,
      html,
    });
  }

  getTransporter(): nodemailer.Transporter {
    const transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: this.config.get('SMTP_PORT'),
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASSWORD'),
      },
    });

    return transporter;
  }
}
