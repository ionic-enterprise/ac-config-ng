import { provideHttpClient } from '@angular/common/http';
import { APP_INITIALIZER, enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter } from '@angular/router';
import { AppComponent } from '@app/app.component';
import { routes } from '@app/app.routes';
import {
  IonicRouteStrategy,
  provideIonicAngular,
} from '@ionic/angular/standalone';
import { environment } from './environments/environment';
import { AuthenticationService } from '@app/core';

const appInitFactory =
  (authentication: AuthenticationService): (() => Promise<void>) =>
  async () => {
    await authentication.initialize();
  };

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_INITIALIZER,
      useFactory: appInitFactory,
      deps: [AuthenticationService],
      multi: true,
    },
    provideHttpClient(),
    provideRouter(routes),
    provideIonicAngular({}),
  ],
});
