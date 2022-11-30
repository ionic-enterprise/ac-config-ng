import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { IonicModule } from '@ionic/angular';
import { click } from '@test/util';
import { TestConnectionPage } from './test-connection.page';

describe('TestConnectionPage', () => {
  let component: TestConnectionPage;
  let fixture: ComponentFixture<TestConnectionPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [TestConnectionPage],
      imports: [IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TestConnectionPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });

  describe('when logged in', () => {
    beforeEach(async () => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.isAuthenticated as jasmine.Spy).and.resolveTo(true);
      (auth.canRefresh as jasmine.Spy).and.resolveTo(true);
      await component.ionViewDidEnter();
      fixture.detectChanges();
    });

    it('shows a status of logged in', async () => {
      const label = fixture.debugElement.query(
        By.css('[data-testid="auth-status-label"]')
      );
      expect(label.nativeElement.textContent.trim()).toEqual('Logged In');
    });

    it('shows a auth button of Log Out', async () => {
      const button = fixture.debugElement.query(
        By.css('[data-testid="auth-button"]')
      );
      expect(button.nativeElement.textContent.trim()).toEqual('Log Out');
    });

    it('enables the refresh', async () => {
      const button = fixture.debugElement.query(
        By.css('[data-testid="refresh-button"]')
      );
      expect(button.nativeElement.disabled).toBe(false);
    });

    it('disables the refresh if it is indicated that refresh is not available', async () => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.canRefresh as jasmine.Spy).and.resolveTo(false);
      await component.ionViewDidEnter();
      fixture.detectChanges();
      const button = fixture.debugElement.query(
        By.css('[data-testid="refresh-button"]')
      );
      expect(button.nativeElement.disabled).toBe(true);
    });

    it('calls refresh when refresh clicked', () => {
      const auth = TestBed.inject(AuthenticationService);
      const button = fixture.debugElement.query(
        By.css('[data-testid="refresh-button"]')
      );
      click(fixture, button.nativeElement);
      expect(auth.refresh).toHaveBeenCalledTimes(1);
    });

    describe('auth button clicked', () => {
      it('performs a logout', () => {
        const auth = TestBed.inject(AuthenticationService);
        const button = fixture.debugElement.query(
          By.css('[data-testid="auth-button"]')
        );
        click(fixture, button.nativeElement);
        expect(auth.logout).toHaveBeenCalledTimes(1);
      });

      it('requeries is authenticated', fakeAsync(() => {
        const auth = TestBed.inject(AuthenticationService);
        const button = fixture.debugElement.query(
          By.css('[data-testid="auth-button"]')
        );
        click(fixture, button.nativeElement);
        tick();
        expect(auth.isAuthenticated).toHaveBeenCalledTimes(2);
      }));
    });
  });

  describe('when not logged in', () => {
    beforeEach(async () => {
      const auth = TestBed.inject(AuthenticationService);
      (auth.isAuthenticated as jasmine.Spy).and.resolveTo(false);
      (auth.canRefresh as jasmine.Spy).and.resolveTo(false);
      await component.ionViewDidEnter();
      fixture.detectChanges();
    });

    it('shows a status of logged out', () => {
      const label = fixture.debugElement.query(
        By.css('[data-testid="auth-status-label"]')
      );
      expect(label.nativeElement.textContent.trim()).toEqual('Logged Out');
    });

    it('shows a auth button of Log In', () => {
      const button = fixture.debugElement.query(
        By.css('[data-testid="auth-button"]')
      );
      expect(button.nativeElement.textContent.trim()).toEqual('Log In');
    });

    it('disables the refresh', () => {
      const button = fixture.debugElement.query(
        By.css('[data-testid="refresh-button"]')
      );
      expect(button.nativeElement.disabled).toBe(true);
    });

    describe('auth button clicked', () => {
      it('performs a login', () => {
        const auth = TestBed.inject(AuthenticationService);
        const button = fixture.debugElement.query(
          By.css('[data-testid="auth-button"]')
        );
        click(fixture, button.nativeElement);
        expect(auth.login).toHaveBeenCalledTimes(1);
      });

      it('requeries is authenticated', fakeAsync(() => {
        const auth = TestBed.inject(AuthenticationService);
        const button = fixture.debugElement.query(
          By.css('[data-testid="auth-button"]')
        );
        click(fixture, button.nativeElement);
        tick();
        expect(auth.isAuthenticated).toHaveBeenCalledTimes(2);
      }));
    });
  });
});
