import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host:'smtp.gmail.com',
      service: 'mail',
      port: 465,
      secure: true,
      auth: {
        user: 'moateztilouch@gmail.com', 
        pass: 'kozmektrpswmuaze', 
      },
    });
  }

  async sendUserPassword(email: string, password: string) {
    const mailOptions = {
      from: 'moateztilouch@gmail.com',
      to: email,
      subject: 'Your password',
      text: `Welcome to our VISTO_PLATFORM, 
      Votre mot de passe généré est : ${password}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
  }
  async sendNewUserPassword(email: string, password: string) {
    const mailOptions = {
      from: 'moateztilouch@gmail.com',
      to: email,
      subject: ' New Password',
      text: `Welcome Back to Visto Platforme, 
     Your new Password is  : ${password}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
  }
  async sendTokenPassword(email: string, password: string) {
    const mailOptions = {
      from: 'moateztilouch@gmail.com',
      to: email,
      subject: 'Your Token',
      text: `Welcome to our VISTO_PLATFORM, 
      Your token for reseting password is  : ${password}`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      console.log('Email envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email :', error);
    }
  }
}