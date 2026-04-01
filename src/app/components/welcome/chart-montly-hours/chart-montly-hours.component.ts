import { Component, HostListener, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { getMonth, setDate, setMonth } from 'date-fns';
import { AuthService } from 'src/app/services/auth.service';
import { DateService } from 'src/app/services/date.service';
import { ManagerService } from 'src/app/services/manager.service';
import * as DB from '../../../idb/4service-pwa.idb';

@Component({
    selector: 'app-chart-montly-hours',
    templateUrl: './chart-montly-hours.component.html',
    styleUrls: ['./chart-montly-hours.component.scss'],
    standalone: false
})
export class ChartMontlyHoursComponent implements OnInit {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (event.ctrlKey && event.shiftKey && event.altKey) {
      alert('ChartDailyHoursComponent');
      event.stopPropagation();
    }
  }

  public chartLegend = false;
  public chartType: ChartType = 'bar';

  public chartData: ChartConfiguration<'bar'>['data'] | null = null;

  public chartOptions: ChartConfiguration<'bar'>['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Ore interventi per mese',
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
        min: 0
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
    this.authService.getUserLogged();

    const currentYear = this.dateService.date_getByFormat(new Date(), 'yyyy');
    const dateStart = new Date(`${currentYear}-01-01`);
    const dateEnd = new Date(`${currentYear}-12-31`);

    const operationList = await this.managerService.serviceOperation_getList(
      this.managerService.getUserList(),
      null,
      DB.SERVICE_TYPOLOGY.EXTERNAL,
      this.dateService.date_getDateTime(dateStart),
      this.dateService.date_getDateTime(dateEnd)
    );

    const monthList: string[] = [];
    const hourList: number[] = [];
    let monthNumber = 0;

    while (monthNumber < 12) {
      const dateMonth = setMonth(setDate(new Date(), 1), monthNumber);
      const monthName = this.dateService.date_getByFormat(dateMonth, 'MMM');

      monthList.push(monthName);

      const operationMonthList = operationList.filter(
        operation => getMonth(new Date(operation.date_start)) === monthNumber
      );
      //
      hourList.push(
        await this.managerService.serviceOperation_getWorkHoursFromList(operationMonthList)
      );

      monthNumber++;
    }

    this.chartData = {
      labels: monthList,
      datasets: [
        {
          data: hourList,
          label: 'Ore',
          borderWidth: 2,
          backgroundColor: '#a974adaa',
          hoverBackgroundColor: '#a974adaa',
          borderColor: '#a974adaa'
        }
      ]
    };
  }

  public chartClicked({ event, active }: { event?: MouseEvent; active?: object[] }): void { }

  public chartHovered({ event, active }: { event?: MouseEvent; active?: object[] }): void { }
}