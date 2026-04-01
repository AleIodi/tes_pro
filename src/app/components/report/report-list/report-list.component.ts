import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ReportReportComponent } from '../report-report/report-report.component';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-report-list',
    templateUrl: './report-list.component.html',
    styleUrls: ['./report-list.component.scss'],
    standalone: false
})

export class ReportListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ReportListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    let serviceTaskReportList = await this.managerService.serviceTaskReport_getList(this.managerService.getUserList());
    //
    let data = this.idbService.join(serviceTaskReportList, [
      {
        field: "id_service_task", table: "service_task", joinList: [
          {
            field: "id_job_details", table: "job_details", joinType: "LEFT", joinList: [{
              field: "id_job", table: "job", joinList: [{
                field: "id_consumer", table: "consumer"
              }]
            },
            { field: "id_job_details_action", table: "job_details_action" }]
          }
        ]
      },
      { field: "id_service_task_report_status", table: "service_task_report_status" }
    ]);
    //
    return data;
  }

  async getColumnList(): Promise<GridColumnModel[]> {
    return [
      {
        field: "id",
        label: "ID",
        width: "30px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "idr",
        label: "IDR",
        width: "30px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "code",
        label: "Codice",
        width: "100%",
      },
      {
        field: "service_task.code",
        label: "Attività",
        width: "100px",
      },
      {
        field: "service_task.job_details.job.consumer.name",
        label: "Cliente",
        width: "150px",
      },
      {
        field: "service_task?.job_details?.job?.code",
        label: "Commessa",
        width: "100px",
      },
      {
        field: "service_task.job_details.job_details_action.name",
        label: "Azione",
        width: "100px",
      },
      {
        field: "service_task.description",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "service_task.date_start",
        label: "Data",
        width: "100px",
        dataType: "date",
      },
      {
        field: "service_task_report_status.label",
        label: "Stato",
        width: "100px",
      },
      {
        field: "to_push",
        label: "Stato",
        width: "35px",
        //
        type: "icon",
        iconObj: {
          "0": {
            "label": "Inviato",
            "icon": "mdi mdi-check-circle",
          },
          "1": {
            "label": "Da inviare",
            "icon": "mdi mdi-clock-time-four-outline",
          },
          "default": {
            "label": "Inviato",
            "icon": "mdi mdi-check-circle",
          },
        }
      },
      {
        field: "show",
        label: "Mostra",
        //
        type: "button",
        icon: "mdi mdi-printer",
        click: this.showClick,
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [];
  }

  public showClick = (serviceTaskReport: DB.IDB_service_task_report) => {
    let dialog = this.managerService.dialog_open(ReportReportComponent, "Report " + serviceTaskReport.code, true, false, { width: "90%", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as ReportReportComponent;
    //
    component.serviceTaskReport = serviceTaskReport;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
