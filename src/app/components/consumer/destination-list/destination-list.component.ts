import { Component, HostListener, Input, OnInit } from '@angular/core';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from 'src/app/services/manager.service';
import { DestinationFormComponent } from '../destination-form/destination-form.component';

@Component({
    selector: 'app-destination-list',
    templateUrl: './destination-list.component.html',
    styleUrls: ['./destination-list.component.scss'],
    standalone: false
})
export class DestinationListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("DestinationListComponent"); event.stopPropagation(); } }

  @Input() consumer!: DB.IDB_consumer;

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    let destinationList = await this.managerService.destination_getList(this.consumer);
    //
    return this.idbService.join(destinationList, [
      { field: "id_consumer_parent", table: "consumer", alias: "consumer_parent" }
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
        field: "consumer_parent.name",
        label: "Cliente",
        width: "150px",
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
        field: "address",
        label: "Indirizzo",
        width: "200px",
      },
      {
        field: "city",
        label: "Città",
        width: "150px",
      },
      {
        field: "province",
        label: "Provincia",
        width: "75px",
      },
      {
        field: "zip",
        label: "Cap",
        width: "50px",
      },
      {
        field: "phone",
        label: "Telefono",
        width: "100px",
      },
      // {
      //   field: "email",
      //   label: "Email",
      //   width: "200px",
      // },
      {
        field: "trip_km",
        label: "Km",
        width: "50px",
      },
      {
        field: "trip_minutes",
        label: "Minuti",
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

  public openForm = (destination?: DB.IDB_consumer) => {
    let dialog = this.managerService.dialog_open(DestinationFormComponent, destination ? "Modifica Destinazione" : "Aggiungi Destinazione", true, true, { width: "550px", height: "500px" });
    let component = dialog.componentInstance.componentInnerInstance as DestinationFormComponent;
    //
    component.destination = destination;
    component.consumer = this.consumer;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
