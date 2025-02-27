import { TestBed } from '@angular/core/testing';
import { flows, providers } from '@app/data';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { awsConfig, azureConfig, webConfig } from '@env/environment';
import {
  AuthConnect,
  AuthResult,
  AzureProvider,
  CognitoProvider,
  ProviderOptions,
} from '@ionic-enterprise/auth';
import { AuthenticationService } from './authentication.service';

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
    service = TestBed.inject(AuthenticationService);
    spyOn(Capacitor, 'isNativePlatform').and.returnValue(true);
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
      (Capacitor.isNativePlatform as jasmine.Spy).and.returnValue(true);
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
      (Capacitor.isNativePlatform as jasmine.Spy).and.returnValue(false);
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
        value: JSON.stringify(testAuthResult),
      });
    });

    it('resolves false when it is not expired', async () => {
      spyOn(AuthConnect, 'isAccessTokenExpired').and.resolveTo(false);
      await service.initialize();
      expect(await service.accessTokenIsExpired()).toBeFalse();
    });

    it('resolves true when it is expired', async () => {
      spyOn(AuthConnect, 'isAccessTokenExpired').and.resolveTo(true);
      await service.initialize();
      expect(await service.accessTokenIsExpired()).toBeTrue();
    });

    it('resolves false if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      await service.initialize();
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
        value: JSON.stringify(testAuthResult),
      });
    });

    it('resolves false when there is no refresh token', async () => {
      spyOn(AuthConnect, 'isRefreshTokenAvailable').and.resolveTo(false);
      await service.initialize();
      expect(await service.canRefresh()).toBeFalse();
    });

    it('resolves true when a refresh token is available', async () => {
      spyOn(AuthConnect, 'isRefreshTokenAvailable').and.resolveTo(true);
      await service.initialize();
      expect(await service.canRefresh()).toBeTrue();
    });

    it('resolves false if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      await service.initialize();
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
        value: JSON.stringify(testAuthResult),
      });
    });

    it('resolves the access token', async () => {
      await service.initialize();
      expect(await service.getAccessToken()).toEqual('the-access-token');
    });

    it('resolves undefined if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      await service.initialize();
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
      (Capacitor.isNativePlatform as jasmine.Spy).and.returnValue(true);
      spyOn(AuthConnect, 'login').and.callFake(() =>
        Promise.resolve(testAuthResult),
      );
    });

    describe('with nothing saved', () => {
      beforeEach(() => {
        spyOn(Preferences, 'get').and.resolveTo({ value: null });
      });

      it('gets the config', async () => {
        await service.initialize();
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
        await service.initialize();
        await service.login();
        await service.login();
        expect(Preferences.get).toHaveBeenCalledTimes(2);
      });

      it('creates with Cognito', async () => {
        spyOn(Preferences, 'set');
        await service.initialize();
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
        await service.initialize();
        await service.login();
        expect(AuthConnect.login).toHaveBeenCalledTimes(1);
        expect(AuthConnect.login).toHaveBeenCalledWith(
          jasmine.any(CognitoProvider),
          awsConfig,
        );
      });

      it('save the auth result', async () => {
        spyOn(Preferences, 'set');
        await service.initialize();
        await service.login();
        expect(Preferences.set).toHaveBeenCalledTimes(3);
        expect(Preferences.set).toHaveBeenCalledWith({
          key: 'auth-result',
          value: JSON.stringify(testAuthResult),
        });
      });

      describe('on web', () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as jasmine.Spy).and.returnValue(false);
        });

        it('creates with Cognito', async () => {
          spyOn(Preferences, 'set');
          await service.initialize();
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
          await service.initialize();
          await service.login();
          expect(AuthConnect.login).toHaveBeenCalledTimes(1);
          expect(AuthConnect.login).toHaveBeenCalledWith(
            jasmine.any(CognitoProvider),
            { ...awsConfig, ...webConfig },
          );
        });

        it('save the auth result', async () => {
          spyOn(Preferences, 'set');
          await service.initialize();
          await service.login();
          expect(Preferences.set).toHaveBeenCalledTimes(4);
          expect(Preferences.set).toHaveBeenCalledWith({
            key: 'auth-result',
            value: JSON.stringify(testAuthResult),
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
        await service.initialize();
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
        await service.initialize();
        await service.login();
        expect(AuthConnect.login).toHaveBeenCalledTimes(1);
      });

      it('does not perform the login if there is any auth result', async () => {
        spy.withArgs({ key: 'auth-result' }).and.resolveTo({
          value: JSON.stringify(testAuthResult),
        });
        await service.initialize();
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
        value: JSON.stringify(testAuthResult),
      });
    });

    it('performs the logout', async () => {
      spyOn(AuthConnect, 'logout');
      await service.initialize();
      await service.logout();
      expect(AuthConnect.logout).toHaveBeenCalledTimes(1);
      expect(AuthConnect.logout).toHaveBeenCalledWith(
        jasmine.any(AzureProvider),
        testAuthResult,
      );
    });

    it('removes the auth result', async () => {
      spyOn(AuthConnect, 'logout');
      spyOn(Preferences, 'remove');
      await service.initialize();
      await service.logout();
      expect(Preferences.remove).toHaveBeenCalledTimes(1);
      expect(Preferences.remove).toHaveBeenCalledWith({ key: 'auth-result' });
    });

    it('does not perform the logout if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      spyOn(AuthConnect, 'logout');
      await service.initialize();
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
        value: JSON.stringify(testAuthResult),
      });
    });

    it('performs the refresh of the session', async () => {
      spyOn(AuthConnect, 'refreshSession').and.resolveTo({
        ...testAuthResult,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
      });
      await service.initialize();
      await service.refresh();
      expect(AuthConnect.refreshSession).toHaveBeenCalledTimes(1);
      expect(AuthConnect.refreshSession).toHaveBeenCalledWith(
        jasmine.any(AzureProvider),
        testAuthResult,
      );
    });

    it('saves the new auth results', async () => {
      spyOn(Preferences, 'set');
      spyOn(AuthConnect, 'refreshSession').and.resolveTo({
        ...testAuthResult,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
      });
      await service.initialize();
      await service.refresh();
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'auth-result',
        value: JSON.stringify({
          ...testAuthResult,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          idToken: 'new-id-token',
        }),
      });
    });

    it('uses the new auth results', async () => {
      spyOn(AuthConnect, 'logout');
      spyOn(AuthConnect, 'refreshSession').and.resolveTo({
        ...testAuthResult,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        idToken: 'new-id-token',
      });
      await service.initialize();
      await service.refresh();
      await service.logout();
      expect(AuthConnect.logout).toHaveBeenCalledWith(
        jasmine.any(AzureProvider),
        {
          ...testAuthResult,
          accessToken: 'new-access-token',
          refreshToken: 'new-refresh-token',
          idToken: 'new-id-token',
        },
      );
    });

    it('does not refresh the session if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      spyOn(AuthConnect, 'refreshSession');
      await service.initialize();
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
        value: JSON.stringify(testAuthResult),
      });
    });

    it('is true when there is an auth-result and an access token is available', async () => {
      spyOn(AuthConnect, 'isAccessTokenAvailable').and.resolveTo(true);
      await service.initialize();
      expect(await service.isAuthenticated()).toBeTrue();
    });

    it('is false when there is an auth-result and an access token is not available', async () => {
      spyOn(AuthConnect, 'isAccessTokenAvailable').and.resolveTo(false);
      await service.initialize();
      expect(await service.isAuthenticated()).toBeFalse();
    });

    it('is false if there is no auth result', async () => {
      spy.withArgs({ key: 'auth-result' }).and.resolveTo({ value: null });
      await service.initialize();
      expect(await service.isAuthenticated()).toBeFalse();
    });
  });
});

