import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { formatDate } from '@angular/common';
import { environment } from '../../environments/environment';

import { AuthService } from './auth.service'

import { differenceInMilliseconds } from 'date-fns'

import { IdbService } from './idb.service'
import * as DB from '../idb/4service-pwa.idb';
import { ManagerService } from './manager.service';
import { UserSettingService } from './user-setting.service';

@Injectable({
  providedIn: 'root'
})

export class SyncService {
  tablePullList = [
    "user_group",
    "user",
    "user_setting",
    "user_user_child",
    "consumer_typology",
    "consumer",
    "job_typology",
    "job",
    "job_details_action",
    "job_details",
    "contact",
    "machine_typology",
    "machine",
    "product",
    "truck",
    "truck_stock",
    "service_typology",
    "service_call_status",
    "service_call",
    "service_call_machine",
    "service_call_user",
    "service_task",
    "service_operation_typology",
    "service_operation",
    "service_operation_machine",
    "service_task_product",
    "service_task_report_status",
    "service_task_report",
    "service_task_report_mail",
    "service_task_user",
    "service_extra_typology",
    "service_extra",
    "service_trip",
    "autodop_verbal_typology",
    "autodop_verbal_status",
    "autodop_verbal",
    "autodop_verbal_mail",
  ];
  //
  tablePushList = [
    "user",
    "user_setting",
    "consumer",
    "contact",
    "product",
    "service_call",
    "service_call_machine",
    "service_call_user",
    "service_task",
    "service_operation",
    "service_operation_machine",
    "service_task_product",
    "service_task_report",
    "service_task_report_mail",
    "service_task_user",
    "service_extra",
    "service_trip",
    "autodop_verbal",
    "autodop_verbal_mail",
  ];

  constructor(private userSettingService: UserSettingService, private idbService: IdbService, private authService: AuthService, private managerService: ManagerService, private httpClient: HttpClient) { }

  getUrl(sideForced?: string) {
    let side = sideForced ?? this.userSettingService.getLocalStorage("side", "remote");
    //
    let url = environment.server[side].protocol + "://" + environment.server[side].host + ":" + environment.server[side].port + "/" + environment.project + "/ws/";
    //
    return url;
  }

  async syncWithServer(tablePullList: string[], tablePushList: string[]) {
    let success = true;
    //
    await this.brutalFix_ServiceTaskReportDuplicated();
    //
    if (success) {
      success = await this.pushToServer(tablePushList, true);
    }
    //
    if (success) {
      success = await this.pullFromServer(tablePullList, true, true, {}, false);
    }
    //
    return success;
  }

  async brutalFix_ServiceTaskReportDuplicated() {
    let serviceTaskReportList = await this.idbService.getItems<any>("service_task_report", { to_push: "1" });
    let code_arr = [];
    //
    for (let rowK in serviceTaskReportList) {
      let serviceTaskReport = serviceTaskReportList[rowK];
      //
      if (code_arr.includes(serviceTaskReport["code"])) {
        console.log("Duplicato", serviceTaskReport);
        //
        //cancello riga duplicata
        this.idbService.delete("service_task_report",serviceTaskReport["id"]);
      }
      else {
        code_arr.push(serviceTaskReport["code"]);
      }
    }
  }

  async getLastUpdate() {
    let userLogged = this.authService.getUserLogged();
    let sync = await this.idbService.getItem<DB.IDB_sync>("sync", { code: "user_sync", enabled: "1" });
    //
    if (sync && userLogged) {
      let userSync = await this.idbService.getItem<DB.IDB_user_sync>("user_sync", { id_user: userLogged.id, id_sync: sync.id, enabled: "1" });
      //
      if (userSync && userSync.last_update) {
        let lastUpdateFormatted = formatDate(new Date(userSync.last_update), "dd/MM/yyyy HH:mm:ss", "en-EN");
        //
        return lastUpdateFormatted
      }
    }
    //
    return "";
  }

  //
  //CHECK
  //

  check$(sideForced?: string) {
    let headerObj = new HttpHeaders();
    headerObj = headerObj.set("Content-Type", "application/json");
    headerObj = headerObj.set("Authorization", "Basic " + btoa(environment.user + ":" + environment.password));
    headerObj = headerObj.set("domain", "pwa");
    headerObj = headerObj.set("act", "check");
    //
    let options = {
      headers: headerObj,
    };
    //
    let check$ = this.httpClient.get(this.getUrl(sideForced), options);
    //
    return check$;
  }

