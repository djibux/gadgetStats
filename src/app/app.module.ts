import { Chart } from './../pages/chart/chart';
import { ReadDB } from './../pages/read-db/read-db';
import { SQLite } from '@ionic-native/sqlite';
import { Toast } from '@ionic-native/toast';
import { File } from '@ionic-native/file';
import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { AngularEchartsModule } from 'angular2-echarts';

import { MyApp } from './app.component';
import { HomePage } from '../pages/home/home';
import { ListPage } from '../pages/list/list';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

@NgModule({
  declarations: [
    MyApp,
    Chart,
    HomePage,
    ListPage,
    ReadDB
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularEchartsModule
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    Chart,
    HomePage,
    ListPage,
    ReadDB
  ],
  providers: [
    StatusBar,
    SplashScreen,
    SQLite,
    File,
    Toast,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {}
