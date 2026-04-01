import { Component, HostListener, OnInit } from '@angular/core';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from 'src/app/services/manager.service';
import { DestinationListComponent } from '../destination-list/destination-list.component';

@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.component.html',
    styleUrls: ['./customer-list.component.scss'],
    standalone: false
})
export class CustomerListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("CustomerListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    return await this.managerService.customer_getList();
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
        label: "Ragione Sociale",
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
      {
        field: "email",
        label: "Email",
        width: "200px",
      },
      {
        field: "destination",
        label: "Destinazioni",
        //
        type: "button",
        icon: "mdi mdi-map-marker",
        click: this.destinationClick,
      },
    ];
  }

  public destinationClick = (consumer: DB.IDB_consumer) => {
    let dialog = this.managerService.dialog_open(DestinationListComponent, "Destinazioni - " + consumer.name, true, false, { width: "90%", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as DestinationListComponent;
    //
    component.consumer = consumer;
  }
}
