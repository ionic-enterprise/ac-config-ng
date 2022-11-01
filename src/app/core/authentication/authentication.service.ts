import { Injectable } from '@angular/core';
import {
  awsConfig,
  mobileConfigExtras,
  webConfigExtras,
} from '@env/environment';
import { IonicAuth, IonicAuthOptions } from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';
import { IonicAuthFactoryService } from '../ionic-auth-factory/ionic-auth-factory.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authenticator: IonicAuth;

  constructor(
    private ionicAuthFactory: IonicAuthFactoryService,
    private platform: Platform
  ) {}

  async getConfig(platform: 'mobile' | 'web'): Promise<IonicAuthOptions> {
    return {
      logLevel: 'DEBUG',
      ...awsConfig,
      ...(platform === 'web' ? webConfigExtras : mobileConfigExtras),
    };
  }

  async login(): Promise<void> {
    await this.initialize();
    return this.authenticator.login();
  }

  async logout(): Promise<void> {
    await this.initialize();
    return this.authenticator.logout();
  }

  async refresh(): Promise<void> {
    await this.initialize();
    return this.authenticator.refreshSession();
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    return this.authenticator.isAuthenticated();
  }

  private async initialize(): Promise<void> {
    if (!this.authenticator) {
      const config = await this.getConfig(
        this.platform.is('hybrid') ? 'mobile' : 'web'
      );
      this.authenticator = this.ionicAuthFactory.create(config);
    }
  }
}
