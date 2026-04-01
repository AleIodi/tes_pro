import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';
import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ManagerService } from 'src/app/services/manager.service';
import { Title } from '@angular/platform-browser';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
  selector: 'app-truck-stock-list',
  templateUrl: './truck-stock-list.component.html',
  styleUrls: ['./truck-stock-list.component.scss'],
  standalone: false
})

export class TruckStockListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("TruckStockListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;
  //
  truck: DB.IDB_truck = null;

  constructor(
    private authService: AuthService,
    private idbService: IdbService,
    private managerService: ManagerService,
    private matDialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private userSettingService: UserSettingService,
    private titleService: Title
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(async params => {
      let id_truck_current = this.userSettingService.getLocalStorage("id_truck_current");
      //
      if (id_truck_current) {
        this.truck = await this.managerService.truck_getFromId(parseInt(id_truck_current));
        //
        const title = "Giacenza Furgone - " + this.truck.name;
        this.titleService.setTitle(title);
      }
      //
      this.dataSource = this.getDataSource();
      this.columnList = this.getColumnList();
      this.toolbarItemList = this.getToolbarItemList();
    });
  }

  async getDataSource() {
    let stockList = await this.managerService.truckStock_getList(this.truck);
    let serviceTaskProductList = await this.idbService.idb.table<DB.IDB_service_task_product>("service_task_product").toArray();
    //
    return stockList.map(stock => {
      let qnt_used = serviceTaskProductList
        .filter(stp => stp.id_product === stock.id_product && stp.to_push === "1" && parseInt(stp.enabled) === 1)
        .reduce((acc, stp) => acc + Number(stp.value ?? 0), 0);
      return {
        ...stock,
        _qnt_used: qnt_used,
        _qnt_tot: Number(stock.qnt ?? 0) + qnt_used,
      };
    });
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
        field: "product.article",
        label: "Articolo",
        width: "150px",
      },
      {
        field: "product.name",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "product.um",
        label: "UM",
        width: "50px",
      },
      {
        field: "qnt",
        label: "Rimasta",
        width: "80px",
      },
      {
        field: "_qnt_used",
        label: "Usate",
        width: "80px",
      },
      {
        field: "_qnt_tot",
        label: "Totale",
        width: "80px",
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [];
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}