const testAuthResult: AuthResult = {
  accessToken: 'the-access-token',
  idToken: 'the-id-token',
  refreshToken: 'the-refresh-token',
  expiresIn: 3600,
  tokenType: 'Bearer',
  scope: 'undefined',
  state: {
    url: 'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1_acdemo2',
  },
  receivedAt: 1734522164,
  config: {
    platform: 'web',
    logLevel: 'DEBUG',
    ios: {
      webView: 'private',
    },
    web: {
      uiMode: 'popup',
      authFlow: 'implicit',
    },
  },
  provider: {
    config: {
      url: 'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1_acdemo2',
    },
    manifest: {
      issuer:
        'https://dtjacdemo.b2clogin.com/20f8e206-5bfd-4085-9ab0-9e2fca01f2a4/v2.0/',
      authorization_endpoint:
        'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/oauth2/v2.0/authorize?p=b2c_1_acdemo2',
      token_endpoint:
        'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/oauth2/v2.0/token?p=b2c_1_acdemo2',
      end_session_endpoint:
        'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/oauth2/v2.0/logout?p=b2c_1_acdemo2',
      jwks_uri:
        'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/discovery/v2.0/keys?p=b2c_1_acdemo2',
      response_modes_supported: ['query', 'fragment', 'form_post'],
      response_types_supported: [
        'code',
        'code id_token',
        'code token',
        'code id_token token',
        'id_token',
        'id_token token',
        'token',
        'token id_token',
      ],
      scopes_supported: ['openid'],
      subject_types_supported: ['pairwise'],
      id_token_signing_alg_values_supported: ['RS256'],
      token_endpoint_auth_methods_supported: [
        'client_secret_post',
        'client_secret_basic',
      ],
      claims_supported: [
        'idp',
        'name',
        'sub',
        'tfp',
        'iss',
        'iat',
        'exp',
        'aud',
        'acr',
        'nonce',
        'auth_time',
      ],
    },
    options: {
      clientId: 'ed8cb65d-7bb2-4107-bc36-557fb680b994',
      scope:
        'openid offline_access email profile https://dtjacdemo.onmicrosoft.com/ed8cb65d-7bb2-4107-bc36-557fb680b994/demo.read',
      discoveryUrl:
        'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/v2.0/.well-known/openid-configuration?p=B2C_1_acdemo2',
      redirectUri: 'http://localhost:8100/auth-action-complete',
      logoutUrl: 'http://localhost:8100/auth-action-complete',
      audience: '',
    },
    authorizeUrl:
      'https://dtjacdemo.b2clogin.com/dtjacdemo.onmicrosoft.com/oauth2/v2.0/authorize?client_id=ed8cb65d-7bb2-4107-bc36-557fb680b994&redirect_uri=http%3A%2F%2Flocalhost%3A8100%2Fauth-action-complete&scope=openid%20offline_access%20email%20profile%20https%3A%2F%2Fdtjacdemo.onmicrosoft.com%2Fed8cb65d-7bb2-4107-bc36-557fb680b994%2Fdemo.read&nonce=O-t1sg95OeTuPsNhC2NZ&state=eyJ1cmwiOiJodHRwczovL2R0amFjZGVtby5iMmNsb2dpbi5jb20vZHRqYWNkZW1vLm9ubWljcm9zb2Z0LmNvbS9vYXV0aDIvdjIuMC90b2tlbj9wPWIyY18xX2FjZGVtbzIifQ&response_type=id_token%20token&response_mode=fragment&p=b2c_1_acdemo2',
  },
  rawResult:
    '#state=eyJ1cmwiOiJodHRwczovL2R0amFjZGVtby5iMmNsb2dpbi5jb20vZHRqYWNkZW1vLm9ubWljcm9zb2Z0LmNvbS9vYXV0aDIvdjIuMC90b2tlbj9wPWIyY18xX2FjZGVtbzIifQ&access_token=eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJhdWQiOiJlZDhjYjY1ZC03YmIyLTQxMDctYmMzNi01NTdmYjY4MGI5OTQiLCJpc3MiOiJodHRwczovL2R0amFjZGVtby5iMmNsb2dpbi5jb20vMjBmOGUyMDYtNWJmZC00MDg1LTlhYjAtOWUyZmNhMDFmMmE0L3YyLjAvIiwiZXhwIjoxNzM0NTI1NzYzLCJuYmYiOjE3MzQ1MjIxNjMsInN1YiI6ImYwZmM5MGQ1LWU0ODEtNDY5Ni1hMGQ3LThmZDI5NjIzNmRmNiIsIm5hbWUiOiJUZXN0IFVzZXIiLCJ0ZnAiOiJCMkNfMV9hY2RlbW8yIiwibm9uY2UiOiJPLXQxc2c5NU9lVHVQc05oQzJOWiIsInNjcCI6ImRlbW8ucmVhZCIsImF6cCI6ImVkOGNiNjVkLTdiYjItNDEwNy1iYzM2LTU1N2ZiNjgwYjk5NCIsInZlciI6IjEuMCIsImlhdCI6MTczNDUyMjE2M30.QyHw7d_6TTNNVu7_ceMpmAH1SbsD609DNCxAQQuQNaz_wr9JyeXxn0Dykxm-QoIejl7DIkXG6XQsoVCfsm2sC0JINts-lqFPCgdS-afMkc3yNccJlbyYYb_iBXmhRfpfx2329R-4qAElwQgaQwSZqfBGhOtSTF8iwl6YZla51IFnPmMPopEUeb30NywI6QLYThGkmHYbrh_BCezY98BOLS66XssUgjcXi7qHAEJJlaDzxtA77BdoTPcNhJwdTTfgi9J433auMertmALhYtq2vvLVgZb3ypxQmYl_--XcZPavKwDFpz7tlA5TtP1I7SKaJkec7uOb8dolptMyyVtSQg&token_type=Bearer&expires_in=3600&id_token=eyJhbGciOiJSUzI1NiIsImtpZCI6Ilg1ZVhrNHh5b2pORnVtMWtsMll0djhkbE5QNC1jNTdkTzZRR1RWQndhTmsiLCJ0eXAiOiJKV1QifQ.eyJleHAiOjE3MzQ1MjU3NjMsIm5iZiI6MTczNDUyMjE2MywidmVyIjoiMS4wIiwiaXNzIjoiaHR0cHM6Ly9kdGphY2RlbW8uYjJjbG9naW4uY29tLzIwZjhlMjA2LTViZmQtNDA4NS05YWIwLTllMmZjYTAxZjJhNC92Mi4wLyIsInN1YiI6ImYwZmM5MGQ1LWU0ODEtNDY5Ni1hMGQ3LThmZDI5NjIzNmRmNiIsImF1ZCI6ImVkOGNiNjVkLTdiYjItNDEwNy1iYzM2LTU1N2ZiNjgwYjk5NCIsIm5vbmNlIjoiTy10MXNnOTVPZVR1UHNOaEMyTloiLCJpYXQiOjE3MzQ1MjIxNjMsImF1dGhfdGltZSI6MTczNDUyMjE2MywibmFtZSI6IlRlc3QgVXNlciIsInRmcCI6IkIyQ18xX2FjZGVtbzIiLCJhdF9oYXNoIjoiYkhfN2NTVERUYmJ3d0FvV3ZGcTJRUSJ9.S8aHbgTfjQ3tWajg2pDeEZnacvycTCnmqbFGv7cgIhA507L333NP6Eq8baHfGOx5AE2nA3S9LO1HSvmVAxq8S0g8ioevIYNovpXJZ1YEdBq1z_xXCxHFAhw0IxDh3xwudkD2frLygSUj8b_v2Rf-MM0zRcgAtS74qH3sCcvO0eZudZjTFNu7T2XecDQWND11MdPQAd3S7r3pyQdLp4SF2g30vdW8Of9BDOKuHYe4Y3ctJHvFWtBEQOSYW8_9AAJ01xNfkgZ71qQACh_yb9qoV1Na4ynNL7VEBUMAk6bG1iPTM5-_SZ1ZcaeSwWRi0P0sSFCWUqNnSZLq1H0_MOZkaA',
};
