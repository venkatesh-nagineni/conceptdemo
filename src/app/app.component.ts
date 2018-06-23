import { Component, OnInit } from '@angular/core';
import { PubNubAngular } from 'pubnub-angular2';
import * as Highcharts from 'highcharts';

export interface Message {
  message: {
    voltage: number;
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
  voltage: number;

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
    this.pubnub.subscribe({ channels: ['temp_thermo_iot'], triggerEvents: ['message', 'status'] });
    this.getdata();

    this.options = {
      colors: ['#DDDF0D', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee',
        '#ff0066', '#eeaaee', '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
      chart: {
        type: 'spline',
        backgroundColor: {
          linearGradient: [0, 0, 250, 500],
          stops: [
            [0, 'rgb(48, 96, 48)'],
            [1, 'rgb(0, 0, 0)']
          ]
        },
        borderColor: '#000000',
        borderWidth: 2,
        className: 'dark-container',
        plotBackgroundColor: 'rgba(255, 255, 255, .1)',
        plotBorderColor: '#CCCCCC',
        plotBorderWidth: 1
      },
      title: {
        text: 'Real Time Sensor Data', style: {
          color: '#C0C0C0',
          font: 'bold 16px "Trebuchet MS", Verdana, sans-serif'
        }
      },
      animation: Highcharts['svg'],
      responsive: true,
      credits: false,
      margin: 0,
      series: [{ data: [], showInLegend: false }],
      xAxis: {
        type: 'datetime',
        tickPixelInterval: 150,
        gridLineColor: '#333333',
        gridLineWidth: 1,
        labels: {
          style: {
            color: '#A0A0A0'
          }
        },
        lineColor: '#A0A0A0',
        tickColor: '#A0A0A0',
        title: {
          text: 'Current Time',
          style: {
            color: '#CCC',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'

          }
        }
      },
      yAxis: {
        min: 0,
        max: 3.5,
        tickInterval: 0.5,
        startOnTick: false,
        endOnTick: false,
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }],
        gridLineColor: '#333333',
        labels: {
          style: {
            color: '#A0A0A0'
          }
        },
        lineColor: '#A0A0A0',
        minorTickInterval: null,
        tickColor: '#A0A0A0',
        tickWidth: 1,
        title: {
          text: 'Voltage',
          style: {
            color: '#CCC',
            fontWeight: 'bold',
            fontSize: '12px',
            fontFamily: 'Trebuchet MS, Verdana, sans-serif'
          }
        }
      },
      tooltip: {
        formatter: function () {
          return '<b>' + 'Current Voltage' + '</b><br/>' +
            Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', this.x) + '<br/>' +
            '<b>' + Highcharts.numberFormat(this.y, 4) + '</b>';
        },
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        style: {
          color: '#F0F0F0'
        }

      },

      plotOptions: {
        series: {
          marker: {
            enabled: false
          }
        },
        spline: {
          marker: {
            lineColor: '#333'
          }
        },
      },
      exporting: {
        enabled: false
      },
    };
    this.timeinterval = setInterval(() => {
      const x = (new Date()).getTime() + 7200000; // current time
      if (this.voltage) {
        this.chart['series'][0].addPoint([x, this.voltage], this.pausestart);
      }
    }, 50);
  }

  saveInstance(chartInstance) {
    this.chart = chartInstance;
  }

  // get data from channel which we have subscribed
  getdata() {
    this.pubnub.getMessage('temp_thermo_iot', (msg: Message) => {
      this.voltage = Number(msg.message.voltage);
    });
  }

  pause() {
    this.pausestart = false;
  }

  start() {
    this.pausestart = true;
  }

}
