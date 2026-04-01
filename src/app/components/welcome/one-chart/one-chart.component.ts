import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';

@Component({
    selector: 'app-one-chart',
    templateUrl: './one-chart.component.html',
    styleUrls: ['./one-chart.component.scss'],
    standalone: false
})
export class OneChartComponent implements OnInit {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (event.ctrlKey && event.shiftKey && event.altKey) {
      alert('OneChartComponent');
      event.stopPropagation();
    }
  }

  public lineChartType: ChartType = 'line';
  public lineChartLegend = true;

  public lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
      {
        data: [65, 59, 80, 81, 56, 55, 40],
        label: 'Series A',
        backgroundColor: 'rgba(148,159,177,0.2)',
        borderColor: 'rgba(148,159,177,1)',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      },
      {
        data: [28, 48, 40, 19, 86, 27, 90],
        label: 'Series B',
        backgroundColor: 'rgba(77,83,96,0.2)',
        borderColor: 'rgba(77,83,96,1)',
        pointBackgroundColor: 'rgba(77,83,96,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(77,83,96,1)'
      },
      {
        data: [180, 480, 770, 90, 1000, 270, 400],
        label: 'Series C',
        yAxisID: 'y1',
        backgroundColor: 'rgba(255,0,0,0.3)',
        borderColor: 'red',
        pointBackgroundColor: 'rgba(148,159,177,1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(148,159,177,0.8)'
      }
    ]
  };

  public lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true
      }
    },
    scales: {
      x: {},
      y: {
        position: 'left'
      },
      y1: {
        position: 'right',
        grid: {
          color: 'rgba(255,0,0,0.3)'
        },
        ticks: {
          color: 'red'
        }
      }
    }
  };

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  constructor() {}

  ngOnInit() {}

  public randomize(): void {
    const datasets = this.lineChartData.datasets ?? [];

    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      const data = dataset.data as number[];

      for (let j = 0; j < data.length; j++) {
        data[j] = this.generateNumber(i);
      }
    }

    this.chart?.update();
  }

  private generateNumber(i: number): number {
    return Math.floor(Math.random() * (i < 2 ? 100 : 1000) + 1);
  }

  public chartClicked({ event, active }: { event?: MouseEvent; active?: object[] }): void {}

  public chartHovered({ event, active }: { event?: MouseEvent; active?: object[] }): void {}

  public hideOne(): void {
    const isHidden = this.chart?.isDatasetHidden(1);
    this.chart?.hideDataset(1, !isHidden);
  }

  public pushOne(): void {
    const labels = this.lineChartData.labels as string[];
    const datasets = this.lineChartData.datasets ?? [];

    datasets.forEach((dataset, i) => {
      const num = this.generateNumber(i);
      const data = dataset.data as number[];
      data.push(num);
    });

    labels.push(`Label ${labels.length}`);
    this.chart?.update();
  }

  public changeColor(): void {
    const dataset = this.lineChartData.datasets?.[2];
    if (!dataset) return;

    dataset.borderColor = 'green';
    dataset.backgroundColor = 'rgba(0, 255, 0, 0.3)';
    this.chart?.update();
  }

  public changeLabel(): void {
    const labels = this.lineChartData.labels as string[];
    labels[2] = '1st Line / 2nd Line';
    this.chart?.update();
  }
}