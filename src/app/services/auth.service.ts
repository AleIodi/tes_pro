import { Injectable, EventEmitter } from '@angular/core';
import { formatDate } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, from } from 'rxjs';
import { differenceInMinutes } from 'date-fns'
import { Md5 } from 'ts-md5';

import { environment } from '../../environments/environment';

import { IdbService } from './idb.service'
import { ManagerService } from './manager.service'
import * as DB from '../idb/4service-pwa.idb';
import { DateService } from './date.service';
import { UserSettingService } from './user-setting.service';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs';

export const USER_GROUP = {
  SUPER: "SUPER",
  ALL: "ALL",
  SYSTEM: "SYSTEM",
  ADMIN: "ADMIN",
  STANDARD: "STANDARD",
}

@Injectable()
export class AuthService {
  get isLoggedIn$() {
    return of(this.isUserLogged());
  }

  eventLoginContext = null;
  eventLoginEmitter = new EventEmitter<any>()
  userLogged$: BehaviorSubject<DB.IDB_user> = new BehaviorSubject(null);

  constructor(private router: Router, private idbService: IdbService, private userSettingService: UserSettingService, private dateService: DateService, private managerService: ManagerService) { }

  async login(username: string, password: string, convertInMD5: boolean, routeNext: string) {
    if (username && username != "" && password && password != "") {
      let user = await this.managerService.user_getFromUsername(username);
      let passwordMD5 = convertInMD5 ? Md5.hashStr(password) : password;
      //
      if (user && user.id && user.password == passwordMD5) {
        this.userLogout();
        await this.userLogin(user);
        //
        this.userLogged$.next(user);
        //
        this.eventLoginEmitter.emit({
          context: this.eventLoginContext,
          user: user,
        });
        //
        this.router.navigate([routeNext])
        //
        return true;
      }
    }
    //
    return false;
  }

  async logout() {
    this.userLogout();
    //
    this.router.navigate(["/login"]);
  }

  async userLogin(user: DB.IDB_user) {
    let dateLoginLast = this.dateService.date_getDateTime(new Date());
    //
    //TODO - Chiamare i setLocalStorage anche dopo PULL e PUSH
    //
    let userGroup = await this.managerService.userGroup_getFromId(user.id_user_group);
    let userChildList = await this.managerService.user_getList(user);
    //
    this.userSettingService.setLocalStorage("user", user, true);
    this.userSettingService.setLocalStorage("user_group", userGroup, true);
    this.userSettingService.setLocalStorage("user_child_list", userChildList, true);
    this.userSettingService.setLocalStorage("date_login", dateLoginLast);
    this.userSettingService.setLocalStorage("date_alive", dateLoginLast);
  }

  async userLogout() {
    this.userSettingService.setLocalStorage("user", null);
    this.userSettingService.setLocalStorage("user_group", null);
    this.userSettingService.setLocalStorage("user_child_list", null);
    this.userSettingService.setLocalStorage("date_login", null);
    this.userSettingService.setLocalStorage("date_alive", null);
  }

  getUserLogged() {
    let user = this.userSettingService.getLocalStorage("user", null, true) as DB.IDB_user;
    //
    return user;
  }

  getUserGroupLogged() {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    //
    return userGroup;
  }

  getUserLoggedId() {
    let user = this.getUserLogged();
    //
    if (user != null) {
      return user.id
    }
    //
    return null;
  }

  getUserLoggedIdr() {
    let user = this.getUserLogged();
    //
    if (user != null) {
      return user.idr
    }
    //
    return null;
  }

  isUserLogged() {
    let userLogged = this.getUserLogged();
    let date_alive = this.userSettingService.getLocalStorage("date_alive", null);
    //
    if (userLogged) {
      if (date_alive) {
        let userSessionMinutes = differenceInMinutes(new Date(), new Date(date_alive));
        //
        if (userSessionMinutes < environment.user_session_minutes_max) {
          this.userUpdateDateAlive(userLogged);
          //
          return true;
        }
      }
      else {
        this.userUpdateDateAlive(userLogged);
        //
        return true;
      }
    }
    //
    return false;
  }

  isUserGroupValid(userGroupAuthList?: string[]) {
    let userGroupLogged = this.getUserGroupLogged();
    //
    if (userGroupLogged) {
      if (userGroupAuthList && userGroupAuthList.length > 0) {
        if (userGroupAuthList.includes(userGroupLogged.code)) {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        return true;
      }
    }
    //
    return false;
  }

  userUpdateDateAlive(user: DB.IDB_user) {
    let dateAlive = this.dateService.date_getDateTime(new Date());
    //
    this.userSettingService.setLocalStorage("date_alive", dateAlive);
  }
}
