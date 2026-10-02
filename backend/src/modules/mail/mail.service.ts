import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private resend: Resend;

  constructor(private configService: ConfigService) {
    this.resend = new Resend(this.configService.get('RESEND_API_KEY'));
  }

  // Centralizes sending so one place logs failures instead of letting them
  // bubble up as unhandled 500s on auth endpoints (forgot-password, register)
  // that shouldn't fail just because a notification email couldn't go out.
  private async send(params: { to: string; subject: string; html: string }) {
    try {
      const { error } = await this.resend.emails.send({
        from: this.configService.get('MAIL_FROM') || 'Remy Real Estates <onboarding@resend.dev>',
        to: params.to,
        subject: params.subject,
        html: params.html,
      });
      if (error) {
        this.logger.error(`Failed to send email to ${params.to}: ${JSON.stringify(error)}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send email to ${params.to}`, err as Error);
    }
  }

  async sendVerificationEmail(email: string, token: string) {
    const url = `${this.configService.get('FRONTEND_URL')}/verify-email?token=${token}`;
    await this.send({
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
    await this.send({
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

  async sendAccountBannedEmail(email: string, name: string, reason?: string) {
    await this.send({
      to: email,
      subject: 'Account Suspended - Remy Real Estates',
      html: `
        <h2>Hello ${name},</h2>
        <p>We regret to inform you that your account has been <strong>suspended</strong> by our administration team.</p>
        ${
          reason
            ? `<p><strong>Reason:</strong> ${reason}</p>`
            : `<p>If you believe this is a mistake, please contact our support team.</p>`
        }
        <p>If you have any questions, please reach out to our support team.</p>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendAccountUnbannedEmail(email: string, name: string) {
    await this.send({
      to: email,
      subject: 'Account Reinstated - Remy Real Estates',
      html: `
        <h2>Welcome Back, ${name}! 🎉</h2>
        <p>Great news! Your account has been <strong>reinstated</strong> by our administration team.</p>
        <p>You can now log in and continue using all the features of Remy Real Estates.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/signin" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Log In Now</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendNewContactMessageEmail(
    adminEmail: string,
    senderName: string,
    senderEmail: string,
    subject: string,
    message: string,
  ) {
    await this.send({
      to: adminEmail,
      subject: `New Contact Message: ${subject} - Remy Real Estates`,
      html: `
        <h2>Hello Admin,</h2>
        <p>A new message was submitted through the website contact form.</p>
        <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          <strong>From:</strong> ${senderName} (${senderEmail})<br/>
          <strong>Subject:</strong> ${subject}<br/>
          <strong>Message:</strong><br/>${message}
        </p>
        <a href="${this.configService.get('FRONTEND_URL')}/dashboard/admin/content" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">View in Content Dashboard</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendNewRealtorPendingEmail(adminEmail: string, realtorName: string, realtorEmail: string) {
    await this.send({
      to: adminEmail,
      subject: 'New Realtor Awaiting Approval - Remy Real Estates',
      html: `
        <h2>Hello Admin,</h2>
        <p>A new realtor just registered and is waiting for your approval before they can access the realtor dashboard.</p>
        <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          <strong>Name:</strong> ${realtorName}<br/>
          <strong>Email:</strong> ${realtorEmail}
        </p>
        <a href="${this.configService.get('FRONTEND_URL')}/dashboard/admin/users?filter=pending" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Review Pending Realtors</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendRealtorApprovedEmail(email: string, name: string) {
    await this.send({
      to: email,
      subject: "You're Approved - Remy Real Estates",
      html: `
        <h2>Hello ${name},</h2>
        <p style="color: #059669; font-weight: bold;">Your realtor account has been approved by our team!</p>
        <p>You can now log in and start listing properties on Remy Real Estates.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/signin" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Log In Now</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendTourStatusEmail(
    email: string,
    name: string,
    propertyTitle: string,
    status: string,
    tourDate?: string,
    tourTime?: string,
  ) {
    const statusCopy: Record<string, { subject: string; headline: string; color: string }> = {
      confirmed: {
        subject: 'Your Viewing Tour Was Confirmed',
        headline: 'Good news — your viewing has been confirmed!',
        color: '#059669',
      },
      cancelled: {
        subject: 'Your Viewing Tour Was Cancelled',
        headline: 'Your viewing tour has been cancelled.',
        color: '#e11d48',
      },
      completed: {
        subject: 'Your Viewing Tour Is Marked Completed',
        headline: 'Your viewing tour has been marked as completed.',
        color: '#2563eb',
      },
      pending: {
        subject: 'Your Viewing Tour Request Was Received',
        headline: 'Your viewing request is pending confirmation.',
        color: '#d97706',
      },
    };
    const copy = statusCopy[status] || {
      subject: 'Update on Your Viewing Tour',
      headline: `Your viewing tour status changed to "${status}".`,
      color: '#0F172A',
    };

    await this.send({
      to: email,
      subject: `${copy.subject} - Remy Real Estates`,
      html: `
        <h2>Hello ${name},</h2>
        <p style="color: ${copy.color}; font-weight: bold;">${copy.headline}</p>
        <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          <strong>Property:</strong> ${propertyTitle}<br/>
          ${tourDate ? `<strong>Date:</strong> ${tourDate}<br/>` : ''}
          ${tourTime ? `<strong>Time:</strong> ${tourTime}<br/>` : ''}
          <strong>Status:</strong> <span style="color: ${copy.color}; text-transform: capitalize;">${status}</span>
        </p>
        <a href="${this.configService.get('FRONTEND_URL')}/customer/tours" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">View My Tours</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendNewTourRequestEmail(
    email: string,
    realtorName: string,
    customerName: string,
    propertyTitle: string,
    tourDate?: string,
    tourTime?: string,
  ) {
    await this.send({
      to: email,
      subject: 'New Viewing Tour Request - Remy Real Estates',
      html: `
        <h2>Hello ${realtorName},</h2>
        <p><strong>${customerName}</strong> just requested a viewing tour for one of your listings.</p>
        <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          <strong>Property:</strong> ${propertyTitle}<br/>
          ${tourDate ? `<strong>Date:</strong> ${tourDate}<br/>` : ''}
          ${tourTime ? `<strong>Time:</strong> ${tourTime}<br/>` : ''}
        </p>
        <p>Confirm or decline the request from your Appointments dashboard.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/realtor/appointments" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Review Appointment</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendPropertySavedEmail(email: string, realtorName: string, customerName: string, propertyTitle: string) {
    await this.send({
      to: email,
      subject: 'Someone Saved Your Listing - Remy Real Estates',
      html: `
        <h2>Hello ${realtorName},</h2>
        <p><strong>${customerName}</strong> just saved one of your listings to their favorites.</p>
        <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          <strong>Property:</strong> ${propertyTitle}
        </p>
        <p>This is a strong signal of interest — consider reaching out to them directly.</p>
        <a href="${this.configService.get('FRONTEND_URL')}/realtor/messages" style="padding: 10px 20px; background-color: #059669; color: white; text-decoration: none; border-radius: 5px;">Open Messages</a>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }

  async sendRoleChangedEmail(email: string, name: string, newRole: string, oldRole?: string) {
    await this.send({
      to: email,
      subject: 'Account Role Updated - Remy Real Estates',
      html: `
        <h2>Hello ${name},</h2>
        <p>Your account role has been updated by the administration team.</p>
        <p style="background-color: #f1f5f9; padding: 12px; border-radius: 8px;">
          ${
            oldRole
              ? `<strong>Previous role:</strong> ${oldRole}<br/>`
              : ''
          }
          <strong>New role:</strong> <span style="color: #059669; font-weight: bold;">${newRole}</span>
        </p>
        <p>You may need to refresh the page to see the changes take effect.</p>
        <p style="color: #64748b; font-size: 12px;">© Remy Real Estates. All rights reserved.</p>
      `,
    });
  }
}
