import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import {
  auth0Config,
  awsConfig,
  azureConfig,
  oktaConfig,
} from '@env/environment';
import { IonicModule } from '@ionic/angular';
import { click, setInputValue } from '@test/util';
import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPage],
      imports: [IonicModule, FormsModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
      ],
    }).compileComponents();

    const auth = TestBed.inject(AuthenticationService);
    (auth.getBaseConfig as jasmine.Spy).and.resolveTo({
      ...auth0Config,
    });

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
        expect(input.nativeElement.value).toEqual(auth0Config.clientID);
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
    });

    describe('azure button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(
          By.css('[data-testid="use-azure"]')
        );
      });

      it('saves the config', waitForAsync(() => {
        const authentication = TestBed.inject(AuthenticationService);
        click(fixture, button.nativeElement);
        expect(authentication.setBaseConfig).toHaveBeenCalledTimes(1);
        expect(authentication.setBaseConfig).toHaveBeenCalledWith(azureConfig);
      }));
    });

    describe('aws button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(By.css('[data-testid="use-aws"]'));
      });

      it('saves the config', waitForAsync(() => {
        const authentication = TestBed.inject(AuthenticationService);
        click(fixture, button.nativeElement);
        expect(authentication.setBaseConfig).toHaveBeenCalledTimes(1);
        expect(authentication.setBaseConfig).toHaveBeenCalledWith(awsConfig);
      }));
    });

    describe('auth0 button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(
          By.css('[data-testid="use-auth0"]')
        );
      });

      it('saves the config', waitForAsync(() => {
        const authentication = TestBed.inject(AuthenticationService);
        click(fixture, button.nativeElement);
        expect(authentication.setBaseConfig).toHaveBeenCalledTimes(1);
        expect(authentication.setBaseConfig).toHaveBeenCalledWith(auth0Config);
      }));
    });

    describe('okta button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(By.css('[data-testid="use-okta"]'));
      });

      it('saves the config', waitForAsync(() => {
        const authentication = TestBed.inject(AuthenticationService);
        click(fixture, button.nativeElement);
        expect(authentication.setBaseConfig).toHaveBeenCalledTimes(1);
        expect(authentication.setBaseConfig).toHaveBeenCalledWith(oktaConfig);
      }));
    });

    describe('customize button', () => {
      let button: any;
      beforeEach(() => {
        button = fixture.debugElement.query(
          By.css('[data-testid="use-customization"]')
        );
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
        component.authConfig = 'ping';
        component.webAuthFlow = 'implicit';
        const authentication = TestBed.inject(AuthenticationService);
        click(fixture, button.nativeElement);
        expect(authentication.setBaseConfig).toHaveBeenCalledTimes(1);
        expect(authentication.setBaseConfig).toHaveBeenCalledWith({
          authConfig: 'ping',
          clientID: '1994-9940fks',
          discoveryUrl: 'https://foo.bar.disco/.well-known/sticky-buns',
          scope: 'email offline',
          audience: 'people',
          webAuthFlow: 'implicit',
        });
      }));
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
        expect(input.nativeElement.value).toEqual(auth0Config.clientID);
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
