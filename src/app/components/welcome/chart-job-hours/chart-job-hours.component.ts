import { Component, HostListener, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AuthService } from 'src/app/services/auth.service';
import { DateService } from 'src/app/services/date.service';
import { ManagerService } from 'src/app/services/manager.service';
import * as DB from '../../../idb/4service-pwa.idb';

@Component({
    selector: 'app-chart-job-hours',
    templateUrl: './chart-job-hours.component.html',
    styleUrls: ['./chart-job-hours.component.scss'],
    standalone: false
})
export class ChartJobHoursComponent implements OnInit {
  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    if (event.ctrlKey && event.shiftKey && event.altKey) {
      alert('ChartDailyHoursComponent');
      event.stopPropagation();
    }
  }

  public chartLegend = true;
  public chartType: ChartType = 'doughnut';

  public chartData: ChartConfiguration<'doughnut'>['data'] | null = null;

  public chartOptions: ChartConfiguration<'doughnut'>['options'] = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: '',
        font: {
          size: 20
        }
      },
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          font: {
            size: 13,
            weight: 'bold'
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label ?? '';
            const value = context.parsed ?? 0;
            return `${label}: ${value} ore`;
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

    let idJobDetailsList = operationList.map(operation => operation.id_job_details);
    idJobDetailsList = idJobDetailsList.filter((e, i, arr) => arr.lastIndexOf(e) === i);

    const tmpDataList: Record<string, number> = {};

    for (const idJobDetails of idJobDetailsList) {
      const jobDetails = await this.managerService.jobDetails_getFromId(idJobDetails);
      const job = await this.managerService.job_getFromId(jobDetails.id_job);
      
      const operationJobDetailsList = operationList.filter(
        operation => operation.id_job_details === idJobDetails
      );

      const hour = await this.managerService.serviceOperation_getWorkHoursFromList(
        operationJobDetailsList
      );
      tmpDataList[job.code] = parseFloat(String(tmpDataList[job.code] ?? 0)) + hour;
    }

    let dataList = Object.keys(tmpDataList).map(jobCode => ({
      job_code: jobCode,
      hours: tmpDataList[jobCode]
    }));

    dataList = dataList.sort((a, b) => b.hours - a.hours).slice(0, 5);

    const colorList = ['#2f53a1aa', '#53becfaa', '#53ad74aa', '#EEB24Baa', '#c45831aa'];

    this.chartData = {
      labels: dataList.map(x => x.job_code),
      datasets: [
        {
          data: dataList.map(x => x.hours),
          borderWidth: 2,
          backgroundColor: colorList,
          borderColor: colorList,
          hoverBackgroundColor: colorList,
          hoverBorderColor: colorList
        }
      ]
    };
    
    this.chartOptions = {
      ...this.chartOptions,
      plugins: {
        ...this.chartOptions?.plugins,
        title: {
          display: true,
          text: `Commesse più usate nel ${this.dateService.date_getByFormat(new Date(), 'yyyy')}`
        }
      }
    };
  }

  public chartClicked({ event, active }: { event?: MouseEvent; active?: object[] }): void { }

  public chartHovered({ event, active }: { event?: MouseEvent; active?: object[] }): void { }
}