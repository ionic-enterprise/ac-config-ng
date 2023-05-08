import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import { Platform } from '@ionic/angular';
import { createPlatformMock } from '@test/mocks';
import {
  AuthConnect,
  AzureProvider,
  CognitoProvider,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { Preferences } from '@capacitor/preferences';
import { flows, providers } from '@app/data';
import { awsConfig, azureConfig, webConfig } from '@env/environment';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  const opt: ProviderOptions = {
    clientId: '4273afw',
    discoveryUrl: 'https://some.azure.server/.well-known/openid-configuration',
    redirectUri: 'msauth://auth-action-complete',
    logoutUrl: 'msauth://auth-action-complete',
    scope: 'openid email profile',
    audience: 'all-the-users',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Platform,
          useFactory: createPlatformMock,
        },
      ],
    });
    service = TestBed.inject(AuthenticationService);
    // The spy is global to the test to avoid log message about instantiating the plugin
    // with each test that does an init
    spyOn(AuthConnect, 'setup');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set config', () => {
    it('saves the config', async () => {
      spyOn(Preferences, 'set');
      await service.setConfig(providers[3], opt);
      expect(Preferences.set).toHaveBeenCalledTimes(2);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'auth-provider-options',
        value: JSON.stringify(opt),
      });
    });

    it('saves the provider', async () => {
      spyOn(Preferences, 'set');
      await service.setConfig(providers[3], opt);
      expect(Preferences.set).toHaveBeenCalledTimes(2);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'auth-provider',
        value: JSON.stringify(providers[3]),
      });
    });

    it('removes any flow', async () => {
      spyOn(Preferences, 'remove');
      await service.setConfig(providers[3], opt);
      expect(Preferences.remove).toHaveBeenCalledTimes(1);
      expect(Preferences.remove).toHaveBeenCalledWith({
        key: 'auth-flow',
      });
    });

    it('saves a flow if specified', async () => {
      spyOn(Preferences, 'remove');
      spyOn(Preferences, 'set');
      await service.setConfig(providers[3], opt, flows[1]);
      expect(Preferences.remove).not.toHaveBeenCalled();
      expect(Preferences.set).toHaveBeenCalledTimes(3);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'auth-flow',
        value: JSON.stringify(flows[1]),
      });
    });

    it('sets up AC for mobile', async () => {
      const platform = TestBed.inject(Platform);
      (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
      await service.setConfig(providers[3], opt);
      expect(AuthConnect.setup).toHaveBeenCalledTimes(1);
      expect(AuthConnect.setup).toHaveBeenCalledWith({
        platform: 'capacitor',
        logLevel: 'DEBUG',
        ios: {
          webView: 'private',
        },
        web: {
          uiMode: 'popup',
          authFlow: 'implicit',
        },
      });
    });

    it('sets up AC for web', async () => {
      const platform = TestBed.inject(Platform);
      (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(false);
      await service.setConfig(providers[3], opt, flows[1]);
      expect(AuthConnect.setup).toHaveBeenCalledTimes(1);
      expect(AuthConnect.setup).toHaveBeenCalledWith({
        platform: 'web',
        logLevel: 'DEBUG',
        ios: {
          webView: 'private',
        },
        web: {
          uiMode: 'popup',
          authFlow: flows[1].key,
        },
      });
    });
  });

  describe('get config', () => {
    it('fetches the config from storage', async () => {
      spyOn(Preferences, 'get').and.resolveTo({ value: JSON.stringify(opt) });
      await service.getConfig();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: 'auth-provider-options',
      });
    });

    it('caches the config', async () => {
      spyOn(Preferences, 'get').and.resolveTo({ value: JSON.stringify(opt) });
      await service.getConfig();
      await service.getConfig();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it('resolves the value', async () => {
      spyOn(Preferences, 'get').and.resolveTo({ value: JSON.stringify(opt) });
      expect(await service.getConfig()).toEqual(opt);
    });

    it('resolves undefined if there is no value', async () => {
      spyOn(Preferences, 'get').and.resolveTo({ value: null });
      expect(await service.getConfig()).toBeUndefined();
    });
  });

  describe('access token is expired', () => {
    let spy: jasmine.Spy;
    beforeEach(() => {
      spy = spyOn(Preferences, 'get');
      spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
        value: JSON.stringify(providers.find((p) => p.key === 'azure')),
      });
      spy
        .withArgs({ key: 'auth-provider-options' })
        .and.resolveTo({ value: JSON.stringify(azureConfig) });
      spy
        .withArgs({ key: 'auth-flow' })
        .and.resolveTo({ value: JSON.stringify(flows[0]) });
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({
        value: JSON.stringify({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        }),
      });
    });

    it('resolves false when it is not expired', async () => {
      spyOn(AuthConnect, 'isAccessTokenExpired').and.resolveTo(false);
      expect(await service.accessTokenIsExpired()).toBeFalse();
    });

    it('resolves true when it is expired', async () => {
      spyOn(AuthConnect, 'isAccessTokenExpired').and.resolveTo(true);
      expect(await service.accessTokenIsExpired()).toBeTrue();
    });

    it('resolves false if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      expect(await service.accessTokenIsExpired()).toBeFalse();
    });
  });

  describe('can refresh', () => {
    let spy: jasmine.Spy;
    beforeEach(() => {
      spy = spyOn(Preferences, 'get');
      spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
        value: JSON.stringify(providers.find((p) => p.key === 'azure')),
      });
      spy
        .withArgs({ key: 'auth-provider-options' })
        .and.resolveTo({ value: JSON.stringify(azureConfig) });
      spy
        .withArgs({ key: 'auth-flow' })
        .and.resolveTo({ value: JSON.stringify(flows[0]) });
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({
        value: JSON.stringify({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        }),
      });
    });

    it('resolves false when there is no refresh token', async () => {
      spyOn(AuthConnect, 'isRefreshTokenAvailable').and.resolveTo(false);
      expect(await service.canRefresh()).toBeFalse();
    });

    it('resolves true when a refresh token is available', async () => {
      spyOn(AuthConnect, 'isRefreshTokenAvailable').and.resolveTo(true);
      expect(await service.canRefresh()).toBeTrue();
    });

    it('resolves false if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      expect(await service.canRefresh()).toBeFalse();
    });
  });

  describe('get access token', () => {
    let spy: jasmine.Spy;
    beforeEach(() => {
      spy = spyOn(Preferences, 'get');
      spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
        value: JSON.stringify(providers.find((p) => p.key === 'azure')),
      });
      spy
        .withArgs({ key: 'auth-provider-options' })
        .and.resolveTo({ value: JSON.stringify(azureConfig) });
      spy
        .withArgs({ key: 'auth-flow' })
        .and.resolveTo({ value: JSON.stringify(flows[0]) });
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({
        value: JSON.stringify({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        }),
      });
    });

    it('resolves the access token', async () => {
      expect(await service.getAccessToken()).toEqual('the-access-token');
    });

    it('resolves undefined if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      expect(await service.getAccessToken()).toBeUndefined();
    });
  });

  describe('get flow', () => {
    it('fetches the flow from storage', async () => {
      spyOn(Preferences, 'get').and.resolveTo({
        value: JSON.stringify(flows[0]),
      });
      await service.getFlow();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: 'auth-flow',
      });
    });

    it('caches the flow', async () => {
      spyOn(Preferences, 'get').and.resolveTo({
        value: JSON.stringify(flows[0]),
      });
      await service.getFlow();
      await service.getFlow();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it('resolves the value', async () => {
      spyOn(Preferences, 'get').and.resolveTo({
        value: JSON.stringify(flows[0]),
      });
      expect(await service.getFlow()).toEqual(flows[0]);
    });

    it('resolves undefined if there is no value', async () => {
      spyOn(Preferences, 'get').and.resolveTo({ value: null });
      expect(await service.getFlow()).toBeUndefined();
    });
  });

  describe('get provider', () => {
    it('fetches the provider from storage', async () => {
      spyOn(Preferences, 'get').and.resolveTo({
        value: JSON.stringify(providers[0]),
      });
      await service.getProvider();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: 'auth-provider',
      });
    });

    it('caches the provider', async () => {
      spyOn(Preferences, 'get').and.resolveTo({
        value: JSON.stringify(providers[0]),
      });
      await service.getProvider();
      await service.getProvider();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it('resolves the value', async () => {
      spyOn(Preferences, 'get').and.resolveTo({
        value: JSON.stringify(providers[2]),
      });
      expect(await service.getProvider()).toEqual(providers[2]);
    });

    it('resolves undefined if there is no value', async () => {
      spyOn(Preferences, 'get').and.resolveTo({ value: null });
      expect(await service.getProvider()).toBeUndefined();
    });
  });

  // Note: the same init routine is followed with each method, but is only fully
  //       tested in the login
  describe('login', () => {
    beforeEach(() => {
      const platform = TestBed.inject(Platform);
      (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
      spyOn(AuthConnect, 'login').and.callFake(() =>
        Promise.resolve({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        } as any)
      );
    });

    describe('with nothing saved', () => {
      beforeEach(() => {
        spyOn(Preferences, 'get').and.resolveTo({ value: null });
      });

      it('gets the config', async () => {
        await service.login();
        expect(Preferences.get).toHaveBeenCalledTimes(2);
        expect(Preferences.get).toHaveBeenCalledWith({
          key: 'auth-provider-options',
        });
        expect(Preferences.get).toHaveBeenCalledWith({
          key: 'auth-flow',
        });
      });

      it('runs the init once', async () => {
        await service.login();
        await service.login();
        expect(Preferences.get).toHaveBeenCalledTimes(2);
      });

      it('creates with Cognito', async () => {
        spyOn(Preferences, 'set');
        await service.login();
        expect(Preferences.set).toHaveBeenCalledWith({
          key: 'auth-provider',
          value: JSON.stringify(providers.find((p) => p.key === 'cognito')),
        });
        expect(Preferences.set).toHaveBeenCalledWith({
          key: 'auth-provider-options',
          value: JSON.stringify(awsConfig),
        });
      });

      it('performs the login', async () => {
        await service.login();
        expect(AuthConnect.login).toHaveBeenCalledTimes(1);
        expect(AuthConnect.login).toHaveBeenCalledWith(
          jasmine.any(CognitoProvider),
          awsConfig
        );
      });

      it('save the auth result', async () => {
        spyOn(Preferences, 'set');
        await service.login();
        expect(Preferences.set).toHaveBeenCalledTimes(3);
        expect(Preferences.set).toHaveBeenCalledWith({
          key: 'auth-result',
          value: JSON.stringify({
            accessToken: 'the-access-token',
            refreshToken: 'the-refresh-token',
            idToken: 'the-id-token',
          }),
        });
      });

      describe('on web', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy)
            .withArgs('hybrid')
            .and.returnValue(false);
        });

        it('creates with Cognito', async () => {
          spyOn(Preferences, 'set');
          await service.login();
          expect(Preferences.set).toHaveBeenCalledWith({
            key: 'auth-provider',
            value: JSON.stringify(providers.find((p) => p.key === 'cognito')),
          });
          expect(Preferences.set).toHaveBeenCalledWith({
            key: 'auth-provider-options',
            value: JSON.stringify({
              ...awsConfig,
              redirectUri: 'http://localhost:8100/auth-action-complete',
              logoutUrl: 'http://localhost:8100/auth-action-complete',
            }),
          });
          expect(Preferences.set).toHaveBeenCalledWith({
            key: 'auth-flow',
            value: JSON.stringify(flows.find((f) => f.key === 'PKCE')),
          });
        });

        it('performs the login', async () => {
          await service.login();
          expect(AuthConnect.login).toHaveBeenCalledTimes(1);
          expect(AuthConnect.login).toHaveBeenCalledWith(
            jasmine.any(CognitoProvider),
            { ...awsConfig, ...webConfig }
          );
        });

        it('save the auth result', async () => {
          spyOn(Preferences, 'set');
          await service.login();
          expect(Preferences.set).toHaveBeenCalledTimes(4);
          expect(Preferences.set).toHaveBeenCalledWith({
            key: 'auth-result',
            value: JSON.stringify({
              accessToken: 'the-access-token',
              refreshToken: 'the-refresh-token',
              idToken: 'the-id-token',
            }),
          });
        });
      });
    });

    describe('with saved data', () => {
      let spy: jasmine.Spy;
      beforeEach(() => {
        spy = spyOn(Preferences, 'get');
        spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
          value: JSON.stringify(providers.find((p) => p.key === 'azure')),
        });
        spy
          .withArgs({ key: 'auth-provider-options' })
          .and.resolveTo({ value: JSON.stringify(azureConfig) });
        spy
          .withArgs({ key: 'auth-flow' })
          .and.resolveTo({ value: JSON.stringify(flows[0]) });
        spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      });

      it('gets all of the things', async () => {
        await service.login();
        expect(Preferences.get).toHaveBeenCalledTimes(4);
        expect(Preferences.get).toHaveBeenCalledWith({
          key: 'auth-provider-options',
        });
        expect(Preferences.get).toHaveBeenCalledWith({
          key: 'auth-provider',
        });
        expect(Preferences.get).toHaveBeenCalledWith({
          key: 'auth-flow',
        });
        expect(Preferences.get).toHaveBeenCalledWith({
          key: 'auth-result',
        });
      });

      it('performs the login', async () => {
        await service.login();
        expect(AuthConnect.login).toHaveBeenCalledTimes(1);
      });

      it('does not perform the login if there is any auth result', async () => {
        spy.withArgs({ key: 'auth-result' }).and.resolveTo({
          value: JSON.stringify({
            accessToken: 'the-access-token',
            refreshToken: 'the-refresh-token',
            idToken: 'the-id-token',
          }),
        });
        await service.login();
        expect(AuthConnect.login).not.toHaveBeenCalled();
      });
    });
  });

  describe('logout', () => {
    let spy: jasmine.Spy;
    beforeEach(() => {
      spy = spyOn(Preferences, 'get');
      spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
        value: JSON.stringify(providers.find((p) => p.key === 'azure')),
      });
      spy
        .withArgs({ key: 'auth-provider-options' })
        .and.resolveTo({ value: JSON.stringify(azureConfig) });
      spy
        .withArgs({ key: 'auth-flow' })
        .and.resolveTo({ value: JSON.stringify(flows[0]) });
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({
        value: JSON.stringify({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        }),
      });
    });

    it('performs the logout', async () => {
      spyOn(AuthConnect, 'logout');
      await service.logout();
      expect(AuthConnect.logout).toHaveBeenCalledTimes(1);
      expect(AuthConnect.logout).toHaveBeenCalledWith(
        jasmine.any(AzureProvider),
        {
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        } as any
      );
    });

    it('removes the auth result', async () => {
      spyOn(AuthConnect, 'logout');
      spyOn(Preferences, 'remove');
      await service.logout();
      expect(Preferences.remove).toHaveBeenCalledTimes(1);
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth-result' });
    });

    it('does not perform the logout if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      spyOn(AuthConnect, 'logout');
      await service.logout();
      expect(AuthConnect.logout).not.toHaveBeenCalled();
    });
  });

  describe('refresh', () => {
    let spy: jasmine.Spy;
    beforeEach(() => {
      spy = spyOn(Preferences, 'get');
      spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
        value: JSON.stringify(providers.find((p) => p.key === 'azure')),
      });
      spy
        .withArgs({ key: 'auth-provider-options' })
        .and.resolveTo({ value: JSON.stringify(azureConfig) });
      spy
        .withArgs({ key: 'auth-flow' })
        .and.resolveTo({ value: JSON.stringify(flows[0]) });
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({
        value: JSON.stringify({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        }),
      });
    });

    it('performs the refresh of the session', async () => {
      spyOn(AuthConnect, 'refreshSession').and.resolveTo({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
      } as any);
      await service.refresh();
      expect(AuthConnect.refreshSession).toHaveBeenCalledTimes(1);
      expect(AuthConnect.refreshSession).toHaveBeenCalledWith(
        jasmine.any(AzureProvider),
        {
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        } as any
      );
    });

    it('saves the new auth results', async () => {
      spyOn(Preferences, 'set');
      spyOn(AuthConnect, 'refreshSession').and.resolveTo({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
      } as any);
      await service.refresh();
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'auth-result',
        value: JSON.stringify({
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          idToken: 'new-id-token',
        }),
      });
    });

    it('uses the new auth results', async () => {
      spyOn(AuthConnect, 'logout');
      spyOn(AuthConnect, 'refreshSession').and.resolveTo({
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
      } as any);
      await service.refresh();
      await service.logout();
      expect(AuthConnect.logout).toHaveBeenCalledWith(
        jasmine.any(AzureProvider),
        {
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          idToken: 'new-id-token',
        } as any
      );
    });

    it('does not refresh the session if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      spyOn(AuthConnect, 'refreshSession');
      await service.refresh();
      expect(AuthConnect.refreshSession).not.toHaveBeenCalled();
    });
  });

  describe('is authenticated', () => {
    let spy: jasmine.Spy;
    beforeEach(() => {
      spy = spyOn(Preferences, 'get');
      spy.withArgs({ key: 'auth-provider' }).and.resolveTo({
        value: JSON.stringify(providers.find((p) => p.key === 'azure')),
      });
      spy
        .withArgs({ key: 'auth-provider-options' })
        .and.resolveTo({ value: JSON.stringify(azureConfig) });
      spy
        .withArgs({ key: 'auth-flow' })
        .and.resolveTo({ value: JSON.stringify(flows[0]) });
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({
        value: JSON.stringify({
          accessToken: 'the-access-token',
          refreshToken: 'the-refresh-token',
          idToken: 'the-id-token',
        }),
      });
    });

    it('is true when there is an auth-result and an access token is available', async () => {
      spyOn(AuthConnect, 'isAccessTokenAvailable').and.resolveTo(true);
      expect(await service.isAuthenticated()).toBeTrue();
    });

    it('is false when there is an auth-result and an access token is not available', async () => {
      spyOn(AuthConnect, 'isAccessTokenAvailable').and.resolveTo(false);
      expect(await service.isAuthenticated()).toBeFalse();
    });

    it('is false if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      expect(await service.isAuthenticated()).toBeFalse();
    });
  });
});
