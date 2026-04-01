import { Component, Input, HostListener, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ProductFormComponent } from '../product-form/product-form.component';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    standalone: false
})

export class ProductListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ProductListComponent"); event.stopPropagation(); } }

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
    return this.managerService.product_getList();
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
        field: "article",
        label: "Articolo",
        width: "150px",
      },
      {
        field: "name",
        label: "Descrizione",
        width: "100%",
      },
      {
        field: "um",
        label: "UM",
        width: "50px",
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
      /*Rimosso x interfacciamento ReadySolutions
      {
        field: "modify",
        label: "Modifica",
        //
        type: "button",
        icon: "mdi mdi-pencil",
        click: this.openForm,
        rowDisabledFunction: (element) => { return element.idr ? true : false }
      },
      */
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [
      /*Rimosso x interfacciamento ReadySolutions
      {
        code: "add",
        label: "Aggiungi",
        icon: "mdi mdi-plus",
        click: this.openForm,
      },
      */
    ];
  }

  public openForm = (product?: DB.IDB_product) => {
    let dialog = this.managerService.dialog_open(ProductFormComponent, product ? "Modifica Prodotto" : "Aggiungi Prodotto", true, true, { width: "90%", height: "400px" });
    let component = dialog.componentInstance.componentInnerInstance as ProductFormComponent;
    //
    component.product = product;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
