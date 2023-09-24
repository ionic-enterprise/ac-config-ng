import { ProviderOptions } from '@ionic-enterprise/auth';
import { config } from '../config';

export const auth0Config: ProviderOptions = {
  // audience value is required for auth0's config. If it doesn't exist, the jwt payload will be empty
  audience: 'https://io.ionic.demo.ac',
  clientId: 'yLasZNUGkZ19DGEjTmAITBfGXzqbvd00',
  discoveryUrl:
    'https://dev-2uspt-sz.us.auth0.com/.well-known/openid-configuration',
  redirectUri: 'msauth://auth-action-complete',
  logoutUrl: 'msauth://auth-action-complete',
  scope: 'openid email picture profile offline_access',
};

export const awsConfig: ProviderOptions = {
  clientId: '64p9c53l5thd5dikra675suvq9',
  discoveryUrl:
    'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
  redirectUri: 'msauth://auth-action-complete',
  logoutUrl: 'msauth://auth-action-complete',
  scope: 'openid email profile',
  audience: '',
};

export const azureConfig: ProviderOptions = {
  clientId: '3f32ad7a-0ae6-458a-8d94-763d98ef48d4',
  scope:
    'openid email profile  https://gamseg.onmicrosoft.com/3f32ad7a-0ae6-458a-8d94-763d98ef48d4/User.Read ',
  discoveryUrl:
    'https://gamseg.b2clogin.com/gamseg.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_ionicDemo',
  redirectUri: 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D',
  logoutUrl: 'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D',
  audience: '',
};

export const oktaConfig: ProviderOptions = {
  clientId: '0oaur4c907I5uMr4I0h7',
  discoveryUrl:
    'https://dev-622807.oktapreview.com/.well-known/openid-configuration',
  redirectUri: 'msauth://auth-action-complete',
  logoutUrl: 'msauth://auth-action-complete',
  scope: 'openid email profile offline_access',
  audience: '',
};

export const webConfig = {
  redirectUri: 'http://localhost:8100/auth-action-complete',
  logoutUrl: 'http://localhost:8100/auth-action-complete',
};

export const mobileConfig = {
  redirectUri: `${config.authUrlScheme}://auth-action-complete`,
  logoutUrl: `${config.authUrlScheme}://auth-action-complete`,
};

export const environment = {
  production: false,
};
