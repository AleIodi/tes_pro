import { Component, Input, HostListener, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-machine-list',
    templateUrl: './machine-list.component.html',
    styleUrls: ['./machine-list.component.scss'],
    standalone: false
})
export class MachineListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("MachineListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService, private matDialog: MatDialog) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    let machineList = await this.managerService.machine_getList();
    //
    return this.idbService.join(machineList, [
      { field: "id_machine_typology", table: "machine_typology" },
      { field: "id_consumer", table: "consumer", joinType: "LEFT" },
      { field: "id_destination", table: "consumer", alias: "destination", joinType: "LEFT" }
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
      /*
      {
        field: "machine_typology.name",
        label: "Tipologia",
        width: "150px",
      },
      {
        field: "code",
        label: "Codice",
        width: "150px",
      },
      */
      {
        field: "consumer.name",
        label: "Cliente / Fornitore",
        width: "200px",
      },
      {
        field: "destination.name",
        label: "Sede",
        width: "200px",
      },
      {
        field: "destination.city",
        label: "Città",
        width: "150px",
      },
      {
        field: "destination.address",
        label: "Indirizzo",
        width: "200px",
      },
      {
        field: "name",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "ext_code",
        label: "Matricola",
        width: "150px",
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [];
  }
}
