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

  constructor(
    private authentication: AuthenticationService,
    private platform: Platform
  ) {}

  async ionViewWillEnter() {
    this.config = await this.authentication.getConfig(
      this.platform.is('hybrid') ? 'mobile' : 'web'
    );
    this.configStr = JSON.stringify(this.config, undefined, 2);
  }
}
