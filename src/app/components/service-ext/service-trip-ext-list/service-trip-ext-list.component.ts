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
    selector: 'app-service-trip-ext-list',
    templateUrl: './service-trip-ext-list.component.html',
    styleUrls: ['./service-trip-ext-list.component.scss'],
    standalone: false
})

export class ServiceTripExtListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTripExtListComponent"); event.stopPropagation(); } }

  @Input() _isAddEnabled: boolean  = false;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;
  @Input() dateEnd;

  serviceTaskIsEditable = true;

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
    if (this.serviceTask) {
      this.serviceTaskIsEditable = this.serviceTask["service_task_report"] ? this.serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
    }
    //
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    let userLogged = this.authService.getUserLogged();
    let serviceTripList: DB.IDB_service_trip[];
    //
    if(this.serviceTask){
      serviceTripList = await this.managerService.serviceTrip_getList(null, this.serviceTask);
    }
    else{
      serviceTripList = await this.managerService.serviceTrip_getList(this.managerService.getUserList(), this.serviceTask);
      serviceTripList.reverse();
    }
    //
    for (let serviceTripK in serviceTripList) {
      serviceTripList[serviceTripK]["_date_start_date"] = serviceTripList[serviceTripK]["date_start"];
      serviceTripList[serviceTripK]["_hours"] = this.managerService.serviceTrip_getHours(serviceTripList[serviceTripK]);
    }
    //
    return this.idbService.join(serviceTripList, [{
      field: "id_service_task", table: "service_task", joinList: [{
        field: "id", table: "service_task_report", table_field: "id_service_task", joinType: "LEFT", joinList: [{
          field: "id_service_task_report_status", table: "service_task_report_status"
        }]
      },
      {
        field: "id_job_details", table: "job_details", joinList: [{
          field: "id_job", table: "job", joinList: [{
            field: "id_consumer", table: "consumer"
          }]
        }]
      }],
    },
    { field: "id_destination", table: "consumer" },
    { field: "id_user", table: "user" },
  ])
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
        field: "id_service_task",
        label: "ID Task",
        width: "50px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "_date_start_date",
        label: "Data",
        width: "100px",
        dataType: "date",
      },
      {
        field: "user.username",
        label: "Utente",
        width: "100px",
      },
      {
        field: "code",
        label: "Codice",
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
        field: "consumer.name",
        label: "Destinazione",
        width: "100%",
      },
      {
        field: "km_invoice",
        label: "Km Rapp",
        width: "80px",
      },
      {
        field: "km_real",
        label: "Km Reali",
        width: "80px",
      },
      {
        field: "date_start",
        label: "Inizio",
        width: "60px",
        dataType: "time",
      },
      {
        field: "date_end",
        label: "Fine",
        width: "60px",
        dataType: "time",
      },
      {
        field: "_hours",
        label: "Durata",
        width: "60px",
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
        field: "modify",
        label: "Modifica",
        //
        type: "button",
        icon: "mdi mdi-pencil",
        click: this.openForm,
        rowDisabledFunction: (element) => { return !(element["service_task"]["service_task_report"] ? element["service_task"]["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true); }
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [
      {
        code: "add",
        label: "Aggiungi",
        icon: "mdi mdi-plus",
        click: this.openForm,
        hidden: !this._isAddEnabled || !this.serviceTaskIsEditable,
      },
    ];
  }

  public openForm = (serviceTrip?: DB.IDB_service_trip) => {
    let dialog = this.managerService.dialog_open(ServiceTripExtFormComponent, serviceTrip ? "Modifica Viaggio" : "Aggiungi Viaggio", true, true, { width: "40%", height: "500px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceTripExtFormComponent;
    //
    component.serviceTrip = serviceTrip;
    component.serviceTask = this.serviceTask;
    component.dateStart = this.dateStart;
    component.dateEnd = this.dateEnd;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
