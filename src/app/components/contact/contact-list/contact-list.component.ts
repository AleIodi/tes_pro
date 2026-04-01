import { Component, HostListener, Input, OnInit } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ContactFormComponent } from '../contact-form/contact-form.component';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-contact-list',
    templateUrl: './contact-list.component.html',
    styleUrls: ['./contact-list.component.scss'],
    standalone: false
})

export class ContactListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ContactListComponent"); event.stopPropagation(); } }

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
    let contactList = await this.managerService.contact_getList();
    //
    return this.idbService.join(contactList, [
      { field: "id_consumer", table: "consumer", joinType: "LEFT" }
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
        field: "consumer.name",
        label: "Cliente / Fornitore",
        width: "200px",
      },
      {
        field: "name_first",
        label: "Nome",
        width: "120px",
      },
      {
        field: "name_last",
        label: "Cognome",
        width: "120px",
      },
      {
        field: "phone",
        label: "Telefono",
        width: "130px",
      },
      {
        field: "email",
        label: "Email",
        width: "100%",
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
      {
        field: "modify",
        label: "Modifica",
        //
        type: "button",
        icon: "mdi mdi-pencil",
        click: this.openForm,
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [
      {
        code: "add",
        label: "Aggiungi",
        icon: "mdi mdi-plus",
        click: this.openForm,
      },
    ];
  }

  public openForm = (contact?: DB.IDB_contact) => {
    let dialog = this.managerService.dialog_open(ContactFormComponent, contact ? "Modifica Contatto" : "Aggiungi Contatto", true, true, { width: "40%", height: "500px" });
    let component = dialog.componentInstance.componentInnerInstance as ContactFormComponent;
    //
    component.contact = contact;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
