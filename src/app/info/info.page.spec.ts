import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { IonicModule, Platform } from '@ionic/angular';
import { createPlatformMock } from '@test/mocks';
import { InfoPage } from './info.page';

describe('InfoPage', () => {
  let component: InfoPage;
  let fixture: ComponentFixture<InfoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [InfoPage],
      imports: [IonicModule],
      providers: [
        {
          provide: AuthenticationService,
          useFactory: createAuthenticationServiceMock,
        },
        {
          provide: Platform,
          useFactory: createPlatformMock,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });
});
