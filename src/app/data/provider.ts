import { KeyValue } from '@angular/common';

export type Provider = KeyValue<string, string>;
export const providers: Array<Provider> = [
  { key: 'auth0', value: 'Auth0' },
  { key: 'azure', value: 'Azure B2C' },
  { key: 'cognito', value: 'Cognito (AWS)' },
  { key: 'identity-server', value: 'Identity Server' },
  { key: 'keycloak', value: 'Keycloak' },
  { key: 'okta', value: 'Okta' },
  { key: 'ping', value: 'Ping' },
  { key: 'salesforce', value: 'Salesforce' },
  { key: 'onelogin', value: 'OneLogin' },
  { key: 'general', value: 'General' },
];
