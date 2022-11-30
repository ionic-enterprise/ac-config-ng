import { Component } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { Platform } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['info.page.scss'],
})
export class InfoPage {
  config: any;
  configStr: string;

  loggedIn: boolean;
  accessToken: string | undefined;
  accessTokenExpired: boolean;
  refreshAvailable: boolean;

  constructor(
    private authentication: AuthenticationService,
    private platform: Platform
  ) {}

  async ionViewWillEnter() {
    this.config = await this.authentication.getConfig(
      this.platform.is('hybrid') ? 'mobile' : 'web'
    );
    this.configStr = JSON.stringify(this.config, undefined, 2);
    this.loggedIn = await this.authentication.isAuthenticated();
    this.accessToken = await this.authentication.getAccessToken();
    this.accessTokenExpired = await this.authentication.accessTokenIsExpired();
    this.refreshAvailable = await this.authentication.canRefresh();
  }
}
