import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { flows, providers } from '@app/data';
import {
  auth0Config,
  awsConfig,
  azureConfig,
  oktaConfig,
  webConfig,
} from '@env/environment';
import { Platform } from '@ionic/angular';
import { createPlatformMock } from '@test/mocks';
import { click, setInputValue } from '@test/util';
import { SettingsPage } from './settings.page';
import { config } from '../../config';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    config.authUrlScheme = 'msauth';
    TestBed.configureTestingModule({
      imports: [SettingsPage],
    })
      .overrideProvider(AuthenticationService, {
        useFactory: createAuthenticationServiceMock,
      })
      .overrideProvider(Platform, { useFactory: createPlatformMock })
      .compileComponents();

    const auth = TestBed.inject(AuthenticationService);
    (auth.getConfig as jasmine.Spy).and.resolveTo({
      ...auth0Config,
    });
    (auth.getProvider as jasmine.Spy).and.resolveTo({
      ...providers.find((p) => p.key === 'auth0'),
    });
    (auth.getFlow as jasmine.Spy).and.resolveTo({
      ...flows.find((p) => p.key === 'PKCE'),
    });

    const platform = TestBed.inject(Platform);
    (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(false);

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('when logged in', () => {
    beforeEach(async () => {
      const authentication = TestBed.inject(AuthenticationService);
      (authentication.isAuthenticated as jasmine.Spy).and.resolveTo(true);
      await component.ionViewDidEnter();
      fixture.detectChanges();
    });

    it('displays a message to logout first', () => {
      const label = fixture.debugElement.query(
        By.css('[data-testid="logout-message"]')
      );
      expect(label).toBeTruthy();
      expect(label.nativeElement.textContent.trim()).toBe(
        'Please log out first'
      );
    });

    it('does not allow swaps', () => {
      let button = fixture.debugElement.query(
        By.css('[data-testid="use-azure"]')
      );
      expect(button.nativeElement.disabled).toBe(true);
      button = fixture.debugElement.query(By.css('[data-testid="use-aws"]'));
      expect(button.nativeElement.disabled).toBe(true);
      button = fixture.debugElement.query(By.css('[data-testid="use-auth0"]'));
      expect(button.nativeElement.disabled).toBe(true);
      button = fixture.debugElement.query(By.css('[data-testid="use-okta"]'));
      expect(button.nativeElement.disabled).toBe(true);
      button = fixture.debugElement.query(
        By.css('[data-testid="use-customization"]')
      );
      expect(button.nativeElement.disabled).toBe(true);
    });

    describe('client ID', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="client-id-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.clientId);
      });

      it('is disabled', () => {
        expect(input.nativeElement.disabled).toEqual(true);
      });
    });

    describe('discovery URL', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="discovery-url-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.discoveryUrl);
      });

      it('is disabled', () => {
        expect(input.nativeElement.disabled).toEqual(true);
      });
    });

    describe('scope', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="scope-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.scope);
      });

      it('is disabled', () => {
        expect(input.nativeElement.disabled).toEqual(true);
      });
    });

    describe('audience', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="audience-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.audience);
      });

      it('is disabled', () => {
        expect(input.nativeElement.disabled).toEqual(true);
      });
    });
  });

  describe('when not logged in', () => {
    beforeEach(async () => {
      const authentication = TestBed.inject(AuthenticationService);
      (authentication.isAuthenticated as jasmine.Spy).and.resolveTo(false);
      await component.ionViewDidEnter();
      fixture.detectChanges();
    });

    it('does not display a message to logout first', () => {
      const label = fixture.debugElement.query(
        By.css('[data-testid="logout-message"]')
      );
      expect(label).toBeFalsy();
    });

    it('allows swaps', () => {
      let button = fixture.debugElement.query(
        By.css('[data-testid="use-azure"]')
      );
      expect(button.nativeElement.disabled).toBe(false);
      button = fixture.debugElement.query(By.css('[data-testid="use-aws"]'));
      expect(button.nativeElement.disabled).toBe(false);
      button = fixture.debugElement.query(By.css('[data-testid="use-auth0"]'));
      expect(button.nativeElement.disabled).toBe(false);
      button = fixture.debugElement.query(By.css('[data-testid="use-okta"]'));
      expect(button.nativeElement.disabled).toBe(false);
      button = fixture.debugElement.query(
        By.css('[data-testid="use-customization"]')
      );
      expect(button.nativeElement.disabled).toBe(false);
    });

    describe('with a non-standard auth URL scheme', () => {
      beforeEach(async () => {
        config.authUrlScheme = 'com.something.somewhere';
        await component.ionViewDidEnter();
        fixture.detectChanges();
      });

      it('disabled the big four templates', () => {
        let button = fixture.debugElement.query(
          By.css('[data-testid="use-azure"]')
        );
        expect(button.nativeElement.disabled).toBe(true);
        button = fixture.debugElement.query(By.css('[data-testid="use-aws"]'));
        expect(button.nativeElement.disabled).toBe(true);
        button = fixture.debugElement.query(
          By.css('[data-testid="use-auth0"]')
        );
        expect(button.nativeElement.disabled).toBe(true);
        button = fixture.debugElement.query(By.css('[data-testid="use-okta"]'));
        expect(button.nativeElement.disabled).toBe(true);
      });

      it('allows customization', () => {
        const button = fixture.debugElement.query(
          By.css('[data-testid="use-customization"]')
        );
        expect(button.nativeElement.disabled).toBe(false);
      });
    });

    describe('azure button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(
          By.css('[data-testid="use-azure"]')
        );
      });

      describe('on the web', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy)
            .withArgs('hybrid')
            .and.returnValue(false);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'azure'),
            { ...azureConfig, ...webConfig },
            flows.find((f) => f.key === 'implicit')
          );
        }));
      });

      describe('on mobile', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'azure'),
            azureConfig,
            undefined
          );
        }));
      });
    });

    describe('aws button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(By.css('[data-testid="use-aws"]'));
      });

      describe('on web', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy)
            .withArgs('hybrid')
            .and.returnValue(false);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'cognito'),
            { ...awsConfig, ...webConfig },
            flows.find((f) => f.key === 'PKCE')
          );
        }));
      });

      describe('on mobile', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'cognito'),
            awsConfig,
            undefined
          );
        }));
      });
    });

    describe('auth0 button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(
          By.css('[data-testid="use-auth0"]')
        );
      });

      describe('on web', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy)
            .withArgs('hybrid')
            .and.returnValue(false);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'auth0'),
            { ...auth0Config, ...webConfig },
            flows.find((f) => f.key === 'implicit')
          );
        }));
      });

      describe('on mobile', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'auth0'),
            auth0Config,
            undefined
          );
        }));
      });
    });

    describe('okta button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(By.css('[data-testid="use-okta"]'));
      });

      describe('on web', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy)
            .withArgs('hybrid')
            .and.returnValue(false);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'okta'),
            { ...oktaConfig, ...webConfig },
            flows.find((f) => f.key === 'PKCE')
          );
        }));
      });

      describe('on mobile', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
        });

        it('saves the config', waitForAsync(() => {
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'okta'),
            oktaConfig,
            undefined
          );
        }));
      });
    });

    describe('customize button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(
          By.css('[data-testid="use-customization"]')
        );
      });

      describe('on web', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy)
            .withArgs('hybrid')
            .and.returnValue(false);
        });

        it('saves the config', waitForAsync(() => {
          let input = fixture.debugElement.query(
            By.css('[data-testid="client-id-input"]')
          );
          setInputValue(fixture, input.nativeElement, '1994-9940fks');
          input = fixture.debugElement.query(
            By.css('[data-testid="discovery-url-input"]')
          );
          setInputValue(
            fixture,
            input.nativeElement,
            'https://foo.bar.disco/.well-known/sticky-buns'
          );
          input = fixture.debugElement.query(
            By.css('[data-testid="scope-input"]')
          );
          setInputValue(fixture, input.nativeElement, 'email offline');
          input = fixture.debugElement.query(
            By.css('[data-testid="audience-input"]')
          );
          setInputValue(fixture, input.nativeElement, 'people');
          component.flow = flows.find((f) => f.key === 'PKCE');
          component.provider = providers.find((p) => p.key === 'onelogin');
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'onelogin'),
            {
              clientId: '1994-9940fks',
              discoveryUrl: 'https://foo.bar.disco/.well-known/sticky-buns',
              logoutUrl: 'http://localhost:8100/auth-action-complete',
              redirectUri: 'http://localhost:8100/auth-action-complete',
              scope: 'email offline',
              audience: 'people',
            },
            flows.find((f) => f.key === 'PKCE')
          );
        }));
      });

      describe('on mobile', () => {
        beforeEach(() => {
          const platform = TestBed.inject(Platform);
          (platform.is as jasmine.Spy).withArgs('hybrid').and.returnValue(true);
        });

        it('saves the config', waitForAsync(() => {
          let input = fixture.debugElement.query(
            By.css('[data-testid="client-id-input"]')
          );
          setInputValue(fixture, input.nativeElement, '1994-9940fks');
          input = fixture.debugElement.query(
            By.css('[data-testid="discovery-url-input"]')
          );
          setInputValue(
            fixture,
            input.nativeElement,
            'https://foo.bar.disco/.well-known/sticky-buns'
          );
          input = fixture.debugElement.query(
            By.css('[data-testid="scope-input"]')
          );
          setInputValue(fixture, input.nativeElement, 'email offline');
          input = fixture.debugElement.query(
            By.css('[data-testid="audience-input"]')
          );
          setInputValue(fixture, input.nativeElement, 'people');
          component.flow = undefined;
          component.provider = providers.find((p) => p.key === 'onelogin');
          const authentication = TestBed.inject(AuthenticationService);
          click(fixture, button.nativeElement);
          expect(authentication.setConfig).toHaveBeenCalledTimes(1);
          expect(authentication.setConfig).toHaveBeenCalledWith(
            providers.find((p) => p.key === 'onelogin'),
            {
              clientId: '1994-9940fks',
              discoveryUrl: 'https://foo.bar.disco/.well-known/sticky-buns',
              logoutUrl: 'msauth://auth-action-complete',
              redirectUri: 'msauth://auth-action-complete',
              scope: 'email offline',
              audience: 'people',
            },
            undefined
          );
        }));
      });
    });

    describe('client ID', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="client-id-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.clientId);
      });

      it('is enabled', () => {
        expect(input.nativeElement.disabled).toEqual(false);
      });
    });

    describe('discovery URL', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="discovery-url-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.discoveryUrl);
      });

      it('is enabled', () => {
        expect(input.nativeElement.disabled).toEqual(false);
      });
    });

    describe('scope', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="scope-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.scope);
      });

      it('is enabled', () => {
        expect(input.nativeElement.disabled).toEqual(false);
      });
    });

    describe('audience', () => {
      let input: DebugElement;
      beforeEach(() => {
        input = fixture.debugElement.query(
          By.css('[data-testid="audience-input"]')
        );
      });

      it('is initialized', async () => {
        await component.ionViewDidEnter();
        expect(input.nativeElement.value).toEqual(auth0Config.audience);
      });

      it('is enabled', () => {
        expect(input.nativeElement.disabled).toEqual(false);
      });
    });
  });
});
