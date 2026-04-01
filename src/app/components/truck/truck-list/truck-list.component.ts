import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
  selector: 'app-truck-list',
  templateUrl: './truck-list.component.html',
  styleUrls: ['./truck-list.component.scss'],
  standalone: false
})

export class TruckListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("TruckListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(
    private authService: AuthService,
    private idbService: IdbService,
    private managerService: ManagerService,
    private matDialog: MatDialog,
    private router: Router
  ) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    return this.managerService.truck_getList();
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
        width: "75px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "code",
        label: "Codice",
        width: "150px",
      },
      {
        field: "name",
        label: "Nome",
        width: "100%",
      },
      {
        field: "date_update",
        label: "Data",
        width: "200px",
      },
      {
        field: "stock",
        label: "Stock",
        //
        type: "button",
        icon: "mdi mdi-package-variant",
        click: this.openStock,
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [];
  }

  public openStock = (truck: DB.IDB_truck) => {
    this.router.navigate(["/truck-stock-list", truck.id]);
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}