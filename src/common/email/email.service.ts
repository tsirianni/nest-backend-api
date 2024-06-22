import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import assembleTemplate from './assemble-template';
import { EnvSchema } from 'src/config';
import { AllTypes, TypeToTemplateArgsMap } from './templates/enums';

@Injectable()
export class EmailService {
  constructor(private config: ConfigService<EnvSchema, true>) {}

  async sendMail<T extends AllTypes>(
    to: string,
    type: T,
    templateArgs: TypeToTemplateArgsMap[T],
  ): Promise<void> {
    const transporter = this.getTransporter();
    const { html, subject } = assembleTemplate(type, templateArgs);

    await transporter.sendMail({
      from: this.config.get('SMTP_FROM'),
      to,
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
