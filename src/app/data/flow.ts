import { KeyValue } from '@angular/common';

export type Flow = KeyValue<string, string>;
export const flows: Array<Flow> = [
  { key: 'implicit', value: 'Implicit' },
  { key: 'PKCE', value: 'PKCE' },
];
