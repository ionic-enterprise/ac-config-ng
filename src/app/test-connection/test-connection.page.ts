import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '@app/core';

@Component({
  selector: 'app-test-connection',
  templateUrl: 'test-connection.page.html',
  styleUrls: ['test-connection.page.scss'],
})
export class TestConnectionPage implements OnInit {
  loggedIn: boolean;
  errorMessage: string;

  constructor(private authentication: AuthenticationService) {}

  async ngOnInit(): Promise<void> {
    this.loggedIn = await this.authentication.isAuthenticated();
  }

  async handleAuth(): Promise<void> {
    try {
      await this.performAuthAction();
    } catch (err: any) {
      this.errorMessage = err;
    }
  }

  refresh(): Promise<void> {
    return this.authentication.refresh();
  }

  private async performAuthAction(): Promise<void> {
    this.errorMessage = '';
    if (this.loggedIn) {
      await this.authentication.logout();
    } else {
      await this.authentication.login();
    }
    this.loggedIn = await this.authentication.isAuthenticated();
  }
}
