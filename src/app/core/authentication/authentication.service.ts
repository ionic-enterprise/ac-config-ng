import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {
  awsConfig,
  azureConfig,
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

  async getBaseConfig(): Promise<any> {
    const { value } = await Preferences.get({ key: 'base-config' });
    return value ? JSON.parse(value) : awsConfig;
  }

  async setBaseConfig(config: any): Promise<void> {
    this.authenticator = null;
    return Preferences.set({
      key: 'base-config',
      value: JSON.stringify(config),
    });
  }

  async getConfig(platform: 'mobile' | 'web'): Promise<IonicAuthOptions> {
    const config = await this.getBaseConfig();
    const extras =
      platform === 'web' ? { ...webConfigExtras } : { ...mobileConfigExtras };
    if (
      platform === 'mobile' &&
      config.discoveryUrl === azureConfig.discoveryUrl
    ) {
      extras.redirectUri =
        'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D';
      extras.logoutUrl =
        'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D';
    }
    return {
      logLevel: 'DEBUG',
      ...config,
      ...extras,
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
