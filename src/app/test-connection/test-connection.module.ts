import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TestConnectionPage } from './test-connection.page';
import { TestConnectionPageRoutingModule } from './test-connection-routing.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    TestConnectionPageRoutingModule,
  ],
  declarations: [TestConnectionPage],
})
export class TestConnectionPageModule {}
