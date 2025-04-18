import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthenticationService } from '@app/core';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonLabel,
  IonTitle,
  IonToast,
  IonToolbar,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-test-connection',
  templateUrl: 'test-connection.page.html',
  styleUrls: ['test-connection.page.scss'],
  imports: [
    IonToast,
    IonButton,
    IonCardContent,
    IonLabel,
    IonCardSubtitle,
    IonCardTitle,
    IonCardHeader,
    IonCard,
    IonTitle,
    IonToolbar,
    IonHeader,
    IonContent,
    CommonModule,
    FormsModule,
  ],
})
export class TestConnectionPage {
  loggedIn: boolean;
  canRefresh: boolean;
  displayRefreshSuccess = false;
  displayRefreshFailure = false;
  displayAuthFailure = false;

  constructor(private authentication: AuthenticationService) {}

  async ionViewDidEnter(): Promise<void> {
    await this.checkLoginStatus();
  }

  async handleAuth(): Promise<void> {
    try {
      await this.performAuthAction();
      console.log('auth appeared to "work"');
    } catch {
      this.displayAuthFailure = true;
    }
  }

  async handleRefresh(): Promise<void> {
    try {
      await this.authentication.refresh();
      this.displayRefreshSuccess = true;
      this.checkLoginStatus();
    } catch {
      this.displayRefreshFailure = true;
    }
  }

  private async performAuthAction(): Promise<void> {
    if (this.loggedIn) {
      await this.authentication.logout();
    } else {
      await this.authentication.login();
    }
    this.checkLoginStatus();
  }

  private async checkLoginStatus(): Promise<void> {
    this.loggedIn = await this.authentication.isAuthenticated();
    this.canRefresh = await this.authentication.canRefresh();
  }
}
