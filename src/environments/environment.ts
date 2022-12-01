import { IonicAuthOptions } from '@ionic-enterprise/auth';

export const auth0Config: IonicAuthOptions = {
  // audience value is required for auth0's config. If it doesn't exist, the jwt payload will be empty
  audience: 'https://io.ionic.demo.ac',
  authConfig: 'auth0' as 'auth0',
  clientID: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  logoutUrl: '',
  scope: 'openid email picture profile offline_access',
};

export const awsConfig = {
  authConfig: 'cognito' as 'cognito',
  clientID: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl:
    'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  scope: 'openid email profile offline_access',
  audience: '',
  webAuthFlow: 'PKCE' as 'PKCE',
};

export const azureConfig = {
  authConfig: 'azure' as 'azure',
  clientID: 'ed8cb65d-7bb2-4107-bc36-557fb680b994',
  scope:
    'openid offline_access email profile https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read',
  discoveryUrl:
    'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_acdemo2',
  audience: '',
};

export const oktaConfig = {
  authConfig: 'okta' as 'okta',
  clientID: '0oaur4c907I5uMr4I0h7',
  discoveryUrl:
    'https://dev-622807.oktapreview.com/.well-known/openid-configuration',
  scope: 'openid email profile offline_access',
  audience: '',
  webAuthFlow: 'PKCE' as 'PKCE',
};

export const mobileConfigExtras = {
  redirectUri: 'msauth://login',
  logoutUrl: 'msauth://login',
  platform: 'capacitor' as 'capacitor',
  iosWebView: 'private' as 'private',
};

export const webConfigExtras = {
  redirectUri: 'http://localhost:8100/login',
  logoutUrl: 'http://localhost:8100/login',
  platform: 'web' as 'web',
};

export const environment = {
  production: false,
};
