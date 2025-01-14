import { Injectable } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Platform } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
export class StatusBarService {
  constructor(private platform: Platform) {}

  public async changeBackgroundToColor(color?: string) {
    color = color
      ? color
      : this.platform.is('android')
        ? '#002436'
        : this.platform.is('ios')
          ? '#002648'
          : '';

    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color });
    await StatusBar.setStyle({ style: Style.Dark });
  }

  public async changeBackgroundToWhite() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
    await StatusBar.setStyle({ style: Style.Light });
  }

  public async changeBackgroundTogray() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#f9f9f9' });
    await StatusBar.setStyle({ style: Style.Light });
  }

  public async changeBackgroundTograyForBooking() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#F4F5FB' });
    if (this.platform.is('android')) {
      await StatusBar.setStyle({ style: Style.Dark });
    } else {
      await StatusBar.setStyle({ style: Style.Light });
    }
  }

  public async changeBackgroundToLightGray() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setBackgroundColor({ color: '#f7fbfc' });
    await StatusBar.setStyle({ style: Style.Light });
  }

  public async defaultStyle() {
    await StatusBar.setOverlaysWebView({ overlay: false });
    await StatusBar.setStyle({ style: Style.Light });
  }

  public updateModalBackground(clear: boolean = false) {
    if (clear) {
      this.changeBackgroundToWhite();
      return;
    }
    this.changeBackgroundToColor('#999999');
  }

  public async hide() {
    await StatusBar.hide();
  }

  public async show() {
    await StatusBar.show();
  }
}
