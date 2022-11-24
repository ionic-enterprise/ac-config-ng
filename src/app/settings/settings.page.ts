import { Component } from '@angular/core';
import { AuthenticationService } from '@app/core';
import { flows, providers } from '@app/data';
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
  oidcServers = [...providers];
  authFlows = [...flows];
  authConfig: string;
  clientID: string;
  discoveryURL: string;
  audience: string;
  scope: string;
  webAuthFlow: string;

  constructor(private authentication: AuthenticationService) {}

  async ionViewDidEnter() {
    this.disableEdits = await this.authentication.isAuthenticated();
    return this.initCustomizableFields();
  }

  async useAzure(): Promise<void> {
    await this.authentication.setBaseConfig(azureConfig);
    return this.initCustomizableFields();
  }

  async useAWS(): Promise<void> {
    await this.authentication.setBaseConfig(awsConfig);
    return this.initCustomizableFields();
  }

  async useAuth0(): Promise<void> {
    await this.authentication.setBaseConfig(auth0Config);
    return this.initCustomizableFields();
  }

  async useOkta(): Promise<void> {
    await this.authentication.setBaseConfig(oktaConfig);
    return this.initCustomizableFields();
  }

  async useCustomization(): Promise<void> {
    return this.authentication.setBaseConfig({
      authConfig: this.authConfig,
      clientID: this.clientID,
      discoveryUrl: this.discoveryURL,
      scope: this.scope,
      audience: this.audience,
      webAuthFlow: this.webAuthFlow,
    });
  }

  private async initCustomizableFields(): Promise<void> {
    const config = await this.authentication.getBaseConfig();
    this.authConfig = config.authConfig;
    this.clientID = config.clientID;
    this.discoveryURL = config.discoveryUrl;
    this.scope = config.scope;
    this.audience = config.audience;
    this.webAuthFlow = config.webAuthFlow;
  }
}
