import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class NotificationsService {
  private transporter: nodemailer.Transporter;
  private templates: Map<string, Handlebars.TemplateDelegate> = new Map();

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get('MAIL_HOST', 'smtp.example.com'),
      port: config.get<number>('MAIL_PORT', 587),
      secure: false,
      auth: {
        user: config.get('MAIL_USER'),
        pass: config.get('MAIL_PASSWORD'),
      },
    });

    this.loadTemplates();
  }

  private loadTemplates() {
    const templateDir = path.join(__dirname, 'templates');
    const templateFiles = [
      'booking-received',
      'booking-status-update',
      'presskit-viewed',
      'presskit-downloaded',
      'invitation',
      'account-confirmation',
      'password-reset',
      'quote',
      'contract-signature-request',
      'contract-signed',
      'artist-contract-confirmation',
    ];

    for (const name of templateFiles) {
      const filePath = path.join(templateDir, `${name}.hbs`);
      try {
        const source = fs.readFileSync(filePath, 'utf-8');
        this.templates.set(name, Handlebars.compile(source));
      } catch {
        // Template not found, will use fallback
      }
    }
  }

  async sendEmail(to: string, subject: string, template: string, data: any): Promise<void> {
    const compiledTemplate = this.templates.get(template);
    const html = compiledTemplate
      ? compiledTemplate(data)
      : `<p>${JSON.stringify(data)}</p>`;

    try {
      await this.transporter.sendMail({
        from: this.config.get('MAIL_FROM', 'Sauroraa <noreply@sauroraa.be>'),
        to,
        subject,
        html,
      });
    } catch (error) {
      console.error('Email send failed:', error);
    }
  }

  async notifyBookingReceived(booking: any): Promise<void> {
    await this.sendEmail(
      booking.requesterEmail,
      `Booking Request Received - ${booking.referenceCode}`,
      'booking-received',
      { booking },
    );
  }

  async notifyBookingStatusUpdate(booking: any, newStatus: string, note?: string): Promise<void> {
    await this.sendEmail(
      booking.requesterEmail,
      `Booking Update - ${booking.referenceCode}`,
      'booking-status-update',
      { booking, newStatus, note },
    );
  }

  async notifyPresskitViewed(managerEmail: string, artistName: string, viewerInfo: any): Promise<void> {
    await this.sendEmail(
      managerEmail,
      `Presskit Viewed - ${artistName}`,
      'presskit-viewed',
      { artistName, viewerInfo },
    );
  }

  async notifyPresskitDownloaded(managerEmail: string, artistName: string, downloadInfo: any): Promise<void> {
    await this.sendEmail(
      managerEmail,
      `Presskit Downloaded - ${artistName}`,
      'presskit-downloaded',
      { artistName, downloadInfo },
    );
  }

  async sendInvitation(
    email: string,
    inviterName: string,
    token: string,
    role: string,
    options?: { language?: 'fr' | 'en' | 'nl' },
  ): Promise<void> {
    const language = options?.language || 'fr';
    const registerUrl = `${this.config.get('APP_URL')}/register?token=${token}&email=${encodeURIComponent(email)}`;
    const copy = {
      fr: {
        subject: 'Invitation Sauroraa Agency',
        title: 'Vous etes invite(e)',
        cta: 'Completer mon compte',
        expiry: 'Cette invitation expire dans 7 jours.',
        intro: `${inviterName} vous invite a rejoindre Sauroraa Agency en tant que ${role.toUpperCase()}.`,
      },
      en: {
        subject: 'Sauroraa Agency Invitation',
        title: 'You are invited',
        cta: 'Complete my account',
        expiry: 'This invitation expires in 7 days.',
        intro: `${inviterName} invited you to join Sauroraa Agency as ${role.toUpperCase()}.`,
      },
      nl: {
        subject: 'Uitnodiging Sauroraa Agency',
        title: 'Je bent uitgenodigd',
        cta: 'Mijn account voltooien',
        expiry: 'Deze uitnodiging verloopt binnen 7 dagen.',
        intro: `${inviterName} nodigt je uit bij Sauroraa Agency als ${role.toUpperCase()}.`,
      },
    }[language];

    await this.sendEmail(
      email,
      copy.subject,
      'invitation',
      { inviterName, registerUrl, role, copy, language },
    );
  }

  async sendPasswordReset(email: string, token: string): Promise<void> {
    const resetUrl = `${this.config.get('APP_URL')}/reset-password?token=${token}`;
    await this.sendEmail(
      email,
      'Password Reset - Sauroraa Agency',
      'password-reset',
      { resetUrl },
    );
  }

  async sendAccountConfirmation(email: string, fullName: string): Promise<void> {
    const loginUrl = `${this.config.get('APP_URL')}/login`;
    await this.sendEmail(
      email,
      'Compte cree - Sauroraa Agency',
      'account-confirmation',
      { fullName, loginUrl },
    );
  }

  async sendContractSignatureRequest(booking: any, signingUrl: string, customMessage?: string): Promise<void> {
    await this.sendEmail(
      booking.requesterEmail,
      `Signature required - ${booking.referenceCode}`,
      'contract-signature-request',
      { booking, signingUrl, customMessage },
    );
  }

  async sendContractSignedConfirmation(booking: any): Promise<void> {
    await this.sendEmail(
      booking.requesterEmail,
      `Contract signed - ${booking.referenceCode}`,
      'contract-signed',
      { booking },
    );
  }

  async sendArtistContractConfirmationRequest(artistEmail: string, booking: any, dashboardUrl: string): Promise<void> {
    await this.sendEmail(
      artistEmail,
      `Booking confirmation required - ${booking.referenceCode}`,
      'artist-contract-confirmation',
      { booking, dashboardUrl },
    );
  }
}
