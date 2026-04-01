import { Component, HostListener, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { JobDetailsListComponent } from '../job-details-list/job-details-list.component';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from '../../../services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service';

@Component({
    selector: 'app-job-list',
    templateUrl: './job-list.component.html',
    styleUrls: ['./job-list.component.scss'],
    standalone: false
})

export class JobListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("JobListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    return this.managerService.job_getList();
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
        field: "consumer.name",
        label: "Cliente",
        width: "200px",
      },
      {
        field: "job_typology.name",
        label: "Tipologia",
        width: "100px",
      },
      {
        field: "code",
        label: "Codice",
        width: "100px",
      },
      {
        field: "name",
        label: "Descrizione",
        width: "100%",
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

  public detailsClick = (job: DB.IDB_job) => {
    let dialog = this.managerService.dialog_open(JobDetailsListComponent, "Dettagli Commessa", true, false, { width: "90%", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as JobDetailsListComponent;
    //
    component.job = job;
  }
}
