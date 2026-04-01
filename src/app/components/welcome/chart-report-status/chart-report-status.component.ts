import { Component, HostListener, OnInit } from '@angular/core';
import { ChartConfiguration, ChartType } from 'chart.js';
import { AuthService } from 'src/app/services/auth.service';
import { DateService } from 'src/app/services/date.service';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-chart-report-status',
    templateUrl: './chart-report-status.component.html',
    styleUrls: ['./chart-report-status.component.scss'],
    standalone: false
})
export class ChartReportStatusComponent implements OnInit {
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
        text: 'Stato rapportini',
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
            return ` ${value}${value === 1 ? ' rapportino' : ' rapportini'}`;
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
        suggestedMax: 10
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

    const serviceTaskReportList = await this.managerService.serviceTaskReport_getList(
      this.managerService.getUserList()
    );
    const serviceTaskReportStatusList = await this.managerService.serviceTaskReportStatus_getList();

    const dataList: number[] = [];
    const labelList: string[] = [];

    for (const serviceTaskReportStatus of serviceTaskReportStatusList) {
      labelList.push(serviceTaskReportStatus.label);

      dataList.push(
        serviceTaskReportList.filter(
          serviceTaskReport =>
            serviceTaskReport.id_service_task_report_status === serviceTaskReportStatus.id
        ).length
      );
    }

    this.chartData = {
      labels: labelList,
      datasets: [
        {
          data: dataList,
          borderWidth: 2,
          backgroundColor: ['#dc4c3eaa', '#efab46aa', '#5081a7aa', '#65a750aa'],
          borderColor: ['#dc4c3eaa', '#efab46aa', '#5081a7aa', '#65a750aa'],
          hoverBackgroundColor: ['#dc4c3eaa', '#efab46aa', '#5081a7aa', '#65a750aa'],
          hoverBorderColor: ['#dc4c3eaa', '#efab46aa', '#5081a7aa', '#65a750aa']
        }
      ]
    };
  }

  public chartClicked({ event, active }: { event?: MouseEvent; active?: object[] }): void { }

  public chartHovered({ event, active }: { event?: MouseEvent; active?: object[] }): void { }
}