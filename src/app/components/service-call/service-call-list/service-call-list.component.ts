import { Component, HostListener, Input, OnInit } from '@angular/core';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { IdbService } from '../../../services/idb.service';
import { ServiceCallFormComponent } from '../service-call-form/service-call-form.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { ServiceCallMailFormComponent } from '../service-call-mail-form/service-call-mail-form.component';

@Component({
    selector: 'app-service-call-list',
    templateUrl: './service-call-list.component.html',
    styleUrls: ['./service-call-list.component.scss'],
    standalone: false
})
export class ServiceCallListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCallListComponent"); event.stopPropagation(); } }

  @Input() serviceCall!: DB.IDB_service_call;

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
    let serviceCallStatusNew = await this.managerService.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.NEW);
    let serviceCallStatusScheduled = await this.managerService.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.SCHEDULED);
    return (await this.managerService.serviceCall_getList(this.managerService.getUserList(),null,null,[serviceCallStatusNew,serviceCallStatusScheduled])).reverse();
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
        field: "service_call_status.name",
        label: "Stato",
        width: "100px",
      },
      {
        field: "code",
        label: "Codice",
        width: "100px",
      },
      {
        field: "consumer.name",
        label: "Cliente",
        width: "150px",
      },
      {
        field: "contact.name_last",
        label: "Referente",
        width: "100px",
      },
      {
        field: "job.code",
        label: "Commessa",
        width: "100px",
      },
      {
        field: "description",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "_machine_list",
        label: "Macchine",
        width: "200px",
      },
      {
        field: "_user_list",
        label: "Tecnici",
        width: "200px",
      },
      {
        field: "user.name_last",
        label: "Creato da",
        width: "100px",
      },
      {
        field: "date_create",
        label: "Creato il",
        width: "100px",
        dataType: "date",
      },
      {
        field: "date_start",
        label: "Inizio",
        width: "100px",
        dataType: "date",
      },
      {
        field: "date_end",
        label: "Fine",
        width: "100px",
        dataType: "date",
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
        field: "sendMail",
        label: "Invia Email",
        //
        type: "button",
        icon: "mdi mdi-email",
        click: this.openSendMail,
        userGroupList: [USER_GROUP.ALL,USER_GROUP.SUPER],
        rowDisabledFunction: (serviceCall) => {
          return serviceCall["service_call_status"]["code"] == DB.SERVICE_CALL_STATUS.COMPLETED;
        }
      },
      {
        field: "modify",
        label: "Modifica",
        //
        type: "button",
        icon: "mdi mdi-pencil",
        click: this.openForm,
        rowDisabledFunction: (serviceCall) => {
          return serviceCall["service_call_status"]["code"] != DB.SERVICE_CALL_STATUS.NEW;
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
        hidden: false,
      },
    ];
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }

  public openForm = (serviceCall?: DB.IDB_service_call) => {
    let dialog = this.managerService.dialog_open(ServiceCallFormComponent, serviceCall ? "Modifica Ticket" : "Crea Ticket", true, true, { width: "50%", height: "600px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceCallFormComponent;
    //
    component.serviceCall = serviceCall;
    component.isTicketSchedulationMode = false;
    //
    dialog.afterClosed().subscribe((a) => {
      this.refresh();
    });
  }

  public openSendMail = (serviceCall?: DB.IDB_service_call) => {
    let dialog = this.managerService.dialog_open(ServiceCallMailFormComponent, "Invio Mail", true, true, { width: "70%", height: "250px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceCallMailFormComponent;
    //
    component.serviceCall = serviceCall;
    //
    dialog.afterClosed().subscribe((a) => {
      this.refresh();
    });
  }
}
