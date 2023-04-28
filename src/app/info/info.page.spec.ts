import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AuthenticationService } from '@app/core';
import { createAuthenticationServiceMock } from '@app/core/testing';
import { Platform } from '@ionic/angular';
import { createPlatformMock } from '@test/mocks';
import { InfoPage } from './info.page';

describe('InfoPage', () => {
  let component: InfoPage;
  let fixture: ComponentFixture<InfoPage>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [InfoPage],
    })
      .overrideProvider(AuthenticationService, {
        useFactory: createAuthenticationServiceMock,
      })
      .overrideProvider(Platform, { useFactory: createPlatformMock })
      .compileComponents();

    fixture = TestBed.createComponent(InfoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('is created', () => {
    expect(component).toBeTruthy();
  });
});