  //
  //PULL
  //

  async pullFromServer(tablePullList: string[], checkuser: boolean, updateDate: boolean, pullParamObj: {}, checkConnection: boolean) {
    let userGroupLogged = await this.authService.getUserGroupLogged();
    let isSuper = userGroupLogged && userGroupLogged["code"] && userGroupLogged["code"] === "SUPER";
    //
    let sideForced = null;
    //
    if (checkConnection) {
      let success = false;
      //
      if (!success) {
        sideForced = this.userSettingService.getLocalStorage("side", "remote");
        //
        try {
          await this.check$(sideForced).toPromise();
          success = true;
        }
        catch (error) {
          success = false;
        }
      }
      //
      if (!success) {
        sideForced = sideForced == "remote" ? "local" : "remote";
        //
        try {
          await this.check$(sideForced).toPromise();
          success = true;
        }
        catch (error) {
          success = false;
        }
      }
      //
      if (!success) {
        //TODO - Mostrare errore
      }
    }
    //
    try {
      let timeObj = {};
      let dateStart = new Date();
      let dateTotalStart = new Date();
      //
      let tableList = tablePullList.length > 0 ? tablePullList : this.tablePullList;
      let userLogged = this.authService.getUserLogged();
      //
      let tableInfoList = [];
      for (let tableK in tableList) {
        let table = tableList[tableK];
        let sync = await this.idbService.getItem<DB.IDB_sync>("sync", { code: table });
        //
        let lastUpdate = null;
        if (sync && userLogged && !(pullParamObj && pullParamObj["type"] && ["SERVICE_TASK_REPORT", "AUTODOP_VERBAL"].includes(pullParamObj["type"]))) {
          let userSync = await this.idbService.getItem<DB.IDB_user_sync>("user_sync", { id_user: userLogged.id, id_sync: sync.id });
          if (userSync && userSync.last_update && userSync.last_update != "") {
            lastUpdate = userSync.last_update;
          }
        }
        //
        tableInfoList.push({
          table: table,
          table_column_arr: DB.Schema.tablePushList[table],
          last_update: lastUpdate,
        });
      }
      //
      if (isSuper) {
        console.log("");
        console.warn("PULL");
        console.warn("REQ", tableInfoList);
      }
      //
      //TRUCK
      //
      let id_truck_current = this.userSettingService.getLocalStorage("id_truck_current");
      if(userLogged && id_truck_current){
        let truck_current = await this.managerService.truck_getFromId(parseInt(id_truck_current));
        //
        if(truck_current){
         pullParamObj["idr_truck"] = truck_current["idr"];
        }
      }
      /*
      //
      let headerObj = new HttpHeaders();
      headerObj.append("Content-Type", "application/json");
      headerObj.append("Authorization", "Basic " + btoa(environment.user + ":" + environment.password));
      //
      let options = {
        headers: headerObj,
        params: {
          domain: "pwa",
          user: environment.user,
          password: environment.password,
          act: "pull",
          param: JSON.stringify({
            check_user: checkuser ? "1" : "0",
            id_user: this.authService.getUserLoggedIdr(),
            table_info_arr: tableInfoList,
            //
            pull_param_arr: pullParamObj,
          }),
        }
      };
      //
      timeObj["init"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
      dateStart = new Date();
      //
      let response = await this.httpClient.get(await this.getUrl(sideForced), options).toPromise();
      //
      timeObj["request"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
      dateStart = new Date();
      */
      let headerObj = new HttpHeaders();
      headerObj = headerObj.set("Content-Type", "application/json");
      headerObj = headerObj.set("Authorization", "Basic " + btoa(environment.user + ":" + environment.password));
      headerObj = headerObj.set("domain", "pwa");
      headerObj = headerObj.set("act", "pull");
      //
      let bodyObj = {
        check_user: checkuser ? "1" : "0",
        id_user: this.authService.getUserLoggedIdr(),
        table_info_arr: tableInfoList,
        //
        pull_param_arr: pullParamObj,
      };
      //
      timeObj["init"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
      dateStart = new Date();
      //
      let response = await this.httpClient.post(await this.getUrl(), JSON.stringify(bodyObj), { headers: headerObj, }).toPromise();
      //
      timeObj["request"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
      dateStart = new Date();
      //
      if (response && response["success"] && response["success"] == 1) {
        if (isSuper) console.warn("RES", response);
        timeObj["__backend"] = response["data"]["ts_execution"];
      }
      else {
        console.error("RES", response);
        //
        return false;
      }
      //
      let success = await this.idbService.idb.transaction("rw", this.idbService.idb.tables, async () => {
        if (response && response["data"] && response["data"]["table_arr"] && Object.keys(response["data"]["table_arr"]).length > 0) {
          let tableLastUpdateLast = null;
          let tableList = response["data"]["table_arr"];
          //
          if (pullParamObj && pullParamObj["type"] && pullParamObj["type"] == "SERVICE_TASK_REPORT") {
            let serviceTaskReportPublicIdr = null;
            if (tableList["service_task_report"] && tableList["service_task_report"]["rows"] && tableList["service_task_report"]["rows"][0] && tableList["service_task_report"]["rows"][0]["idr"] && tableList["service_task_report"]["rows"][0]["idr"] != "") {
              serviceTaskReportPublicIdr = tableList["service_task_report"]["rows"][0]["idr"];
            }
            this.userSettingService.setLocalStorage("service_task_report_public_idr", serviceTaskReportPublicIdr);
          }
          //
          if (pullParamObj && pullParamObj["type"] && pullParamObj["type"] == "AUTODOP_VERBAL") {
            let autodopVerbalPublicIdr = null;
            if (tableList["autodop_verbal"] && tableList["autodop_verbal"]["rows"] && tableList["autodop_verbal"]["rows"][0] && tableList["autodop_verbal"]["rows"][0]["idr"] && tableList["autodop_verbal"]["rows"][0]["idr"] != "") {
              autodopVerbalPublicIdr = tableList["autodop_verbal"]["rows"][0]["idr"];
            }
            this.userSettingService.setLocalStorage("autodop_verbal_public_idr", autodopVerbalPublicIdr);
          }
          //
          for (let table in tableList) {
            let tableLastUpdate = tableList[table]["last_update"];
            let rowList = tableList[table]["rows"];
            //
            for (let rowK in rowList) {
              let row = rowList[rowK];
              //
              for (let fieldK in row) {
                //
                //Risolve le chiavi esterne idr
                //
                let tableRel = fieldK.split("idr_")[1] ?? null;
                let idrTableRel = row[fieldK];
                //
                // Trovato un campo idr
                if (tableRel) {
                  // Il campo non è presente fra le relazioni
                  if (!DB.Schema.relationList || !DB.Schema.relationList[table] || !DB.Schema.relationList[table]["id_" + tableRel]) {
                    let error = `Relation "id_${tableRel}" in table "${table}" not found`;
                    console.error(error);
                    throw new Error(error);
                  }
                  // Il campo ha un valore
                  if (idrTableRel) {
                    let tableRelFixed = DB.Schema.relationList[table]["id_" + tableRel];
                    //
                    let tableRelRow = await this.idbService.getItem<any>(tableRelFixed, { "idr": idrTableRel });
                    //
                    if (!tableRelRow) {
                      let error = `idr "${idrTableRel}" in table "${tableRelFixed}" not found`;
                      console.error(error);
                      throw new Error(error);
                    }
                    //
                    delete row[fieldK];
                    row["id_" + tableRel] = tableRelRow["id"];
                  }
                  // Il campo non ha un valore
                  else {
                    delete row[fieldK];
                    row["id_" + tableRel] = null;
                  }
                }
                //
                //Converte gli smallint da string a number
                //
                // if (fieldK == "enabled") {
                //   row[fieldK] = parseInt(row[fieldK]);
                // }
              }
              //
              await this.idbService.inup<any>(table, row, ["idr"]);
            }
            //
            if (userLogged) {
              if (updateDate && tableLastUpdate) {
                tableLastUpdateLast = tableLastUpdate;
              }
              //
              let sync = await this.idbService.inup<DB.IDB_sync>("sync", { code: table, enabled: "1" }, ["code"]);
              await this.idbService.inup<DB.IDB_user_sync>("user_sync", { id_user: userLogged.id, id_sync: sync.id, last_update: tableLastUpdate, enabled: "1" }, ["id_user", "id_sync"]);
            }
          }
          //
          if (userLogged && updateDate && tableLastUpdateLast) {
            let sync = await this.idbService.inup<DB.IDB_sync>("sync", { code: "user_sync", enabled: "1" }, ["code"]);
            await this.idbService.inup<DB.IDB_user_sync>("user_sync", { id_user: userLogged.id, id_sync: sync.id, last_update: tableLastUpdateLast, enabled: "1" }, ["id_user", "id_sync"]);
          }
        }
        //
        return true;
      }).then(() => {
        timeObj["processing"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
        timeObj["TOTAL"] = differenceInMilliseconds(new Date(), dateTotalStart) / 1000;
        //
        for (let timeObjK in timeObj) {
          let time = timeObj[timeObjK];
          //
          if (isSuper) console.log("Time [" + timeObjK + "]", time + " sec");
        }
        //
        return true;
      }).catch(err => {
        console.error(err.stack);
        //
        return false;
      });
      //
      return success;
    }
    catch (error) {
      return false;
    }
  }
  //
  //PUSH
  //
  async pushToServer(tablePushList: string[], checkuser: boolean) {
    let userGroupLogged = await this.authService.getUserGroupLogged();
    let isSuper = userGroupLogged && userGroupLogged["code"] && userGroupLogged["code"] === "SUPER";
    //
    try {
      let timeObj = {};
      let dateStart = new Date();
      let dateTotalStart = new Date();
      //
      let tableList = tablePushList.length > 0 ? tablePushList : this.tablePushList;
      let dataObj = {};
      //
      if (isSuper) {
        console.log("");
        console.warn("PUSH");
      }
      //
      for (let tableK in tableList) {
        let table = tableList[tableK];
        let rowList = await this.idbService.getItems<any[]>(table, { to_push: "1" });
        //
        for (let rowK in rowList) {
          let row = rowList[rowK];
          //
          for (let fieldK in row) {
            if (DB.Schema.relationList[table] && DB.Schema.relationList[table][fieldK] && row[fieldK] && row[fieldK] > 0) {
              let tableRel = DB.Schema.relationList[table][fieldK];
              let idRel = row[fieldK];
              //
              let rowRel = await this.idbService.getItem<any>(tableRel, { id: idRel });
              let fieldRel = fieldK.replace("id_", "idr_");
              //
              row[fieldRel] = rowRel["idr"] ?? null;
            }
          }
          //
          dataObj[table] = rowList;
        }
      }
      //
      if (isSuper) console.warn("REQ", dataObj);
      //
      let headerObj = new HttpHeaders();
      headerObj = headerObj.set("Content-Type", "application/json");
      headerObj = headerObj.set("Authorization", "Basic " + btoa(environment.user + ":" + environment.password));
      headerObj = headerObj.set("domain", "pwa");
      headerObj = headerObj.set("act", "push");
      //
      let bodyObj = {
        check_user: checkuser ? "1" : "0",
        id_user: this.authService.getUserLoggedIdr(),
        data: dataObj,
      };
      //
      timeObj["init"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
      dateStart = new Date();
      //
      let response = await this.httpClient.post(await this.getUrl(), JSON.stringify(bodyObj), { headers: headerObj, }).toPromise();
      //
      timeObj["request"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
      dateStart = new Date();
      //
      if (response && response["success"] && response["success"] == 1) {
        if (isSuper) console.warn("RES", response);
        timeObj["__backend"] = response["data"]["ts_execution"];
      }
      else {
        console.error("RES", response);
        //
        return false;
      }
      //
      let success = this.idbService.idb.transaction("rw", this.idbService.idb.tables, async () => {
        if (response && response["data"] && response["data"]["table_arr"]) {
          let tableRowList = response["data"]["table_arr"];
          //
          for (let table in tableRowList) {
            let rowList = tableRowList[table];
            //
            for (let rowK in rowList) {
              let rowArr = {
                id: rowList[rowK]["id"],
                idr: rowList[rowK]["idr"],
                to_push: "0",
              }
              //console.log(table,rowArr);
              await this.idbService.inup<any>(table, rowArr, ["id"]);
            }
          }
        }
        //
        return true;
      }).then(() => {
        timeObj["processing"] = differenceInMilliseconds(new Date(), dateStart) / 1000;
        timeObj["TOTAL"] = differenceInMilliseconds(new Date(), dateTotalStart) / 1000;
        //
        for (let timeObjK in timeObj) {
          let time = timeObj[timeObjK];
          //
          if (isSuper) console.log("Time [" + timeObjK + "]", time + " sec");
        }
        //
        return true;
      }).catch(err => {
        console.error(err.stack);
        //
        return false;
      });
      //
      return success;
    }
    catch (error) {
      return false;
    }
  }

  //
  //MAIL
  //

  async sendMail(mailObj) {
    let success = await this.syncWithServer([], []);
    //
    if (success) {
      let contactList: DB.IDB_contact[] = mailObj["contactList"];
      //
      let addressArr = [];
      for (let contactK in contactList) {
        let contact = contactList[contactK];
        //
        addressArr.push({
          email: contact.email,
          name: contact.name_first + " " + contact.name_last
        });
      }
      //
      let mail_param_obj = {};
      if(mailObj["mail_type"] == "SERVICE_TASK_REPORT"){
        let serviceTaskReport = await this.managerService.serviceTaskReport_getFromId(mailObj["serviceTaskReport"]["id"]);
        let serviceTask = await this.managerService.serviceTask_getFromId(serviceTaskReport.id_service_task);
        let jobDetails = await this.managerService.jobDetails_getFromId(serviceTask.id_job_details);
        let job = await this.managerService.job_getFromId(jobDetails.id_job);
        let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
        //
        mail_param_obj = {
          id_user: this.authService.getUserLoggedIdr(),
          data: {
            address_arr: addressArr,
            mail_type: mailObj["mail_type"],
            idr_service_task_report: serviceTaskReport.idr,
            subject: "[" + consumer.name + "] " + job.code + " - " + job.name + ": Rapportino " + serviceTaskReport.code,
            service_task_report_code: serviceTaskReport.code,
          },
        };
      }
      else if(mailObj["mail_type"] == "AUTODOP_VERBAL"){
        let autodopVerbal = await this.managerService.autodopVerbal_getFromId(mailObj["autodopVerbal"]["id"]);
        let job = await this.managerService.job_getFromId(autodopVerbal.id_job);
        let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
        //
        mail_param_obj = {
          id_user: this.authService.getUserLoggedIdr(),
          data: {
            address_arr: addressArr,
            mail_type: mailObj["mail_type"],
            idr_autodop_verbal: autodopVerbal.idr,
            subject: "[" + consumer.name + "] " + job.code + ": Verbale " + autodopVerbal.code,
            autodop_verbal_code: autodopVerbal.code,
          },
        };
      }
      else if(mailObj["mail_type"] == "TICKET"){
        let serviceCall = await this.managerService.serviceCall_getFromId(mailObj["serviceCall"]["id"]);
        let job = await this.managerService.job_getFromId(serviceCall.id_job);
        let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
        //
        mail_param_obj = {
          id_user: this.authService.getUserLoggedIdr(),
          data: {
            address_arr: addressArr,
            mail_type: mailObj["mail_type"],
            idr_service_call: serviceCall.idr,
            subject: "[" + consumer.name + "] " + job.code + ": Ticket " + (serviceCall.code ?? ""),
          },
        };
      }
      //
      //CALL
      //
      let headerObj = new HttpHeaders();
      headerObj = headerObj.set("Content-Type", "application/json");
      headerObj = headerObj.set("Authorization", "Basic " + btoa(environment.user + ":" + environment.password));
      headerObj = headerObj.set("domain", "pwa");
      headerObj = headerObj.set("act", "mail");
      //
      let bodyObj = mail_param_obj;
      //
      let response = await this.httpClient.post(await this.getUrl(), JSON.stringify(bodyObj), { headers: headerObj, }).toPromise();
      //
      if (response && response["success"] && response["success"] == 1) {
        return true;
      }
      else {
        console.error("RES", response);
        //
        return false;
      }
    }
    else {
      return false;
    }
  }
}
