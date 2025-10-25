import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

export class EmailService {
  private sesClient: SESClient | null = null;
  private readonly region: string;
  private readonly fromEmail: string;
  private readonly fromName: string;
  private readonly frontEndUrl: string;

  constructor() {
    this.region = process.env.AWS_REGION || 'ap-northeast-3';
    this.fromEmail = process.env.AWS_SES_FROM_EMAIL || '';
    this.fromName = process.env.AWS_SES_FROM_NAME || 'Recipify Team';
    this.frontEndUrl = process.env.FRONTEND_URL || 'http://localhost:4000';

    if (!this.fromEmail) {
      throw new Error('AWS_SES_FROM_EMAIL environment variable is required');
    }
  }

  private getSESClient(): SESClient {
    if (!this.sesClient) {
      this.sesClient = new SESClient({ region: this.region });
    }
    return this.sesClient;
  }

  async sendVerificationEmail(
    email: string,
    displayName: string,
    verificationToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const verificationUrl = `${this.frontEndUrl}/auth/verify-email?email=${encodeURIComponent(email)}&token=${verificationToken}`;
      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #FF9119; margin: 0; font-size: 32px;">Recipify</h1>
            </div>
            
            <h2 style="color: #333333; font-size: 24px; margin-bottom: 20px;">Welcome to Recipify!</h2>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
              Hi ${displayName},
            </p>
            
            <p style="color: #666666; font-size: 16px; line-height: 1.5; margin-bottom: 30px;">
              Thank you for registering! Please verify your email address by clicking the button below:
            </p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                style="display: inline-block; 
                        background-color: #FF9119; 
                        color: #ffffff; 
                        padding: 14px 30px; 
                        text-decoration: none; 
                        border-radius: 5px; 
                        font-size: 16px; 
                        font-weight: bold;">
                Verify Email Address
              </a>
            </div>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.5; margin-top: 30px;">
              This verification link will expire in <strong>24 hours</strong>.
            </p>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.5;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            
            <p style="color: #FF9119; font-size: 14px; word-break: break-all;">
              ${verificationUrl}
            </p>
            
            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">
            
            <p style="color: #999999; font-size: 12px; line-height: 1.5;">
              If you didn't create an account with Recipify, you can safely ignore this email.
            </p>
          </div>
        </body>
        </html>
      `;
      const command = new SendEmailCommand({
        Source: `${this.fromName} <${this.fromEmail}>`,
        Destination: {
          ToAddresses: [email],
        },
        Message: {
          Subject: {
            Data: 'Verify Your Email - Recipify',
          },
          Body: {
            Html: {
              Data: htmlTemplate,
            },
          },
        },
      });

      const client = this.getSESClient();
      await client.send(command);
      console.log(`Verification email sent successfully to ${email}`);
      return { success: true };
    } catch (error) {
      console.error('SES Error:', error);
      if (error instanceof Error) {
        return { success: false, error: error.message };
      }
      return { success: false, error: 'Unknown error occurred while sending email' };
    }
  }
}
