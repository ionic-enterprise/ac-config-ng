import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SplashScreen } from '@capacitor/splash-screen';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  imports: [IonRouterOutlet, IonApp, CommonModule],
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    SplashScreen.hide();
  }
}
