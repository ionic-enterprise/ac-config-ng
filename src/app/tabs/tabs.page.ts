import { Component } from '@angular/core';
import {
  IonIcon,
  IonLabel,
  IonTabBar,
  IonTabButton,
  IonTabs,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  informationCircleOutline,
  logInOutline,
  settingsOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss'],
  imports: [IonLabel, IonIcon, IonTabBar, IonTabButton, IonTabs],
})
export class TabsPage {
  constructor() {
    addIcons({ logInOutline, settingsOutline, informationCircleOutline });
  }
}
