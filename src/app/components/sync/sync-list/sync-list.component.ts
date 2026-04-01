import { Component, HostListener, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { AuthService, USER_GROUP } from '../../../services/auth.service';
import { SyncService } from '../../../services/sync.service';

import { NotificationComponent } from '../../shared/notification/notification.component';
import { ManagerService } from 'src/app/services/manager.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
  selector: 'app-sync-list',
  templateUrl: './sync-list.component.html',
  styleUrls: ['./sync-list.component.scss'],
  standalone: false
})

export class SyncListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("SyncListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(
    private router: Router,
    private authService: AuthService,
    private idbService: IdbService,
    private syncService: SyncService,
    private managerService: ManagerService,
    private userSettingService: UserSettingService,
    public snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    let userSyncList = await this.managerService.userSync_getList();
    let userLogged = this.authService.getUserLogged();
    let userSyncCurrentList = [];
    //
    for (let userSyncK in userSyncList) {
      let userSync = userSyncList[userSyncK];
      //
      if (userSync.id_user == userLogged.id) {
        userSyncCurrentList.push(userSync);
      }
    }
    //
    return this.idbService.join(userSyncCurrentList, [
      { field: "id_sync", table: "sync" }
    ]);
  }

  async getColumnList(): Promise<GridColumnModel[]> {
    return [
      {
        field: "sync.id",
        label: "ID",
        width: "30px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "sync.code",
        label: "Code",
        width: "100%",
      },
      {
        field: "last_update",
        label: "Last Update",
        width: "150px",
      },
      // {
      //   field: "sync_with_server",
      //   label: "Sync with Server",
      //   //
      //   type: "button",
      //   icon: "mdi mdi-cloud",
      //   click: this.syncWithServer,
      //   userGroupList: [USER_GROUP.SUPER],
      // },
      // {
      //   field: "pull_from_server",
      //   label: "Pull from Server",
      //   //
      //   type: "button",
      //   icon: "mdi mdi-cloud-download",
      //   click: this.pullFromServer,
      //   userGroupList: [USER_GROUP.SUPER],
      // },
      // {
      //   field: "push_to_server",
      //   label: "Push to Server",
      //   //
      //   type: "button",
      //   icon: "mdi mdi-cloud-upload",
      //   click: this.pushToServer,
      //   userGroupList: [USER_GROUP.SUPER],
      // },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [
      {
        code: "sync_with_server",
        label: "Sync col Server",
        icon: "mdi mdi-cloud",
        click: this.syncWithServer,
        isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
      },
      {
        code: "pull_from_server",
        label: "Pull dal Server",
        icon: "mdi mdi-cloud-download",
        click: this.pullFromServer,
        isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
      },
      {
        code: "push_to_server",
        label: "Push al Server",
        icon: "mdi mdi-cloud-upload",
        click: this.pushToServer,
        isUserGroupValid: this.authService.isUserGroupValid([USER_GROUP.SUPER]),
      },
      {
        code: "clean_database",
        label: "Cancella Database",
        icon: "mdi mdi-database-remove",
        click: this.deleteDatabase,
      },
    ];
  }

  public syncWithServer = (sync?: DB.IDB_sync) => {
    this.syncService.syncWithServer(sync ? [sync.code] : [], sync ? [sync.code] : []).then((success) => {
      this.refresh(success);
    });
  }

  public pullFromServer = (sync?: DB.IDB_sync) => {
    this.syncService.pullFromServer(sync ? [sync.code] : [], true, true, {}, false).then((success) => {
      this.refresh(success);
    });
  }

  public pushToServer = (sync?: DB.IDB_sync) => {
    this.syncService.pushToServer(sync ? [sync.code] : [], true).then((success) => {
      this.refresh(success);
    });
  }

  public deleteDatabase = () => {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width_xl, height: environment.dialog_confirm_height_xl });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Il database verrà completamente cancellato.\nEventuali dati non sincronizzati col server verranno persi.\nProcedere?";
    //
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        await this.idbService.deleteDatabase();
        //
        this.userSettingService.setLocalStorage("service_task_report_public_idr", null);
        this.userSettingService.setLocalStorage("autodop_verbal_public_idr", null);
        this.userSettingService.setLocalStorage("id_truck_current", null);
        this.userSettingService.setLocalStorage("date_truck_current", null);
        this.userSettingService.setLocalStorage("user", null);
        this.userSettingService.setLocalStorage("user_group", null);
        this.userSettingService.setLocalStorage("user_child_list", null);
        this.userSettingService.setLocalStorage("date_login", null);
        this.userSettingService.setLocalStorage("date_alive", null);
        //
        this.authService.userLogout();
        window.location.reload();
      }
    });
  }

  refresh(success = true) {
    let currentUrl = this.router.url;
    this.snackBar.openFromComponent(NotificationComponent, {
      duration: 3000,
      data: {
        text: success ? "Completato" : "Errore"
      },
    }).afterOpened().subscribe(() => {
      /*
      this.router.navigateByUrl("/refresh", { skipLocationChange: true }).then(() => {
        this.router.navigate([currentUrl]);
      });
      */
      this.dataSource = this.getDataSource();
    });
  }
}
