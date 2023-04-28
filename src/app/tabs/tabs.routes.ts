import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'test-connection',
        loadComponent: () =>
          import('../test-connection/test-connection.page').then(
            (m) => m.TestConnectionPage
          ),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: 'info',
        loadComponent: () =>
          import('../info/info.page').then((m) => m.InfoPage),
      },
      {
        path: '',
        redirectTo: '/tabs/test-connection',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/test-connection',
    pathMatch: 'full',
  },
];
