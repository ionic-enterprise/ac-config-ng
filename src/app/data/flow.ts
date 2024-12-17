import { KeyValue } from '@angular/common';

export type Flow = KeyValue<'implicit' | 'PKCE', string>;
export const flows: Flow[] = [
  { key: 'implicit', value: 'Implicit' },
  { key: 'PKCE', value: 'PKCE' },
];
