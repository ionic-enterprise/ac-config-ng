import { TestBed } from '@angular/core/testing';
import { AuthenticationService } from './authentication.service';
import {
  awsConfig,
  azureConfig,
  mobileConfigExtras,
  webConfigExtras,
} from '@env/environment';
import { IonicAuthFactoryService } from '../ionic-auth-factory/ionic-auth-factory.service';
import { createIonicAuthFactoryServiceMock } from '../testing';
import { Platform } from '@ionic/angular';
import { createPlatformMock } from '@test/mocks';
import { IonicAuth } from '@ionic-enterprise/auth';
import { Preferences } from '@capacitor/preferences';

describe('AuthenticationService', () => {
  let service: AuthenticationService;
  let authenticator: IonicAuth;

  beforeEach(() => {
    authenticator = jasmine.createSpyObj<IonicAuth>('IonicAuth', {
      login: Promise.resolve(),
      logout: Promise.resolve(),
      refreshSession: Promise.resolve(),
      isAuthenticated: Promise.resolve(false),
    });

    TestBed.configureTestingModule({
      providers: [
        {
          provide: IonicAuthFactoryService,
          useFactory: createIonicAuthFactoryServiceMock,
        },
        {
          provide: Platform,
          useFactory: createPlatformMock,
        },
      ],
    });
    service = TestBed.inject(AuthenticationService);
    const factory = TestBed.inject(IonicAuthFactoryService);
    (factory.create as jasmine.Spy).and.returnValue(authenticator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('set base config', () => {
    it('saves the config', async () => {
      spyOn(Preferences, 'set');
      await service.setBaseConfig({
        authConfig: 'azure' as 'azure',
        clientID: '4273afw',
        discoveryUrl:
          'https://some.azure.server/.well-known/openid-configuration',
        scope: 'openid email profile',
        audience: 'all-the-users',
        webAuthFlow: 'PKCE' as 'PKCE',
      });
      expect(Preferences.set).toHaveBeenCalledTimes(1);
      expect(Preferences.set).toHaveBeenCalledWith({
        key: 'base-config',
        value: JSON.stringify({
          authConfig: 'azure' as 'azure',
          clientID: '4273afw',
          discoveryUrl:
            'https://some.azure.server/.well-known/openid-configuration',
          scope: 'openid email profile',
          audience: 'all-the-users',
          webAuthFlow: 'PKCE' as 'PKCE',
        }),
      });
    });

    it('invalidates the current authenticator', async () => {
      const factory = TestBed.inject(IonicAuthFactoryService);
      await service.logout();
      expect(factory.create).toHaveBeenCalledTimes(1);
      await service.setBaseConfig({
        authConfig: 'azure' as 'azure',
        clientID: '4273afw',
        discoveryUrl:
          'https://some.azure.server/.well-known/openid-configuration',
        scope: 'openid email profile',
        audience: 'all-the-users',
        webAuthFlow: 'PKCE' as 'PKCE',
      });
      await service.login();
      expect(factory.create).toHaveBeenCalledTimes(2);
    });
  });

  describe('get config', () => {
    describe('for web', () => {
      it('resolves the AWS config by default', async () => {
        expect(await service.getConfig('web')).toEqual({
          authConfig: 'cognito' as 'cognito',
          clientID: '64p9c53l5thd5dikra675suvq9',
          discoveryUrl:
            'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
          scope: 'openid email profile',
          audience: '',
          webAuthFlow: 'PKCE' as 'PKCE',
          logLevel: 'DEBUG' as 'DEBUG',
          redirectUri: 'http://localhost:8100/login',
          logoutUrl: 'http://localhost:8100/login',
          platform: 'web' as 'web',
        });
      });

      it('resolves the modified config if it exists', async () => {
        spyOn(Preferences, 'get').and.resolveTo({
          value: JSON.stringify({
            authConfig: 'azure' as 'azure',
            clientID: '4273afw',
            discoveryUrl:
              'https://some.azure.server/.well-known/openid-configuration',
            scope: 'openid email profile',
            audience: 'all-the-users',
            webAuthFlow: 'PKCE' as 'PKCE',
          }),
        });
        expect(await service.getConfig('web')).toEqual({
          authConfig: 'azure' as 'azure',
          clientID: '4273afw',
          discoveryUrl:
            'https://some.azure.server/.well-known/openid-configuration',
          scope: 'openid email profile',
          audience: 'all-the-users',
          webAuthFlow: 'PKCE' as 'PKCE',
          logLevel: 'DEBUG' as 'DEBUG',
          redirectUri: 'http://localhost:8100/login',
          logoutUrl: 'http://localhost:8100/login',
          platform: 'web' as 'web',
        });
      });

      it('does not use an alternate redirect and logout URL for our Azure instance', async () => {
        spyOn(Preferences, 'get').and.resolveTo({
          value: JSON.stringify(azureConfig),
        });
        expect(await service.getConfig('web')).toEqual({
          ...azureConfig,
          logLevel: 'DEBUG' as 'DEBUG',
          redirectUri: 'http://localhost:8100/login',
          logoutUrl: 'http://localhost:8100/login',
          platform: 'web' as 'web',
        });
      });
    });

    describe('for mobile', () => {
      it('resolves the AWS config by default', async () => {
        expect(await service.getConfig('mobile')).toEqual({
          authConfig: 'cognito' as 'cognito',
          clientID: '64p9c53l5thd5dikra675suvq9',
          discoveryUrl:
            'https://cognito-idp.us-east-2.amazonaws.com/us-east-2_YU8VQe29z/.well-known/openid-configuration',
          scope: 'openid email profile',
          audience: '',
          webAuthFlow: 'PKCE' as 'PKCE',
          logLevel: 'DEBUG' as 'DEBUG',
          redirectUri: 'msauth://login',
          logoutUrl: 'msauth://login',
          platform: 'capacitor' as 'capacitor',
          iosWebView: 'private' as 'private',
        });
      });

      it('resolves the modified config if it exists', async () => {
        spyOn(Preferences, 'get').and.resolveTo({
          value: JSON.stringify({
            authConfig: 'azure' as 'azure',
            clientID: '4273afw',
            discoveryUrl:
              'https://some.azure.server/.well-known/openid-configuration',
            scope: 'openid email profile',
            audience: 'all-the-users',
            webAuthFlow: 'PKCE' as 'PKCE',
          }),
        });
        expect(await service.getConfig('mobile')).toEqual({
          authConfig: 'azure' as 'azure',
          clientID: '4273afw',
          discoveryUrl:
            'https://some.azure.server/.well-known/openid-configuration',
          scope: 'openid email profile',
          audience: 'all-the-users',
          webAuthFlow: 'PKCE' as 'PKCE',
          logLevel: 'DEBUG' as 'DEBUG',
          redirectUri: 'msauth://login',
          logoutUrl: 'msauth://login',
          platform: 'capacitor' as 'capacitor',
          iosWebView: 'private' as 'private',
        });
      });

      it('uses an alternate redirect and logout URL for our Azure instance', async () => {
        spyOn(Preferences, 'get').and.resolveTo({
          value: JSON.stringify(azureConfig),
        });
        expect(await service.getConfig('mobile')).toEqual({
          ...azureConfig,
          logLevel: 'DEBUG' as 'DEBUG',
          redirectUri:
            'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D',
          logoutUrl:
            'msauth://com.ionic.acprovider/O5m5Gtd2Xt8UNkW3wk7DWyKGfv8%3D',
          platform: 'capacitor' as 'capacitor',
          iosWebView: 'private' as 'private',
        });
      });
    });
  });

  describe('login', () => {
    describe('for web', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(false);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.login();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...webConfigExtras,
        });
        await service.login();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    describe('for mobile', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(true);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.login();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...mobileConfigExtras,
        });
        await service.login();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    it('calls the login', async () => {
      await service.login();
      expect(authenticator.login).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout', () => {
    describe('for web', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(false);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.logout();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...webConfigExtras,
        });
        await service.logout();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    describe('for mobile', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(true);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.logout();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...mobileConfigExtras,
        });
        await service.logout();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    it('calls the logout', async () => {
      await service.logout();
      expect(authenticator.logout).toHaveBeenCalledTimes(1);
    });
  });

  describe('refresh', () => {
    describe('for web', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(false);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.refresh();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...webConfigExtras,
        });
        await service.refresh();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    describe('for mobile', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(true);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.refresh();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...mobileConfigExtras,
        });
        await service.refresh();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    it('calls the refresh session', async () => {
      await service.refresh();
      expect(authenticator.refreshSession).toHaveBeenCalledTimes(1);
    });
  });

  describe('is authenticated', () => {
    describe('for web', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(false);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.isAuthenticated();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...webConfigExtras,
        });
        await service.isAuthenticated();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    describe('for mobile', () => {
      beforeEach(() => {
        const platform = TestBed.inject(Platform);
        (platform.is as jasmine.Spy).and.returnValue(true);
      });

      it('creates an authenticator if one does not exist', async () => {
        const factory = TestBed.inject(IonicAuthFactoryService);
        await service.isAuthenticated();
        expect(factory.create).toHaveBeenCalledTimes(1);
        expect(factory.create).toHaveBeenCalledWith({
          logLevel: 'DEBUG' as 'DEBUG',
          ...awsConfig,
          ...mobileConfigExtras,
        });
        await service.isAuthenticated();
        expect(factory.create).toHaveBeenCalledTimes(1);
      });
    });

    it('calls the resolves the value from the authenticator', async () => {
      (authenticator.isAuthenticated as jasmine.Spy).and.returnValue(
        Promise.resolve(true)
      );
      expect(await service.isAuthenticated()).toBe(true);
      (authenticator.isAuthenticated as jasmine.Spy).and.returnValue(
        Promise.resolve(false)
      );
      expect(await service.isAuthenticated()).toBe(false);
    });
  });
});
