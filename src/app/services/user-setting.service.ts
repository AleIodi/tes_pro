import { Injectable } from '@angular/core';

import { IdbService } from './idb.service'
import * as DB from '../idb/4service-pwa.idb';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class UserSettingService {
  constructor(private idbService: IdbService) { }

  async get(user: DB.IDB_user, code: string, def?: string) {
    if (user) {
      let userSetting = await this.idbService.getItem<DB.IDB_user_setting>("user_setting", { code: code, id_user: user.id, enabled: "1" });
      //
      if (userSetting) {
        return userSetting.value ?? def;
      }
    }
    //
    return def;
  }

  async set(user: DB.IDB_user, code: string, value: string) {
    await this.idbService.inup<DB.IDB_user_setting>("user_setting", { code: code, id_user: user.id, value: value, enabled: "1", to_push: "1" }, ["code", "id_user"]);
  }

  getLocalStorage(code: string, def?: string, isObject = false) {
    let value: any = localStorage.getItem(environment.database_name + "_" + code) ?? def;
    //
    if (isObject && value != "") {
      value = JSON.parse(value);
    }
    //
    return value;
  }

  setLocalStorage(code: string, value: any, isObject = false) {
    if (isObject) {
      value = JSON.stringify(value);
    }
    //
    if (value === null) {
      value = "";
    }
    //
    localStorage.setItem(environment.database_name + "_" + code, value);
  }
}
