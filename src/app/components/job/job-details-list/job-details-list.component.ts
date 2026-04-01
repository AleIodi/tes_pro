import { Component, Inject, Optional, Input, HostListener, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-job-details-list',
    templateUrl: './job-details-list.component.html',
    styleUrls: ['./job-details-list.component.scss'],
    standalone: false
})

export class JobDetailsListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("JobDetailsListComponent"); event.stopPropagation(); } }

  @Input() job!: DB.IDB_job;

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    let jobDetailsArr = {
      enabled: "1",
    };
    //
    if (this.job) {
      jobDetailsArr["id_job"] = this.job.id;
    }
    //
    let jobDetailsList = await this.idbService.getItems<DB.IDB_job_details>("job_details", jobDetailsArr);
    //
    return this.idbService.join(jobDetailsList, [
      { field: "id_job", table: "job", joinList: [{ field: "id_consumer", table: "consumer" }] },
      { field: "id_job_details_action", table: "job_details_action" },
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
        field: "job.consumer.name",
        label: "Cliente",
        width: "200px",
      },
      {
        field: "job.name",
        label: "Commessa",
        width: "200px",
      },
      {
        field: "job_details_action.name",
        label: "Tipologia",
        width: "100%",
      },
    ];
  }
}
