import { Component, HostListener, OnInit } from '@angular/core';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-job-details-action-list',
    templateUrl: './job-details-action-list.component.html',
    styleUrls: ['./job-details-action-list.component.scss'],
    standalone: false
})

export class JobDetailsActionListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("JobDetailsActionListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    return this.managerService.jobDetailsAction_getList();
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
        width: "150px",
      },
      {
        field: "name",
        label: "Descrizione",
        width: "100%",
      },
    ];
  }
}
