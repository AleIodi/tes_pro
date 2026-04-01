import { Component, HostListener, OnInit } from '@angular/core';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-consumer-list',
    templateUrl: './consumer-list.component.html',
    styleUrls: ['./consumer-list.component.scss'],
    standalone: false
})

export class ConsumerListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ConsumerListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    let consumerList = await this.managerService.consumer_getList();
    //
    return this.idbService.join(consumerList, [
      { field: "id_consumer_typology", table: "consumer_typology" }
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
        field: "consumer_typology.name",
        label: "Tipologia",
        width: "150px",
      },
      {
        field: "code",
        label: "Codice",
        width: "150px",
      },
      {
        field: "name",
        label: "Ragione Sociale",
        width: "100%",
      },
    ];
  }
}
