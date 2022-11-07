import { Component } from '@angular/core';
import { AuthenticationService } from '@app/core';
import {
  auth0Config,
  awsConfig,
  azureConfig,
  oktaConfig,
} from '@env/environment';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
})
export class SettingsPage {
  disableEdits: boolean;

  constructor(private authentication: AuthenticationService) {}

  async ionViewDidEnter() {
    this.disableEdits = await this.authentication.isAuthenticated();
  }

  useAzure(): Promise<void> {
    return this.authentication.setBaseConfig(azureConfig);
  }

  useAWS(): Promise<void> {
    return this.authentication.setBaseConfig(awsConfig);
  }

  useAuth0(): Promise<void> {
    return this.authentication.setBaseConfig(auth0Config);
  }

  useOkta(): Promise<void> {
    return this.authentication.setBaseConfig(oktaConfig);
  }
}
