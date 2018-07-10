import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';
import { AppComponent } from './app.component';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { ChartsModule } from 'ng2-charts';

declare var require: any;
export function highchartsFactory() {
  const hc = require('highcharts/highstock');
    const hcm = require('highcharts/highcharts-more');
    hcm(hc);
    return hc;
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    ChartModule,
    ChartsModule
  ],
  providers: [PubNubAngular, { provide: HighchartsStatic, useFactory: highchartsFactory}],
  bootstrap: [AppComponent]
})
export class AppModule { }
