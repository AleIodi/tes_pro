import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-user-select-form',
    templateUrl: './user-select-form.component.html',
    styleUrls: ['./user-select-form.component.scss'],
    standalone: false
})

export class UserSelectFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("UserSelectFormComponent"); event.stopPropagation(); } }

  constructor(public dialogRef: MatDialogRef<UserSelectFormComponent>, private idbService: IdbService, private managerService: ManagerService, private authService: AuthService) { }

  confirmClicked = false;

  formGroupObj = {
    user: new UntypedFormControl("", [CustomValidator.object]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);


  userAutocompleteObj = {
    dataList: new Observable<DB.IDB_user[]>(),
    setDataList: async () => {
      this.managerService.user_getList().then(userList => {
        this.userAutocompleteObj.dataList = this.formGroupObj.user.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : (value ? value.name_first + " " + value.name_last : "")),
            map(value => this.userAutocompleteObj.filter(userList, value))
          );
      });
    },
    display: (user: DB.IDB_user): string => {
      return user.name_first + " " + user.name_last;
    },
    filter: (userList: DB.IDB_user[], filterText: string): DB.IDB_user[] => {
      let userSelectableList = [];
      //
      for (let userK in userList) {
        let user = userList[userK];
        //
        let found = false;
        for (let userField_UserSelectedK in this.userAutocompleteObj.chipsObj.dataList) {
          let userField_UserSelected = this.userAutocompleteObj.chipsObj.dataList[userField_UserSelectedK];
          //
          if (user.id == userField_UserSelected.id) {
            found = true;
            break;
          }
        }
        //
        if (!found) {
          userSelectableList.push(user);
        }
      }
      //
      return userSelectableList.filter(user => (user.name_first + " " + user.name_last).toLowerCase().includes(filterText.toLowerCase()));
    },
    chipsObj: {
      enabled: true,
      removable: true,
      required: true,
      dataList: [],
    },
  };


  async ngOnInit() {
    await this.userAutocompleteObj.setDataList();
    //
    this.userAutocompleteObj.chipsObj.dataList = [this.authService.getUserLogged()];
  }

  async save() {
    this.confirmClicked = true;
    //
    let userList = this.userAutocompleteObj.chipsObj.dataList;
    //
    this.dialogRef.close(userList);
  }
}
