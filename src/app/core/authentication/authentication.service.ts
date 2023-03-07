import { Injectable } from '@angular/core';
import { Flow, flows, Provider, providers } from '@app/data';
import { Preferences } from '@capacitor/preferences';
import { awsConfig, webConfig } from '@env/environment';
import {
  Auth0Provider,
  CognitoProvider,
  AzureProvider,
  OktaProvider,
  OneLoginProvider,
  ProviderOptions,
  AuthConnect,
  AuthConnectConfig,
  AuthResult,
} from '@ionic-enterprise/auth';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authProviderKey = 'auth-provider';
  private authProviderOptionsKey = 'auth-provider-options';
  private authFlowKey = 'auth-flow';
  private authResultKey = 'auth-result';

  private currentOptions: ProviderOptions | undefined;
  private currentFlow: Flow | undefined;
  private currentProvider: Provider | undefined;

  private initializing: Promise<void>;
  private authResult: AuthResult;

  private provider:
    | Auth0Provider
    | AzureProvider
    | CognitoProvider
    | OktaProvider
    | OneLoginProvider;

  constructor(private platform: Platform) {}

  async getConfig(): Promise<ProviderOptions | undefined> {
    if (!this.currentOptions) {
      const { value } = await Preferences.get({
        key: this.authProviderOptionsKey,
      });
      this.currentOptions = value ? JSON.parse(value) : undefined;
    }
    return this.currentOptions;
  }

  async getFlow(): Promise<Flow | undefined> {
    if (!this.currentFlow) {
      const { value } = await Preferences.get({ key: this.authFlowKey });
      this.currentFlow = value ? JSON.parse(value) : undefined;
    }
    return this.currentFlow;
  }

  async getProvider(): Promise<Provider | undefined> {
    if (!this.currentProvider) {
      const { value } = await Preferences.get({ key: this.authProviderKey });
      this.currentProvider = value ? JSON.parse(value) : undefined;
    }
    return this.currentProvider;
  }

  async setConfig(
    provider: Provider,
    options: ProviderOptions,
    flow?: Flow
  ): Promise<void> {
    await Promise.all([
      Preferences.set({
        key: this.authProviderKey,
        value: JSON.stringify(provider),
      }),
      Preferences.set({
        key: this.authProviderOptionsKey,
        value: JSON.stringify(options),
      }),
      flow
        ? Preferences.set({
            key: this.authFlowKey,
            value: JSON.stringify(flow),
          })
        : Preferences.remove({ key: this.authFlowKey }),
    ]);
    this.currentFlow = flow;
    this.currentOptions = options;
    this.currentProvider = provider;
    await this.setupAuthConnect();
    await this.createProvider();
  }

  async login(): Promise<void> {
    await this.initialize();
    if (!this.authResult) {
      this.authResult = await AuthConnect.login(
        this.provider,
        this.currentOptions
      );
      await Preferences.set({
        key: this.authResultKey,
        value: JSON.stringify(this.authResult),
      });
    }
  }

  async logout(): Promise<void> {
    await this.initialize();
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = undefined;
      await Preferences.remove({ key: this.authResultKey });
    }
  }

  async refresh(): Promise<void> {
    await this.initialize();
    if (this.authResult) {
      this.authResult = await AuthConnect.refreshSession(
        this.provider,
        this.authResult
      );
      await Preferences.set({
        key: this.authResultKey,
        value: JSON.stringify(this.authResult),
      });
    }
  }

  async canRefresh(): Promise<boolean> {
    await this.initialize();
    return (
      !!this.authResult &&
      (await AuthConnect.isRefreshTokenAvailable(this.authResult))
    );
  }

  async accessTokenIsExpired(): Promise<boolean> {
    await this.initialize();
    return (
      !!this.authResult &&
      (await AuthConnect.isAccessTokenExpired(this.authResult))
    );
  }

  async getAccessToken(): Promise<string | undefined> {
    await this.initialize();
    return this.authResult?.accessToken;
  }

  async isAuthenticated(): Promise<boolean> {
    await this.initialize();
    return (
      !!this.authResult &&
      (await AuthConnect.isAccessTokenAvailable(this.authResult))
    );
  }

  private async initialize(): Promise<void> {
    if (!this.initializing) {
      this.initializing = new Promise(async (resolve) => {
        const opt = await this.getConfig();
        if (opt) {
          await this.createProvider();
          await this.setupAuthConnect();
          await this.initializeAuthResult();
        } else {
          await this.setDefaultConfig();
        }
        resolve();
      });
    }
    return this.initializing;
  }

  private async setDefaultConfig(): Promise<void> {
    if (this.platform.is('hybrid')) {
      await this.setDefaultConfigMobile();
    } else {
      await this.setDefaultConfigWeb();
    }
  }

  private setDefaultConfigMobile(): Promise<void> {
    return this.setConfig(
      providers.find((p) => p.key === 'cognito'),
      awsConfig
    );
  }

  private setDefaultConfigWeb(): Promise<void> {
    return this.setConfig(
      providers.find((p) => p.key === 'cognito'),
      {
        ...awsConfig,
        ...webConfig,
      },
      flows.find((f) => f.key === 'PKCE')
    );
  }

  private async initializeAuthResult(): Promise<void> {
    const { value } = await Preferences.get({ key: this.authResultKey });
    this.authResult = value ? JSON.parse(value) : undefined;
  }

  private async setupAuthConnect(): Promise<void> {
    const flow = await this.getFlow();
    const cfg: AuthConnectConfig = {
      logLevel: 'DEBUG',
      platform: this.platform.is('hybrid') ? 'capacitor' : 'web',
      ios: {
        webView: 'private',
      },
      web: {
        uiMode: 'popup',
        authFlow: flow ? flow.key : 'implicit',
      },
    };

    await AuthConnect.setup(cfg);
  }

  private async createProvider(): Promise<void> {
    const authProvider =
      (await this.getProvider()) || providers.find((p) => p.key === 'cognito');
    switch (authProvider.key) {
      case 'auth0':
        this.provider = new Auth0Provider();
        break;

      case 'azure':
        this.provider = new AzureProvider();
        break;

      case 'cognito':
        this.provider = new CognitoProvider();
        break;

      case 'okta':
        this.provider = new OktaProvider();
        break;

      case 'onelogin':
        this.provider = new OneLoginProvider();
        break;

      default:
        break;
    }
  }
}
