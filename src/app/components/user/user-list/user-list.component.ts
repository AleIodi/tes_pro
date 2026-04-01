import { Component, HostListener, OnInit, TemplateRef } from '@angular/core';

import { GridColumnModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { UserSignatureComponent } from '../user-signature/user-signature.component';
import { ManagerService } from 'src/app/services/manager.service';
import { ComponentType } from '@angular/cdk/portal';
import { DialogComponent } from '../../shared/dialog/dialog.component';

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    standalone: false
})

export class UserListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("UserListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
  }

  async getDataSource() {
    let ownUserList = this.managerService.getUserList();
    let idOwnUserList = ownUserList.map(user => user.id);
    //
    let userList = await this.managerService.user_getList();
    //
    if (this.authService.getUserGroupLogged().code != USER_GROUP.SUPER) {
      userList = userList.filter(user => {
        //
        //only user logged and user children
        if (!idOwnUserList.includes(user.id)) {
          return false;
        }
        //
        return true;
      });
    }
    //
    return userList;
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
        field: "username",
        label: "Utente",
        width: "150px",
      },
      {
        field: "name_first",
        label: "Nome",
        width: "150px",
      },
      {
        field: "name_last",
        label: "Cognome",
        width: "100%",
      },
      {
        field: "signature",
        label: "Firma",
        //
        type: "button",
        icon: "mdi mdi-pen",
        click: this.signatureClick,
      },
    ];
  }

  public signatureClick = (user: DB.IDB_user) => {
    let dialog = this.managerService.dialog_open(UserSignatureComponent, "Firma", true, true, {});
    let component = dialog.componentInstance.componentInnerInstance as UserSignatureComponent;
    //
    component._saveCallback = () => {
      dialog.close();
    };
    component.user = user;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }
}
