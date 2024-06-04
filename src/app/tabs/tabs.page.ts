import { CommonModule } from '@angular/common';
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
  standalone: true,
  imports: [IonLabel, IonIcon, IonTabBar, IonTabButton, IonTabs, CommonModule],
})
export class TabsPage {
  constructor() {
    addIcons({ logInOutline, settingsOutline, informationCircleOutline });
  }
}
