import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '@app/core';
import { Flow, flows, Provider, providers } from '@app/data';
import { Capacitor } from '@capacitor/core';
import {
  auth0Config,
  awsConfig,
  azureConfig,
  mobileConfig,
  oktaConfig,
  webConfig,
} from '@env/environment';
import { ProviderOptions } from '@ionic-enterprise/auth';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { config } from '../../config';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
  styleUrls: ['settings.page.scss'],
  imports: [
    IonLabel,
    IonListHeader,
    IonList,
    IonButton,
    IonHeader,
    IonInput,
    IonToolbar,
    IonTitle,
    IonContent,
    IonItem,
    IonSelect,
    IonSelectOption,
    CommonModule,
    FormsModule,
  ],
})
export class SettingsPage {
  disableEdits: boolean;
  disableTemplates: boolean;
  showFlow: boolean;
  oidcServers = [...providers];
  authFlows = [...flows];
  clientId: string;
  discoveryUrl: string;
  audience: string;
  scope: string;
  provider: Provider;
  flow: Flow;

  constructor(private authentication: AuthenticationService) {}

  async ionViewDidEnter() {
    this.showFlow = !Capacitor.isNativePlatform();
    this.disableEdits = await this.authentication.isAuthenticated();
    this.disableTemplates =
      this.disableEdits || config.authUrlScheme !== 'msauth';
    return this.initCustomizableFields();
  }

  async useAzure(): Promise<void> {
    const config: ProviderOptions = {
      ...azureConfig,
      ...(Capacitor.isNativePlatform() ? {} : webConfig),
    };
    await this.authentication.setConfig(
      providers.find((p) => p.key === 'azure'),
      config,
      Capacitor.isNativePlatform()
        ? undefined
        : flows.find((f) => f.key === 'implicit'),
    );
    return this.initCustomizableFields();
  }

  async useAWS(): Promise<void> {
    const config: ProviderOptions = {
      ...awsConfig,
      ...(Capacitor.isNativePlatform() ? {} : webConfig),
    };
    await this.authentication.setConfig(
      providers.find((p) => p.key === 'cognito'),
      config,
      Capacitor.isNativePlatform()
        ? undefined
        : flows.find((f) => f.key === 'PKCE'),
    );
    return this.initCustomizableFields();
  }

  async useAuth0(): Promise<void> {
    const config: ProviderOptions = {
      ...auth0Config,
      ...(Capacitor.isNativePlatform() ? {} : webConfig),
    };
    await this.authentication.setConfig(
      providers.find((p) => p.key === 'auth0'),
      config,
      Capacitor.isNativePlatform()
        ? undefined
        : flows.find((f) => f.key === 'implicit'),
    );
    return this.initCustomizableFields();
  }

  async useOkta(): Promise<void> {
    const config: ProviderOptions = {
      ...oktaConfig,
      ...(Capacitor.isNativePlatform() ? {} : webConfig),
    };
    await this.authentication.setConfig(
      providers.find((p) => p.key === 'okta'),
      config,
      Capacitor.isNativePlatform()
        ? undefined
        : flows.find((f) => f.key === 'PKCE'),
    );
    return this.initCustomizableFields();
  }

  async useCustomization(): Promise<void> {
    const config: ProviderOptions = {
      clientId: this.clientId,
      discoveryUrl: this.discoveryUrl,
      scope: this.scope,
      audience: this.audience,
      ...(Capacitor.isNativePlatform() ? mobileConfig : webConfig),
    };
    return this.authentication.setConfig(this.provider, config, this.flow);
  }

  private async initCustomizableFields(): Promise<void> {
    const config = await this.authentication.getConfig();
    this.clientId = config.clientId;
    this.discoveryUrl = config.discoveryUrl;
    this.scope = config.scope;
    this.audience = config.audience;
    const flow = await this.authentication.getFlow();
    this.flow = this.authFlows.find((f) => f.key === flow?.key);
    const provider = await this.authentication.getProvider();
    this.provider = this.oidcServers.find((p) => p.key === provider?.key);
  }
}
