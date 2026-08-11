import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST'),
      port: this.configService.get('MAIL_PORT'),
      secure: false,
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Verify Your Email - Remy Real Estates',
      html: `
        <h2>Welcome to Remy Real Estates!</h2>
        <p>Please click the link below to verify your email address and activate your account:</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
        <p>Or copy this link into your browser: <br/> ${url}</p>
      `,
    });
  }

  async sendPasswordResetEmail(email: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/reset-password?token=${token}`;
    await this.transporter.sendMail({
      from: this.configService.get('MAIL_FROM'),
      to: email,
      subject: 'Password Reset Request - Remy Real Estates',
      html: `
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to set a new password (valid for 1 hour):</p>
        <a href="${url}" style="padding: 10px 20px; background-color: #0F172A; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>Or copy this link into your browser: <br/> ${url}</p>
      `,
    });
  }
}