import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
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
import { click } from '@test/util';
import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [SettingsPage],
      imports: [IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
      ],
    }).compileComponents();

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
  });
});
