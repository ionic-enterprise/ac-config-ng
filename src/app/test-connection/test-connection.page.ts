import { Component } from '@angular/core';
import { AuthenticationService } from '@app/core';

@Component({
  selector: 'app-test-connection',
  templateUrl: 'test-connection.page.html',
  styleUrls: ['test-connection.page.scss'],
})
export class TestConnectionPage {
  loggedIn: boolean;
  errorMessage: string;
  canRefresh: boolean;

  constructor(private authentication: AuthenticationService) {}

  async ionViewDidEnter(): Promise<void> {
    await this.checkLoginStatus();
  }

  async handleAuth(): Promise<void> {
    try {
      await this.performAuthAction();
    } catch (err: any) {
      this.errorMessage = err;
    }
  }

  async refresh(): Promise<void> {
    this.errorMessage = '';
    try {
      await this.authentication.refresh();
      alert('Refresh Successful!!');
      this.checkLoginStatus();
    } catch (err: any) {
      this.errorMessage = err;
    }
  }

  private async performAuthAction(): Promise<void> {
    this.errorMessage = '';
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
