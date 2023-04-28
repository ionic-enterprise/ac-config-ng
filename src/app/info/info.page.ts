import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '@app/core';
import { Flow, Provider } from '@app/data';
import { ProviderOptions } from '@ionic-enterprise/auth';
import { IonicModule, Platform } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: 'info.page.html',
  styleUrls: ['info.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule],
})
export class InfoPage {
  config: ProviderOptions;
  configStr: string;
  flow: Flow;
  provider: Provider;
  showFlow: boolean;

  loggedIn: boolean;
  accessToken: string | undefined;
  accessTokenExpired: boolean;
  refreshAvailable: boolean;

  constructor(
    private authentication: AuthenticationService,
    private platform: Platform
  ) {}

  async ionViewWillEnter() {
    this.showFlow = !this.platform.is('hybrid');
    this.config = await this.authentication.getConfig();
    this.configStr = JSON.stringify(this.config, undefined, 2);
    this.flow = await this.authentication.getFlow();
    this.provider = await this.authentication.getProvider();
    this.loggedIn = await this.authentication.isAuthenticated();
    this.accessToken = await this.authentication.getAccessToken();
    this.accessTokenExpired = await this.authentication.accessTokenIsExpired();
    this.refreshAvailable = await this.authentication.canRefresh();
  }
}
