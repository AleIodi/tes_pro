import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ServiceExtraIntFormComponent } from '../../service-int/service-extra-int-form/service-extra-int-form.component';
import { ServiceExtraExtFormComponent } from '../../service-ext/service-extra-ext-form/service-extra-ext-form.component';
import { DateService } from 'src/app/services/date.service';

@Component({
    selector: 'app-service-extra-list',
    templateUrl: './service-extra-list.component.html',
    styleUrls: ['./service-extra-list.component.scss'],
    standalone: false
})

export class ServiceExtraListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceExtraListComponent"); event.stopPropagation(); } }

  @Input() _isAddEnabled: boolean  = false;
  @Input() serviceTypologyCode!: string;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;

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
    let serviceExtraList: DB.IDB_service_extra[] = [];
    //
    if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      if (this.serviceTask) {
        serviceExtraList = await this.managerService.serviceExtra_getList(null, this.serviceTask, this.serviceTypologyCode, true);
      }
      else {
        serviceExtraList = await this.managerService.serviceExtra_getList(this.managerService.getUserList(), this.serviceTask, this.serviceTypologyCode, true);
      }
    }
    else {
      let dateStart_dayRange = this.dateService.date_getDayRange(this.dateStart);
      serviceExtraList = await this.managerService.serviceExtra_getList(this.managerService.getUserList(), this.serviceTask, this.serviceTypologyCode, true, dateStart_dayRange[0], dateStart_dayRange[1]);
    }
    //
    return this.idbService.join(serviceExtraList, [
      { field: "id_service_extra_typology", table: "service_extra_typology" },
      {
        field: "id_service_task", table: "service_task", joinType: "LEFT", joinList: [{
          field: "id", table: "service_task_report", table_field: "id_service_task", joinType: "LEFT", joinList: [{
            field: "id_service_task_report_status", table: "service_task_report_status"
          }]
        }]
      },
      { field: "id_job", table: "job", joinType: "LEFT", joinList: [{ field: "id_consumer", table: "consumer" }] },
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
        field: "date_start",
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
        field: "job.consumer.name",
        label: "Cliente",
        width: "150px",
      },
      {
        field: "job.code",
        label: "Commessa",
        width: "100px",
      },
      {
        field: "service_extra_typology.name",
        label: "Tipologia",
        width: "100px",
      },
      {
        field: "value",
        label: "Valore",
        width: "100px",
      },
      {
        field: "notes",
        label: "Note",
        width: "100%",
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

  public openForm = (serviceExtra?: DB.IDB_service_extra) => {
    let dialog = null;
    let component = null;
    //
    if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      dialog = this.managerService.dialog_open(ServiceExtraExtFormComponent, serviceExtra ? "Modifica Spesa" : "Aggiungi Spesa", true, true, { width: "40%", height: "550px" });
      component = dialog.componentInstance.componentInnerInstance as ServiceExtraExtFormComponent;
    } else {
      dialog = this.managerService.dialog_open(ServiceExtraIntFormComponent, serviceExtra ? "Modifica Spesa" : "Aggiungi Spesa", true, true, { width: "40%", height: "550px" });
      component = dialog.componentInstance.componentInnerInstance as ServiceExtraIntFormComponent;
    }
    //
    component.serviceExtra = serviceExtra;
    component.serviceTask = this.serviceTask;
    component.dateStart = this.dateStart;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
