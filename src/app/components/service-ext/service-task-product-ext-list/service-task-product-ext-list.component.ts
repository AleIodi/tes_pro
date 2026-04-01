import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ServiceTaskProductExtFormComponent } from '../../service-ext/service-task-product-ext-form/service-task-product-ext-form.component';
import { DateService } from 'src/app/services/date.service';

@Component({
    selector: 'app-service-task-product-ext-list',
    templateUrl: './service-task-product-ext-list.component.html',
    styleUrls: ['./service-task-product-ext-list.component.scss'],
    standalone: false
})

export class ServiceTaskProductExtListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTaskProductExtListComponent"); event.stopPropagation(); } }

  @Input() _isAddEnabled: boolean  = false;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  serviceTaskIsEditable = true;

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
    //
    let serviceTaskProductList = await this.managerService.serviceTaskProduct_getList(null, this.serviceTask);
    //
    return this.idbService.join(serviceTaskProductList, [
      {
        field: "id_service_task", table: "service_task", joinList: [{
          field: "id", table: "service_task_report", table_field: "id_service_task", joinType: "LEFT", joinList: [{
            field: "id_service_task_report_status", table: "service_task_report_status"
          }]
        }]
      },
      { field: "id_product", table: "product" },
      { field: "id_user", table: "user" },
    ]
    );
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
      /*
      {
        field: "service_task.code",
        label: "Attività",
        width: "100px",
      },
      */
      {
        field: "product.article",
        label: "Prodotto",
        width: "150px",
      },
      {
        field: "product.name",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "value",
        label: "Valore",
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
        field: "modify",
        label: "Modifica",
        //
        type: "button",
        icon: "mdi mdi-pencil",
        click: this.openForm, rowDisabledFunction: (element) => { return !(element["service_task"]["service_task_report"] ? element["service_task"]["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true); }
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

  public openForm = (serviceTaskProduct?: DB.IDB_service_task_product) => {
    let dialog = this.managerService.dialog_open(ServiceTaskProductExtFormComponent, serviceTaskProduct ? "Modifica Prodotto" : "Aggiungi Prodotto", true, true, { width: "90%", height: "400px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceTaskProductExtFormComponent;
    //
    component.serviceTaskProduct = serviceTaskProduct;
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
