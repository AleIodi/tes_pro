import { Component, HostListener, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { add } from 'date-fns';
import { AuthService } from 'src/app/services/auth.service';
import { DateService } from 'src/app/services/date.service';
import { ManagerService } from 'src/app/services/manager.service';
import * as DB from '../../../idb/4service-pwa.idb';

@Component({
    selector: 'app-chart-daily-hours',
    templateUrl: './chart-daily-hours.component.html',
    styleUrls: ['./chart-daily-hours.component.scss'],
    standalone: false
})
export class ChartDailyHoursComponent implements OnInit {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (event.ctrlKey && event.shiftKey && event.altKey) {
      alert('ChartDailyHoursComponent');
      event.stopPropagation();
    }
  }

  public chartLegend = false;
  public chartType: ChartType = 'line';

  public chartData: ChartConfiguration<'line'>['data'] | null = null;

  public chartOptions: ChartConfiguration<'line'>['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Ore interventi per giorno',
        font: {
          size: 20
        }
      },
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.parsed.y ?? 0;
            return ` ${value}${value === 1 ? ' ora' : ' ore'}`;
          }
        }
      }
    },
    layout: {
      padding: {
        left: 15,
        right: 15,
        top: 5,
        bottom: 10
      }
    },
    scales: {
      y: {
        min: 0,
        suggestedMax: 9
      },
      x: {
        ticks: {
          maxRotation: 0,
          minRotation: 0
        }
      }
    }
  };

  constructor(
    private authService: AuthService,
    private dateService: DateService,
    private managerService: ManagerService
  ) { }

  async ngOnInit() {
    const dateStart = add(new Date(), { days: -13 });
    const dateEnd = new Date();
    const dateList = this.getDateArray(dateStart, dateEnd);

    this.authService.getUserLogged();

    const operationList = await this.managerService.serviceOperation_getList(
      this.managerService.getUserList(),
      null,
      DB.SERVICE_TYPOLOGY.EXTERNAL,
      this.dateService.date_getDateTime(dateStart),
      this.dateService.date_getDateTime(dateEnd)
    );

    const dayList: string[] = [];
    const hourList: number[] = [];

    for (const date of dateList) {
      dayList.push(this.dateService.date_getByFormat(date, 'dd/MM'));

      const operationDayList = operationList.filter(
        operation =>
          this.dateService.date_getDate(operation.date_start) ===
          this.dateService.date_getDate(date)
      );
      //
      hourList.push(
        await this.managerService.serviceOperation_getWorkHoursFromList(operationDayList)
      );
    }

    this.chartData = {
      labels: dayList,
      datasets: [
        {
          data: hourList,
          label: 'Ore',
          borderWidth: 2,
          pointHoverBorderWidth: 2,
          hoverBorderWidth: 4,
          backgroundColor: '#4D8070aa',
          borderColor: '#4D8070aa',
          pointBackgroundColor: '#4D8070',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#4D8070aa'
        }
      ]
    };
  }

  getDateArray(start: Date, end: Date): Date[] {
    const arr: Date[] = [];
    const dt = new Date(start);

    while (dt <= end) {
      arr.push(new Date(dt));
      dt.setDate(dt.getDate() + 1);
    }

    return arr;
  }

  public chartClicked({ event, active }: { event?: MouseEvent; active?: object[] }): void { }

  public chartHovered({ event, active }: { event?: MouseEvent; active?: object[] }): void { }
}