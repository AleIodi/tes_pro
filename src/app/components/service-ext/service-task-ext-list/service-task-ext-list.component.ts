import { Component, HostListener, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { ServiceOperationListComponent } from '../../service-shared/service-operation-list/service-operation-list.component';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { ManagerService } from 'src/app/services/manager.service';
import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ServiceTaskDetailsExtComponent } from '../service-task-details-ext/service-task-details-ext.component';

@Component({
    selector: 'app-service-task-ext-list',
    templateUrl: './service-task-ext-list.component.html',
    styleUrls: ['./service-task-ext-list.component.scss'],
    standalone: false
})

export class ServiceTaskExtListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTaskExtListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private managerService: ManagerService, private idbService: IdbService, private matDialog: MatDialog) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    let serviceTaskList = await this.managerService.serviceTask_getList(this.managerService.getUserList());
    //
    for (let serviceTaskK in serviceTaskList) {
      serviceTaskList[serviceTaskK]["_date_start_date"] = serviceTaskList[serviceTaskK]["date_start"];
      serviceTaskList[serviceTaskK]["_work_hours"] = this.managerService.serviceTask_getWorkHours(serviceTaskList[serviceTaskK]);
    }
    //
    return this.idbService.join(serviceTaskList, [
      { field: "id_service_call", table: "service_call", joinType: "LEFT" },
      {
        field: "id_job_details", table: "job_details", joinType: "LEFT", joinList: [{
          field: "id_job", table: "job", joinList: [{
            field: "id_consumer", table: "consumer"
          }]
        },
        { field: "id_job_details_action", table: "job_details_action" }
        ]
      },
      //TODO join report
      //{ field: "id", table: "service_task_report", joinType: "LEFT" }
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
        field: "id_service_call",
        label: "ID Call",
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
        dataType: "time",
      },
      {
        field: "date_end",
        label: "Fine",
        width: "60px",
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
        field: "details",
        label: "Dettagli",
        //
        type: "button",
        icon: "mdi mdi-file-search-outline",
        click: this.detailsClick,
      },
    ];
  }

  public detailsClick = (serviceTask: DB.IDB_service_task) => {
    let dialog = this.managerService.dialog_open(ServiceTaskDetailsExtComponent, "Dettaglio Attività", true, false, { width: "90%", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceTaskDetailsExtComponent;
    //
    component.serviceTask = serviceTask;
    component.dateStart = serviceTask.date_start;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
