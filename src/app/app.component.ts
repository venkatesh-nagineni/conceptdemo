import { Component, OnInit } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';
import * as Highcharts from 'highcharts';

export interface Message {
  message: {
    temperature: any;
    fahrenheit: any;
  };
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  chart: Object;
  options: Object;
  latesttemp: any;
  pausestart: boolean;
  fahrenheit: any;
  notfound: boolean;
  timeinterval: any;

  constructor(public pubnub: PubNubAngular) {
    this.pubnubinit();

    setInterval(() => {
      clearInterval(this.timeinterval);
      this.ngOnInit();
    }, 180000);
  }

  // initialze pubnub keys
  pubnubinit() {
    this.pubnub.init({
      publishKey: 'pub-c-7bc573ca-a768-407f-b8d2-df39e5694b87',
      subscribeKey: 'sub-c-9df4c8f4-6bfa-11e8-967c-82814fd59ac3'
    });
  }

  // subscribe to the channel to which channel we had published
  ngOnInit() {
    this.pausestart = true;
    this.pubnub.subscribe({ channels: ['temp_thermo_iot'], triggerEvents: ['message', 'status']});
    this.getdata();
    this.options = {
      chart: { type: 'spline' },
      title: { text: 'Real Time Sensor Data' },
      animation: Highcharts['svg'],
      responsive: true,
      credits: false,
      margin: 0,
      series: [{ data: [] }],
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        title: {
          text: 'Current Time'
        }
      },
      yAxis: {
        title: {
          text: 'Temperature in Celsius'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        formatter: function () {
          return '<b>' + 'Current Temperature' + '</b><br/>' +
            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
            '<b>' + Highcharts.numberFormat(this.y, 4) + '</b>';
        }
      },
      legend: {
        enabled: false
      },
      exporting: {
        enabled: false
      },
    };
    this.timeinterval = setInterval(() => {
      const x = (new Date()).getTime() + 7200000; // current time
      if (this.latesttemp) {
        this.chart['series'][0].addPoint([x, this.latesttemp], this.pausestart );
      }
    }, 3000);
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  // get data from channel which we have subscribed
  getdata() {
    this.pubnub.getMessage('temp_thermo_iot', (msg: Message) => {
        this.latesttemp = msg.message.temperature;
        this.fahrenheit = msg.message.fahrenheit;
    });
  }

  pause() {
    this.pausestart = false;
  }

  start() {
    this.pausestart = true;
  }

}

