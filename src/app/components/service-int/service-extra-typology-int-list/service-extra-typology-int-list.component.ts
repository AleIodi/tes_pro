import { Component, HostListener, OnInit } from '@angular/core';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

@Component({
    selector: 'app-service-extra-typology-int-list',
    templateUrl: './service-extra-typology-int-list.component.html',
    styleUrls: ['./service-extra-typology-int-list.component.scss'],
    standalone: false
})

export class ServiceExtraTypologyIntListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceExtraTypologyIntListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    return this.managerService.serviceExtraTypology_getList();
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
        label: "Code",
        width: "100px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "name",
        label: "Nome",
        width: "100%",
      },
      {
        field: "is_refund",
        label: "Rimborso",
        width: "30px",
        //
        type: "icon",
        iconObj: {
          "0": {
            "label": "Giornaliero",
            "icon": "",
          },
          "1": {
            "label": "Rimborso",
            "icon": "mdi mdi-check-circle",
          },
          "default": {
            "label": "Giornaliero",
            "icon": "",
          },
        }
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
    ];
  }
}
