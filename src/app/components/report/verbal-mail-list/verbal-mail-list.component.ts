import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { formatDate } from '@angular/common';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { ManagerService } from 'src/app/services/manager.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { DateService } from 'src/app/services/date.service';

@Component({
    selector: 'app-verbal-mail-list',
    templateUrl: './verbal-mail-list.component.html',
    styleUrls: ['./verbal-mail-list.component.scss'],
    standalone: false
})
export class VerbalMailListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalMailListComponent"); event.stopPropagation(); } }

  @Input() _isAddEnabled: boolean  = false;
  @Input() autodopVerbal!: DB.IDB_autodop_verbal;

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private idbService: IdbService,
    private managerService: ManagerService,
    private dateService: DateService,
    private matDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    let userLogged = this.authService.getUserLogged();
    let autodopVerbalMailList: DB.IDB_autodop_verbal_mail[];
    //
    if(this.autodopVerbal){
      autodopVerbalMailList = await this.managerService.autodopVerbalMail_getList(this.autodopVerbal);
      //
      for (let autodopVerbalMailK in autodopVerbalMailList) {
        autodopVerbalMailList[autodopVerbalMailK]["_date_sent_date"] = autodopVerbalMailList[autodopVerbalMailK]["date_sent"];
      }
    }
    //
    return autodopVerbalMailList;
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
        field: "id_autodop_verbal",
        label: "ID Verbal",
        width: "50px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "user.username",
        label: "Mittente",
        width: "100px",
      },
      {
        field: "contact.email",
        label: "Email Destinatario",
        width: "100%",
      },
      {
        field: "contact.name_first",
        label: "Nome",
        width: "100px",
      },
      {
        field: "contact.name_last",
        label: "Cognome",
        width: "100px",
      },
      {
        field: "_date_sent_date",
        label: "Data Invio",
        width: "100px",
        dataType: "date",
      },
      {
        field: "date_sent",
        label: "Ora Invio",
        width: "60px",
        dataType: "time",
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
        },
        userGroupList: [USER_GROUP.SUPER],
      },
    ];
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
