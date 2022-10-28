import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'test-connection',
        loadChildren: () =>
          import('../test-connection/test-connection.module').then(
            (m) => m.TestConnectionPageModule
          ),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('../settings/settings.module').then(
            (m) => m.SettingsPageModule
          ),
      },
      {
        path: 'info',
        loadChildren: () =>
          import('../info/info.module').then((m) => m.InfoPageModule),
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

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}
