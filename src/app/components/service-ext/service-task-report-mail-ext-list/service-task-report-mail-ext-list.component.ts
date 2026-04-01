import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ServiceTripExtFormComponent } from '../service-trip-ext-form/service-trip-ext-form.component';
import { DateService } from 'src/app/services/date.service';

@Component({
    selector: 'app-service-task-report-mail-ext-list',
    templateUrl: './service-task-report-mail-ext-list.component.html',
    styleUrls: ['./service-task-report-mail-ext-list.component.scss'],
    standalone: false
})
export class ServiceTaskReportMailExtListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTripExtListComponent"); event.stopPropagation(); } }

  @Input() _isAddEnabled: boolean  = false;
  @Input() serviceTask!: DB.IDB_service_task;

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private idbService: IdbService,
    private managerService: ManagerService,
    private dateService: DateService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    let userLogged = this.authService.getUserLogged();
    let serviceTaskReportMailList: DB.IDB_service_task_report_mail[];
    //
    if(this.serviceTask){
      let serviceTaskReport = await this.managerService.serviceTaskReport_getFromServiceTask(this.serviceTask);
      serviceTaskReportMailList = await this.managerService.serviceTaskReportMail_getList(serviceTaskReport);
      //
      for (let serviceTaskReportMailK in serviceTaskReportMailList) {
        serviceTaskReportMailList[serviceTaskReportMailK]["_date_sent_date"] = serviceTaskReportMailList[serviceTaskReportMailK]["date_sent"];
      }
    }
    //
    return serviceTaskReportMailList;
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
        field: "id_service_task_report",
        label: "ID Report",
        width: "50px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "user.username",
        label: "Mittente",
        width: "100px",
      },
      {
        field: "contact.email",
        label: "Email Destinatario",
        width: "100%",
      },
      {
        field: "contact.name_first",
        label: "Nome",
        width: "100px",
      },
      {
        field: "contact.name_last",
        label: "Cognome",
        width: "100px",
      },
      {
        field: "_date_sent_date",
        label: "Data Invio",
        width: "100px",
        dataType: "date",
      },
      {
        field: "date_sent",
        label: "Ora Invio",
        width: "60px",
        dataType: "time",
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
        },
        userGroupList: [USER_GROUP.SUPER],
      },
    ];
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
