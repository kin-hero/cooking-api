import crypto from 'crypto';

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

export class GoogleOAuthService {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor() {
    this.clientId = process.env.GOOGLE_CLIENT_ID!;
    this.clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
    this.redirectUri = process.env.GOOGLE_CALLBACK_URL!;
  }

  /**
   * Generate the Google OAuth URL for user authentication
   */
  generateAuthURL(): string {
    const state = crypto.randomBytes(32).toString('hex');

    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'openid email profile',
      response_type: 'code',
      state,
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(code: string): Promise<string> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = (await response.json()) as { access_token: string };
    return data.access_token;
  }

  /**
   * Get user information from Google using access token
   */
  async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user info: ${response.statusText}`);
    }

    return (await response.json()) as GoogleUserInfo;
  }

  /**
   * Complete OAuth flow: exchange code for user info
   */
  async getGoogleUser(code: string): Promise<GoogleUserInfo> {
    const accessToken = await this.exchangeCodeForToken(code);
    const userInfo = await this.getUserInfo(accessToken);

    if (!userInfo.verified_email) {
      throw new Error('Google account email not verified');
    }

    return userInfo;
  }
}
