import { Component, OnInit, ViewChild } from '@angular/core';
import 'chartjs-plugin-streaming';
import { BaseChartDirective } from 'ng2-charts/ng2-charts';
import { PubNubAngular } from 'pubnub-angular2';

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
export class ChartsComponent implements OnInit {

  @ViewChild('myChart') myChart: BaseChartDirective;
  options: any;
  datasets: any;
  timeinterval: any;
  voltage: number;

  constructor(public pubnub: PubNubAngular) {
    this.pubnubinit();
   }

    // initialze pubnub keys
  pubnubinit() {
    this.pubnub.init({
      publishKey: 'pub-c-7bc573ca-a768-407f-b8d2-df39e5694b87',
      subscribeKey: 'sub-c-9df4c8f4-6bfa-11e8-967c-82814fd59ac3'
    });
  }

  ngOnInit() {
    this.pubnub.subscribe({ channels: ['temp_thermo_iot'], triggerEvents: ['message', 'status'] });
    this.getdata();

    this.datasets = [{
      type: 'line',
      borderColor: '#ffa500',
      borderWidth: 3,
      pointRadius: 0,
      data: []
    }];
    this.options = {
      title: {
        display: true,
        text: 'Real Time Breathe Sensor Data',
        fontSize: 20,
        fontColor: '#fff',
        padding: 20
      },
      legend: {
        display: false
      },
      responsive: true,
      mainAspectRatio: false,
      tooltips: {
        mode: 'nearest',
        intersect: false
      },
      scales: {
        xAxes: [{
          type: 'realtime',
          gridLines: {
            drawOnChartArea: false,
            color: '#fff',
            lineWidth: 1
          },
          ticks: {
            fontColor: '#fff',
          },
          scaleLabel: {
            display: true,
            labelString: 'Current Time',
            fontColor: 'white'
          }
        }],
        yAxes: [{
          gridLines: {
            drawOnChartArea: false,
            color: '#fff',
            lineWidth: 1
          },
          ticks: {
            beginAtZero: true,
            steps: 5,
            stepValue: 0.5,
            max: 3,
            fontColor: '#fff'
          },
          scaleLabel: {
            display: true,
            labelString: 'Voltage',
            fontColor: 'white',
          }
        }]
      },
       plugins: {
        streaming: {
          onRefresh: (chart: any) => {
            chart.data.datasets.forEach((dataset: any) => {
              this.binding(dataset);
            });
          },
          duration: 5000,
          refresh: 25,
        }
      }
    };
  }

  binding(dataset) {
    dataset.data.push({
      x: Date.now(),
      y: this.voltage
    });
  }

  pause() {
    this.myChart.chart.options.plugins.streaming.pause = true;
    this.myChart.chart.update({duration: 0});
  }

  start() {
    this.myChart.chart.options.plugins.streaming.pause = false;
    this.myChart.chart.update({duration: 0});
  }

    // get data from channel which we have subscribed
    getdata() {
      this.pubnub.getMessage('temp_thermo_iot', (msg: Message) => {
        this.voltage = Number(msg.message.voltage);
      });
    }

}
