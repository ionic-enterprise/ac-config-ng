export interface IonicAuthOptions {
  clientID: string;
  logoutUrl: string;
  redirectUri?: string;
  scope?: string;
  audience?: string;
  tokenStorageProvider?: any;
  discoveryUrl?: string;
  platform?: 'web' | 'cordova' | 'capacitor';
  authConfig?:
    | 'auth0'
    | 'azure'
    | 'cognito'
    | 'salesforce'
    | 'okta'
    | 'ping'
    | 'identity-server'
    | 'keycloak'
    | 'general';
  clientSecret?: string;
  logLevel?: 'DEBUG' | 'ERROR' | 'NONE';
  iosWebView?: 'private' | 'shared';
  androidToolbarColor?: string;
  implicitLogin?: 'CURRENT' | 'POPUP';
  webAuthFlow?: 'implicit' | 'PKCE';
  safariWebViewOptions?: any;
}

export class IonicAuth {
  constructor(config: IonicAuthOptions) {}

  async login(overrideUrl?: string): Promise<void> {}

  additionalLoginParameters(parameters: { [id: string]: string }): void {}

  async getAccessToken(
    tokenName?: string,
    scopes?: string
  ): Promise<string | undefined> {
    return undefined;
  }

  async getIdToken(): Promise<any | undefined> {
    return undefined;
  }

  async getAuthResponse(): Promise<any | undefined> {
    return undefined;
  }

  async isAccessTokenAvailable(tokenName?: string): Promise<boolean> {
    return false;
  }

  async isAccessTokenExpired(): Promise<boolean> {
    return false;
  }

  async isRefreshTokenAvailable(): Promise<boolean> {
    return false;
  }

  async getRefreshToken(): Promise<string | undefined> {
    return undefined;
  }

  async refreshSession(tokenName?: string): Promise<void> {}

  async isAuthenticated(): Promise<boolean> {
    return false;
  }

  async logout(): Promise<void> {}

  async expire(): Promise<void> {}

  onLoginSuccess(response: any): void {}

  onLogout(): void {}

  async clearStorage(): Promise<void> {}

  async getAccessTokenExpiration(): Promise<number | undefined> {
    return undefined;
  }
}
