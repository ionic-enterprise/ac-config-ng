import { Injectable } from '@angular/core';
import { Flow, flows, Provider, providers } from '@app/data';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { awsConfig, mobileConfig, webConfig } from '@env/environment';
import {
  Auth0Provider,
  AuthConnect,
  AuthConnectConfig,
  AuthResult,
  AzureProvider,
  CognitoProvider,
  OktaProvider,
  OneLoginProvider,
  ProviderOptions,
} from '@ionic-enterprise/auth';

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

  private authResult: AuthResult;

  private provider:
    | Auth0Provider
    | AzureProvider
    | CognitoProvider
    | OktaProvider
    | OneLoginProvider;

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
    flow?: Flow,
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
    //const wait = (ms: number): Promise<void> =>
    //  new Promise((resolve) => setTimeout(resolve, ms));

    if (!this.authResult) {
      this.authResult = await AuthConnect.login(
        this.provider,
        this.currentOptions,
      );
      //await wait(1000);
      try {
        await AuthConnect.login(this.provider, {
          ...this.currentOptions,
          //scope: 'some valid other scope',
        });
      } catch (err: unknown) {
        alert(err);
      }
      await Preferences.set({
        key: this.authResultKey,
        value: JSON.stringify(this.authResult),
      });
    }
  }

  async logout(): Promise<void> {
    if (this.authResult) {
      await AuthConnect.logout(this.provider, this.authResult);
      this.authResult = undefined;
      await Preferences.remove({ key: this.authResultKey });
    }
  }

  async refresh(): Promise<void> {
    if (this.authResult) {
      this.authResult = await AuthConnect.refreshSession(
        this.provider,
        this.authResult,
      );
      await Preferences.set({
        key: this.authResultKey,
        value: JSON.stringify(this.authResult),
      });
    }
  }

  async canRefresh(): Promise<boolean> {
    return (
      !!this.authResult &&
      (await AuthConnect.isRefreshTokenAvailable(this.authResult))
    );
  }

  async accessTokenIsExpired(): Promise<boolean> {
    return (
      !!this.authResult &&
      (await AuthConnect.isAccessTokenExpired(this.authResult))
    );
  }

  async getAccessToken(): Promise<string | undefined> {
    return this.authResult?.accessToken;
  }

  async isAuthenticated(): Promise<boolean> {
    return (
      !!this.authResult &&
      (await AuthConnect.isAccessTokenAvailable(this.authResult))
    );
  }

  async initialize(): Promise<void> {
    const opt = await this.getConfig();
    if (opt) {
      await this.createProvider();
      await this.setupAuthConnect();
      await this.initializeAuthResult();
    } else {
      await this.setDefaultConfig();
    }
  }

  private async setDefaultConfig(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      await this.setDefaultConfigMobile();
    } else {
      await this.setDefaultConfigWeb();
    }
  }

  private setDefaultConfigMobile(): Promise<void> {
    return this.setConfig(
      providers.find((p) => p.key === 'cognito'),
      {
        ...awsConfig,
        ...mobileConfig,
      },
    );
  }

  private setDefaultConfigWeb(): Promise<void> {
    return this.setConfig(
      providers.find((p) => p.key === 'cognito'),
      {
        ...awsConfig,
        ...webConfig,
      },
      flows.find((f) => f.key === 'PKCE'),
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
      platform: Capacitor.isNativePlatform() ? 'capacitor' : 'web',
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
