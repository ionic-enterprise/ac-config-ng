import { Injectable } from '@angular/core';
import { IonicAuth, IonicAuthOptions } from '@ionic-enterprise/auth';

@Injectable({
  providedIn: 'root',
})
export class IonicAuthFactoryService {
  create(config: IonicAuthOptions) {
    return new IonicAuth(config);
  }
}
