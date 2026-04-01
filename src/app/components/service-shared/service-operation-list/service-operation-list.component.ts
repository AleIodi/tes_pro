import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ServiceOperationIntFormComponent } from '../../service-int/service-operation-int-form/service-operation-int-form.component';
import { ServiceOperationExtFormComponent } from '../../service-ext/service-operation-ext-form/service-operation-ext-form.component';
import { DateService } from 'src/app/services/date.service';

@Component({
    selector: 'app-service-operation-list',
    templateUrl: './service-operation-list.component.html',
    styleUrls: ['./service-operation-list.component.scss'],
    standalone: false
})

export class ServiceOperationListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceOperationListComponent"); event.stopPropagation(); } }

  @Input() serviceTypologyCode!: string;
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

  ngOnInit() {
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
    let operationList: DB.IDB_service_operation[];
    //
    if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      if (this.serviceTask) {
        operationList = await this.managerService.serviceOperation_getList(null, this.serviceTask, this.serviceTypologyCode);
      }
      else {
        operationList = await this.managerService.serviceOperation_getList(this.managerService.getUserList(), this.serviceTask, this.serviceTypologyCode);
        operationList.reverse();
      }
    }
    else {
      let dateStart_dayRange = this.dateService.date_getDayRange(this.dateStart);
      operationList = await this.managerService.serviceOperation_getList(this.managerService.getUserList(), this.serviceTask, this.serviceTypologyCode, dateStart_dayRange[0], dateStart_dayRange[1]);
    }
    //
    for (let operationK in operationList) {
      operationList[operationK]["_date_start_date"] = operationList[operationK]["date_start"];
      operationList[operationK]["_work_hours"] = this.managerService.serviceOperation_getWorkHours(operationList[operationK]);
    }
    //
    return this.idbService.join(operationList, [
      {
        field: "id_service_task", table: "service_task", joinType: "LEFT", joinList: [{
          field: "id", table: "service_task_report", table_field: "id_service_task", joinType: "LEFT", joinList: [{
            field: "id_service_task_report_status", table: "service_task_report_status"
          }]
        }]
      },
      {
        field: "id_job_details", table: "job_details", joinType: "LEFT", joinList: [{
          field: "id_job", table: "job", joinList: [{
            field: "id_consumer", table: "consumer"
          }]
        },
        { field: "id_job_details_action", table: "job_details_action" }]
      },
      { field: "id_user", table: "user" }
    ]);
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
        field: "job_details.job.consumer.name",
        label: "Cliente",
        width: "150px",
      },
      {
        field: "job_details?.job?.code",
        label: "Commessa",
        width: "100px",
      },
      {
        field: "job_details.job_details_action.name",
        label: "Dettaglio",
        width: "100px",
      },
      {
        field: "description",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "date_start",
        label: "Inizio",
        width: "60px",
        hidden: this.serviceTypologyCode != DB.SERVICE_TYPOLOGY.EXTERNAL,
        dataType: "time",
      },
      {
        field: "date_end",
        label: "Fine",
        width: "60px",
        hidden: this.serviceTypologyCode != DB.SERVICE_TYPOLOGY.EXTERNAL,
        dataType: "time",
      },
      {
        field: "_work_hours",
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
        rowDisabledFunction: (element) => {
          return !(
            (element["service_task"]["service_task_report"] ? element["service_task"]["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true)
            /* && (element["user"]["id"]==this.authService.getUserLogged().id  ? true : false) */
          )
        }
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
        hidden: !this.serviceTaskIsEditable,
      },
    ];
  }

  public openForm = (serviceOperation?: DB.IDB_service_operation) => {
    if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      let dialog = this.managerService.dialog_open(ServiceOperationExtFormComponent, serviceOperation ? "Modifica Operazione" : "Aggiungi Operazione", true, true, { width: "750px", height: "700px" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceOperationExtFormComponent;
      //
      component.serviceOperation = serviceOperation;
      component.serviceTask = this.serviceTask;
      component.dateStart = this.dateStart;
      component.dateEnd = this.dateEnd;
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh();
      });
    }
    else {
      let dialog = this.managerService.dialog_open(ServiceOperationIntFormComponent, serviceOperation ? "Modifica Operazione" : "Aggiungi Operazione", true, true, { width: "700px", height: "700px" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceOperationIntFormComponent;
      //
      component.serviceOperation = serviceOperation;
      component.dateStart = this.dateStart;
      component.dateEnd = this.dateEnd;
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh();
      });
    }
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
