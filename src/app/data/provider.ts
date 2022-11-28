import { KeyValue } from '@angular/common';

export type Provider = KeyValue<string, string>;
export const providers: Array<Provider> = [
  { key: 'auth0', value: 'Auth0' },
  { key: 'azure', value: 'Azure B2C' },
  { key: 'cognito', value: 'Cognito (AWS)' },
  { key: 'okta', value: 'Okta' },
  { key: 'onelogin', value: 'OneLogin' },
];
