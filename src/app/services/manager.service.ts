import { Injectable } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';

import { IdbService } from './idb.service'
import * as DB from '../idb/4service-pwa.idb';

import { differenceInMinutes, addMinutes, differenceInDays } from 'date-fns'
import { stringify } from 'querystring';
import { ComponentType } from '@angular/cdk/portal';
import { DialogComponent } from '../components/shared/dialog/dialog.component';
import { DateService } from './date.service';
import { formatDate } from '@angular/common';
import { UserSettingService } from './user-setting.service';

export interface I_ServiceOperationInup {
  service_operation?: DB.IDB_service_operation,
  service_call?: DB.IDB_service_call,
  service_task?: DB.IDB_service_task,
  service_typology: DB.IDB_service_typology,
  service_operation_typology: DB.IDB_service_operation_typology,
  date_start: string,
  date_end: string,
  consumer: DB.IDB_consumer,
  destination?: DB.IDB_consumer,
  job_details: DB.IDB_job_details,
  description: string,
  is_external: string,
  is_finished?: string,
  id_truck?: number,
}

export interface I_ServiceOperationMachineInup {
  service_operation_machine?: DB.IDB_service_operation_machine,
  service_operation: DB.IDB_service_operation,
  machine: DB.IDB_machine,
  enabled?: boolean,
}

export interface I_ServiceTripInup {
  service_trip?: DB.IDB_service_trip,
  service_task: DB.IDB_service_task,
  date_start: string,
  date_end: string,
  km_real: number;
  km_invoice: number;
  destination: DB.IDB_consumer;
}

export interface I_ServiceTaskInup {
  service_task?: DB.IDB_service_task,
  id_service_call?: number,
  date_start: string,
  date_end: string,
  description: string,
  notes: string,
  notes_internal: string,
  id_job_details: number,
  id_destination: number,
  id_user_creator: number,
  //
  extraLunch: number,
  extraDinner: number,
  extraNight: number,
  extraTripKm: number,
  //
  is_finished?: string,
  id_truck?: number,
}

export interface I_ServiceCallInup {
  service_call?: DB.IDB_service_call,
  id_service_call_status?: number,
  date_start?: string,
  date_end?: string,
  description: string,
  consumer: DB.IDB_consumer,
  destination?: DB.IDB_consumer,
  contact?: DB.IDB_contact,
  job: DB.IDB_job,
  job_details?: DB.IDB_job_details,
}

export interface I_ServiceCallMachineInup {
  service_call_machine?: DB.IDB_service_call_machine,
  service_call: DB.IDB_service_call,
  machine: DB.IDB_machine,
  enabled?: boolean,
}

export interface I_ServiceCallUserInup {
  service_call_user?: DB.IDB_service_call_user,
  service_call: DB.IDB_service_call,
  user: DB.IDB_user,
  enabled?: boolean,
}

export interface I_ServiceExtraInup {
  service_extra?: DB.IDB_service_extra,
  service_task?: DB.IDB_service_task,
  service_typology: DB.IDB_service_typology,
  date_start: string,
  date_end: string,
  consumer: DB.IDB_consumer,
  job: DB.IDB_job,
  value: string,
  service_extra_typology: DB.IDB_service_extra_typology,
  notes: string,
  is_external: string,
}

export interface I_ServiceTaskProductInup {
  service_task_product?: DB.IDB_service_task_product,
  service_task: DB.IDB_service_task,
  product: DB.IDB_product,
  value: number,
  date_start: string,
}

export interface I_ProductInup {
  product?: DB.IDB_product,
  article: string,
  name: string,
}

export interface I_ConsumerInup {
  consumer?: DB.IDB_consumer,
  code: string,
  name: string,
  consumer_typology: DB.IDB_consumer_typology,
  consumer_parent?: DB.IDB_consumer,
  address: string;
  city: string;
  zip: string;
  province: string;
  nation: string;
  vat?: string;
  email?: string;
  phone?: string;
  trip_km?: number;
  trip_minutes?: number;
}

export interface I_ContactInup {
  contact?: DB.IDB_contact,
  name_first: string,
  name_last: string,
  consumer?: DB.IDB_consumer,
  phone: string,
  email: string,
}

export interface I_AutodopVerbalInup {
  autodop_verbal_typology: DB.IDB_autodop_verbal_typology,
  date_create: string,
  destination?: DB.IDB_consumer,
  job: DB.IDB_job,
  machine: DB.IDB_machine,
}

@Injectable({
  providedIn: 'root'
})

export class ManagerService {
  constructor(private idbService: IdbService, private dateService: DateService, private userSettingService: UserSettingService, private matDialog: MatDialog) { }

  //##########################################################################################
  // UTILS ###################################################################################
  //##########################################################################################

  dialog_open<T, D = any, R = any>(componentInnerType: ComponentType<T>, title: string, showToolbar: boolean, showPadding: boolean, config?: MatDialogConfig<D>) {
    if (config == null) {
      config = {};
    }
    //
    config.autoFocus = config.autoFocus ?? false;
    //
    let dialog = this.matDialog.open(DialogComponent, config);
    dialog.componentInstance.title = title;
    dialog.componentInstance.showToolbar = showToolbar;
    dialog.componentInstance.showPadding = showPadding;
    //
    dialog.componentInstance.attachComponentInner(componentInnerType);
    //
    return dialog;
  }

  async day_getHoursObj(userList: DB.IDB_user[], date, serviceTypologyCode) {
    let date_dayRange = this.dateService.date_getDayRange(date);
    let hoursObj = {};
    //
    let serviceOperationList = await this.serviceOperation_getList(userList, null, serviceTypologyCode, date_dayRange[0], date_dayRange[1]);
    hoursObj["serviceOperationWorkHours"] = await this.serviceOperation_getWorkHoursFromList(serviceOperationList);
    //
    let serviceExtraList = await this.serviceExtra_getList(userList, null, serviceTypologyCode, null, date_dayRange[0], date_dayRange[1]);
    //
    serviceExtraList = await this.idbService.join(serviceExtraList, [
      { field: "id_service_extra_typology", table: "service_extra_typology" },
    ]);
    //
    hoursObj["serviceExtraRefundList"] = serviceExtraList.filter(serviceExtra => serviceExtra["service_extra_typology"]["is_refund"] == 1 && serviceExtra["value"] != "0").sort((se1, se2) => se1["service_extra_typology"]["priority"] - se2["service_extra_typology"]["priority"]);
    hoursObj["serviceExtraDayList"] = serviceExtraList.filter(serviceExtra => serviceExtra["service_extra_typology"]["is_refund"] == 0 && serviceExtra["value"] != "0").sort((se1, se2) => se1["service_extra_typology"]["priority"] - se2["service_extra_typology"]["priority"]);
    //
    let serviceExtraList_hours = await this.serviceExtra_getHoursFromList(hoursObj["serviceExtraDayList"], serviceTypologyCode);
    hoursObj["dayWorkHours"] = 0;
    hoursObj["dayWorkHours"] += hoursObj["serviceOperationWorkHours"];
    hoursObj["dayWorkHours"] += serviceExtraList_hours;
    //
    return hoursObj;
  }

  //##########################################################################################
  // USER ####################################################################################
  //##########################################################################################

  async user_getFromId(id: number) {
    let user = await this.idbService.getItem<DB.IDB_user>("user", { id: id });
    //
    return user;
  }

  async user_getFromUsername(username) {
    let user = await this.idbService.getItem<DB.IDB_user>("user", { username: username, enabled: "1" });
    //
    return user;
  }

  async user_getList(userParent?: DB.IDB_user) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    let userList = await this.idbService.getItems<DB.IDB_user>("user", { enabled: "1" }, [{ field: "name_first", direction: "ASC" }]);
    userList = await this.idbService.join(userList, [
      { field: "id_user_group", table: "user_group" },
    ]);
    //
    userList = userList.filter((user) => {
      if (user["user_group"]["code"] == "SUPER") {
        return false;
      }
      //
      return true;
    });
    //
    if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
      if (userParent) {
        let userUserChildList = await this.idbService.getItems<DB.IDB_user_user_child>("user_user_child", { id_user: userParent.id, enabled: "1" });
        let userUserChild_idUserChildList = userUserChildList.map(userUserChild => userUserChild.id_user_child);
        //
        userList = userList.filter((user) => {
          if (!userUserChild_idUserChildList.includes(user.id)) {
            return false;
          }
          //
          return true;
        });
      }
    }
    //
    return userList;
  }

  async user_setSignature(user: DB.IDB_user, signature: string) {
    let userArr = {
      id: user.id,
      signature: signature,
      to_push: "1",
    };
    user = await this.idbService.inup<DB.IDB_user>("user", userArr, ["id"]);
    //
    return user;
  }

  getUserList(): DB.IDB_user[] {
    let user_child_list = this.userSettingService.getLocalStorage("user_child_list", null, true) as DB.IDB_user[];
    let userLogged = this.userSettingService.getLocalStorage("user", null, true) as DB.IDB_user;
    //
    user_child_list.push(userLogged);
    //
    return user_child_list;
  }

  //##########################################################################################
  // USER_GROUP ####################################################################################
  //##########################################################################################

  async userGroup_getFromId(id: number) {
    let userGroup = await this.idbService.getItem<DB.IDB_user_group>("user_group", { id: id });
    //
    return userGroup;
  }

  //##########################################################################################
  // USER_SYNC ###########################################################################
  //##########################################################################################

  async userSync_getFromId(id: number) {
    let userSync = await this.idbService.getItem<DB.IDB_user_sync>("user_sync", { id: id });
    //
    return userSync;
  }

  async userSync_getList() {
    let userSyncList = await this.idbService.getItems<DB.IDB_user_sync>("user_sync", { enabled: "1" });
    //
    return userSyncList;
  }


  //##########################################################################################
  // SERVICE_TYPOLOGY ##############################################################
  //##########################################################################################

  async serviceTypology_getFromId(id: number) {
    let serviceTypology = await this.idbService.getItem<DB.IDB_service_typology>("service_typology", { id: id });
    //
    return serviceTypology;
  }

  async serviceTypology_getFromCode(code: string) {
    let serviceTypology = await this.idbService.getItem<DB.IDB_service_typology>("service_typology", { code: code });
    //
    return serviceTypology;
  }

  async serviceTypology_getList() {
    let serviceTypologyArr = {
      enabled: "1",
    };
    //
    let serviceTypologyList = await this.idbService.getItems<DB.IDB_service_operation>("service_operation_typology", { enabled: "1" });
    //
    return serviceTypologyList;
  }

  //##########################################################################################
  // SERVICE_OPERATION_TYPOLOGY ##############################################################
  //##########################################################################################

  async serviceOperationTypology_getFromId(id: number) {
    let serviceOperationTypology = await this.idbService.getItem<DB.IDB_service_operation_typology>("service_operation_typology", { id: id });
    //
    return serviceOperationTypology;
  }

  async serviceOperationTypology_getFromCode(code: string) {
    let serviceOperationTypology = await this.idbService.getItem<DB.IDB_service_operation_typology>("service_operation_typology", { code: code });
    //
    return serviceOperationTypology;
  }

  async serviceOperationTypology_getList(serviceTypologyCode?: string) {
    let serviceOperationTypologyList = await this.idbService.getItems<DB.IDB_service_operation_typology>("service_operation_typology", { enabled: "1" });
    await this.idbService.join(serviceOperationTypologyList, [
      { field: "id_service_typology", table: "service_typology" },
    ]);
    //
    serviceOperationTypologyList = serviceOperationTypologyList.filter(serviceOperationTypology => {
      //
      //service_typology_code
      if (serviceTypologyCode !== null && serviceTypologyCode !== undefined && serviceOperationTypology["service_typology"] !== undefined && serviceTypologyCode != serviceOperationTypology["service_typology"]["code"]) {
        return false;
      }
      //
      return true;
    });
    //
    return serviceOperationTypologyList;
  }

  //##########################################################################################
  // SERVICE_OPERATION #######################################################################
  //##########################################################################################

  async serviceOperation_getFromId(id: number): Promise<DB.IDB_service_operation> {
    let serviceOperation = await this.idbService.getItem<DB.IDB_service_operation>("service_operation", { id: id });
    //
    return serviceOperation;
  }

  async serviceOperation_getList(userList: DB.IDB_user[], serviceTask?: DB.IDB_service_task, serviceTypologyCode?: string, dateStart?, dateEnd?) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    let idUserSet = idUserList ? new Set(idUserList) : null;
    //
    let idServiceTaskList = null;
    let serviceTaskList = await this.serviceTask_getList(userList, dateStart, dateEnd, false);
    if (serviceTaskList !== null) {
      idServiceTaskList = serviceTaskList.map(serviceTask => serviceTask.id);
    }
    let idServiceTaskSet = idServiceTaskList ? new Set(idServiceTaskList) : null;
    //
    let serviceOperationList = await this.idbService.idb.table<DB.IDB_service_operation>("service_operation").orderBy("date_start").toArray();
    await this.idbService.join(serviceOperationList, [
      { field: "id_service_typology", table: "service_typology" },
    ]);
    //
    serviceOperationList = serviceOperationList.filter(serviceOperation => {
      //
      //enabled
      if (parseInt(serviceOperation.enabled) == 0) {
        return false;
      }
      //
      //id_service_task filter
      if (serviceTask && serviceTask.id != serviceOperation.id_service_task) {
        return false;
      }
      //
      //service_typology_code
      if (serviceTypologyCode !== null && serviceTypologyCode !== undefined && serviceOperation["service_typology"] !== undefined && serviceTypologyCode != serviceOperation["service_typology"]["code"]) {
        return false;
      }
      //
      //date_start & date_end
      if (dateStart && dateEnd && (new Date(serviceOperation.date_end) < new Date(dateStart) || new Date(serviceOperation.date_start) > new Date(dateEnd))) {
        return false;
      }
      //
      //id_service_task (estraggo tutte le operazioni del task a cui l'utente è associato, così da mostrare anche le operazioni degli altri utenti)
      if (idServiceTaskSet && idServiceTaskSet.has(serviceOperation.id_service_task)) {
        return true;
      }
      //
      //id_user (nascondo le operazioni fatte da altri e non all'interno dei task associati all'utente)
      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        if (idUserSet && !idUserSet.has(serviceOperation.id_user)) {
          return false;
        }
      }
      //
      return true;
    });
    //
    return serviceOperationList;
  }

  async serviceOperation_inup(user: DB.IDB_user, valueObj: I_ServiceOperationInup, machineList?: DB.IDB_machine[]) {
    let serviceOperation: DB.IDB_service_operation;
    //
    if (!valueObj.service_operation) {
      serviceOperation = await this.serviceOperation_create(user, valueObj, valueObj["service_task"] ?? null, machineList);
    }
    else {
      serviceOperation = await this.serviceOperation_update(user, valueObj, machineList);
    }
    //
    return serviceOperation;
  }

  async serviceOperation_create(user: DB.IDB_user, valueObj: I_ServiceOperationInup, serviceTask?: DB.IDB_service_task, machineList?: DB.IDB_machine[]): Promise<DB.IDB_service_operation> {
    //
    //SERVICE_TASK
    //
    if (valueObj.is_external == "1" && !serviceTask) {
      let userLogged = this.userSettingService.getLocalStorage("user", null, true) as DB.IDB_user;
      //
      let serviceTaskValueObj: I_ServiceTaskInup = {
        service_task: null,
        id_service_call: valueObj?.service_call?.id ?? null,
        id_job_details: valueObj.job_details.id,
        id_destination: valueObj.destination.id,
        id_user_creator: userLogged.id,
        description: "",
        notes: "",
        notes_internal: "",
        date_start: valueObj.date_start,
        date_end: valueObj.date_end,
        extraLunch: null,
        extraDinner: null,
        extraNight: null,
        extraTripKm: null,
        is_finished: valueObj.is_finished,
        id_truck: valueObj.id_truck ?? null,
      }
      serviceTask = await this.serviceTask_inup(user, serviceTaskValueObj);
    } else {
      await this.serviceTask_setUser(user, serviceTask);
    }
    //
    //SERVICE_CALL
    //
    if (serviceTask.id_service_call) {
      let serviceCallStatusCompleted = await this.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.COMPLETED);
      //
      let serviceCallArr = {
        id: serviceTask.id_service_call,
        id_service_call_status: serviceCallStatusCompleted.id,
        to_push: "1",
      };
      let serviceCall = await this.idbService.inup<DB.IDB_service_call>("service_call", serviceCallArr, ["id"]);
    }
    //
    //SERVICE_OPERATION
    //
    let serviceOperationArr = {
      id_service_task: valueObj.is_external == "1" ? serviceTask.id : null,
      id_service_operation_typology: valueObj.service_operation_typology.id,
      id_job_details: valueObj.job_details.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      description: valueObj.description,
      id_user: user.id,
      is_external: valueObj.is_external,
      id_service_typology: valueObj.service_typology.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceOperation = await this.idbService.inup<DB.IDB_service_operation>("service_operation", serviceOperationArr);
    //
    await this.serviceTask_setDateFromServiceOperation(serviceOperation);
    //
    if (machineList) {
      await this.serviceOperation_setMachineList(user, serviceOperation, machineList);
    }
    //
    return serviceOperation;
  }

  async serviceOperation_update(user: DB.IDB_user, valueObj: I_ServiceOperationInup, machineList?: DB.IDB_machine[]): Promise<DB.IDB_service_operation> {
    let serviceOperation = await this.idbService.getItem<DB.IDB_service_operation>("service_operation", { id: valueObj.service_operation.id, enabled: "1" });
    //
    let serviceOperationArr = {
      id: serviceOperation.id,
      id_service_operation_typology: valueObj.service_operation_typology.id,
      id_job_details: valueObj.job_details.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      description: valueObj.description,
      id_user: user.id,
      is_external: valueObj.is_external,
      id_service_typology: valueObj.service_typology.id,
      to_push: "1",
    };
    serviceOperation = await this.idbService.inup<DB.IDB_service_operation>("service_operation", serviceOperationArr, ["id"]);
    //
    await this.serviceTask_setDateFromServiceOperation(serviceOperation);
    //
    if (machineList) {
      await this.serviceOperation_setMachineList(user, serviceOperation, machineList);
    }
    //
    return serviceOperation;
  }

  async serviceOperation_delete(serviceOperation: DB.IDB_service_operation) {
    let serviceTask = await this.serviceTask_getFromId(serviceOperation.id_service_task);
    //
    let serviceOperationArr = {
      id: serviceOperation.id,
      enabled: "0",
      to_push: "1",
    };
    serviceOperation = await this.idbService.inup<DB.IDB_service_operation>("service_operation", serviceOperationArr, ["id"]);
    //
    //elimino le eventuali macchine associate all'operazione
    this.serviceOperationMachine_deleteFromServiceOperation(serviceOperation);
    //
    //Verifica se ci sono altre operazioni nello stesso service_task
    let serviceOperationList = await this.serviceOperation_getList(null, serviceTask);
    if (serviceOperationList && serviceOperationList.length > 0) {
      await this.serviceTask_setDateFromServiceOperation(serviceOperation);
    }
    else {
      await this.serviceTask_delete(serviceTask);
    }
  }

  async serviceOperation_setDate(serviceOperation: DB.IDB_service_operation, dateStart, dateEnd) {
    let serviceOperationOld = await this.serviceOperation_getFromId(serviceOperation.id);
    //
    if (dateEnd == null) {
      let serviceOperation_workMinutes = this.serviceOperation_getWorkHours(serviceOperationOld) * 60;
      dateEnd = this.dateService.date_getDateTime(addMinutes(new Date(dateStart), serviceOperation_workMinutes));
    }
    //
    let serviceOperationArr = {
      id: serviceOperation.id,
      date_start: this.dateService.date_getDateTime(new Date(dateStart)),
      date_end: this.dateService.date_getDateTime(new Date(dateEnd)),
      to_push: "1",
    };
    serviceOperation = await this.idbService.inup<DB.IDB_service_operation>("service_operation", serviceOperationArr, ["id"]);
    //
    if (serviceOperation.is_external == "1") {
      await this.serviceTask_setDateFromServiceOperation(serviceOperation);
      //
      //Verifica se l'operazione spostata era l'ultima per l'attività nel giorno
      //Nel caso verifica se c'erano rimborsi in quella giornata e chiede all'utente se vuole trasferirli nel nuovo giorno
      //Se nel nuovo giorno è presente un'altro rimborso, chiede all'utente cosa vuole fare
      //
      let dateStart_dayRange = this.dateService.date_getDayRange(serviceOperationOld.date_start);
      let serviceTask = await this.serviceTask_getFromId(serviceOperation.id_service_task);
      let dayServiceOperationList = await this.serviceOperation_getList(this.getUserList(), serviceTask, null, dateStart_dayRange[0], dateStart_dayRange[1]);
      let dayServicTaskExtraList = await this.serviceExtra_getList(this.getUserList(), serviceTask, null, true, dateStart_dayRange[0], dateStart_dayRange[1])
      //
      if (dayServiceOperationList.length == 0 && dayServicTaskExtraList.length > 0) {
        for (let dayServicTaskExtraK in dayServicTaskExtraList) {
          let dayServicTaskExtra = dayServicTaskExtraList[dayServicTaskExtraK];
          //
          this.serviceExtraSetDate(dayServicTaskExtra, dateStart);
        }
      }
    }
  }

  async serviceOperation_getMachineList(serviceOperation: DB.IDB_service_operation) {
    let serviceOperationMachineList = await this.serviceOperationMachine_getList(serviceOperation);
    let serviceOperationMachine_idMachineList = serviceOperationMachineList.map(serviceOperationMachine => serviceOperationMachine.id_machine);
    let machineList = await this.machine_getList();
    //
    machineList = machineList.filter(machine => {
      if (!serviceOperationMachine_idMachineList.includes(machine.id)) {
        return false;
      }
      //
      return true;
    });
    //
    return machineList;
  }

  async serviceOperation_setMachineList(user: DB.IDB_user, serviceOperation: DB.IDB_service_operation, machineList: DB.IDB_machine[]) {
    await this.serviceOperationMachine_deleteFromServiceOperation(serviceOperation);
    //
    for (let machineK in machineList) {
      let machine = machineList[machineK];
      //
      let serviceOperationMachine = await this.idbService.getItem<DB.IDB_service_operation_machine>("service_operation_machine", { id_service_operation: serviceOperation.id, id_machine: machine.id });
      let serviceOperationMachineArr = {
        service_operation: serviceOperation,
        machine: machine,
        enabled: true,
      };
      //
      if (serviceOperationMachine) {
        serviceOperationMachineArr["service_operation_machine"] = serviceOperationMachine;
      }
      //
      this.serviceOperationMachine_inup(user, serviceOperationMachineArr);
    }
  }

  async serviceOperation_clone(user: DB.IDB_user, serviceOperation: DB.IDB_service_operation) {
    let serviceTask: DB.IDB_service_task = null;
    let destination: DB.IDB_consumer = null;
    if (serviceOperation.id_service_task) {
      serviceTask = await this.serviceTask_getFromId(serviceOperation.id_service_task);
      //
      if (serviceTask.id_destination) {
        destination = await this.idbService.getItem<DB.IDB_consumer>("consumer", { id: serviceTask.id_destination, enabled: "1" });
      }
    }
    //
    let jobDetails = await this.idbService.getItem<DB.IDB_job_details>("job_details", { id: serviceOperation.id_job_details/*, enabled: "1"*/ });
    let job = await this.job_getFromId(jobDetails.id_job);
    //
    let consumer = await this.idbService.getItem<DB.IDB_consumer>("consumer", { id: job.id_consumer, enabled: "1" });
    let serviceOperationTypology = await this.idbService.getItem<DB.IDB_service_operation_typology>("service_operation_typology", { id: serviceOperation.id_service_operation_typology, enabled: "1" });
    let serviceTypology = await this.idbService.getItem<DB.IDB_service_typology>("service_typology", { id: serviceOperation.id_service_typology, enabled: "1" });
    //
    let valueObj = {
      service_operation: null,
      consumer: consumer,
      destination: destination,
      job_details: jobDetails,
      description: serviceOperation.description,
      date_start: this.dateService.date_getDateTime(new Date(serviceOperation.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(serviceOperation.date_end)),
      enabled: serviceOperation.enabled,
      service_operation_typology: serviceOperationTypology,
      service_typology: serviceTypology,
      is_external: serviceOperation.is_external,
    };
    //
    let newServiceOperation = await this.serviceOperation_create(user, valueObj, serviceTask);
    //
    let machineList = await this.serviceOperation_getMachineList(serviceOperation);
    //
    for (let machineK in machineList) {
      let machine = machineList[machineK];
      //
      await this.serviceOperationMachine_create(user, {
        service_operation: newServiceOperation,
        machine: machine,
      });
    }
  }

  serviceOperation_getWorkHours(serviceOperation: DB.IDB_service_operation) {
    let serviceOperationWorkHours = differenceInMinutes(new Date(serviceOperation.date_end), new Date(serviceOperation.date_start)) / 60;
    //
    return serviceOperationWorkHours;
  }

  serviceOperation_getWorkHoursFromList(serviceOperationList: DB.IDB_service_operation[]) {
    let serviceOperationWorkHoursTot = 0;
    //
    for (let serviceOperationK in serviceOperationList) {
      let serviceOperation = serviceOperationList[serviceOperationK];
      //
      serviceOperationWorkHoursTot += this.serviceOperation_getWorkHours(serviceOperation);
    }
    //
    return serviceOperationWorkHoursTot;
  }

  async serviceOperation_isEditable(serviceOperation: DB.IDB_service_operation) {
    let serviceTask = await this.serviceTask_getFromId(serviceOperation.id_service_task);
    //
    return this.serviceTask_isEditable(serviceTask);
  }

  //##########################################################################################
  // SERVICE_OPERATION_MACHINE ###############################################################
  //##########################################################################################

  async serviceOperationMachine_getFromId(id: number): Promise<DB.IDB_service_operation_machine> {
    let serviceOperationMachine = await this.idbService.getItem<DB.IDB_service_operation_machine>("service_operation_machine", { id: id });
    //
    return serviceOperationMachine;
  }

  async serviceOperationMachine_getList(serviceOperation?: DB.IDB_service_operation) {
    let serviceOperationMachineList = await this.idbService.idb.table<DB.IDB_service_operation_machine>("service_operation_machine").toArray();
    serviceOperationMachineList = serviceOperationMachineList.filter(serviceOperationMachine => {
      //
      //enabled
      if (parseInt(serviceOperationMachine.enabled) == 0) {
        return false;
      }
      //
      //id_service_operation
      if (serviceOperation && serviceOperation.id != serviceOperationMachine.id_service_operation) {
        return false;
      }
      //
      return true;
    });
    //
    this.idbService.join(serviceOperationMachineList, [
      { field: "id_service_operation", table: "service_operation" },
      { field: "id_machine", table: "machine" }
    ]);
    //
    return serviceOperationMachineList;
  }

  async serviceOperationMachine_inup(user: DB.IDB_user, valueObj: I_ServiceOperationMachineInup) {
    if (!valueObj.service_operation_machine) {
      await this.serviceOperationMachine_create(user, valueObj);
    }
    else {
      await this.serviceOperationMachine_update(user, valueObj);
    }
  }

  async serviceOperationMachine_create(user: DB.IDB_user, valueObj: I_ServiceOperationMachineInup): Promise<DB.IDB_service_operation_machine> {
    let serviceOperationMachineArr = {
      id_service_operation: valueObj.service_operation.id,
      id_machine: valueObj.machine.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceOperationMachine = await this.idbService.inup<DB.IDB_service_operation_machine>("service_operation_machine", serviceOperationMachineArr);
    //
    return serviceOperationMachine;
  }

  async serviceOperationMachine_update(user: DB.IDB_user, valueObj: I_ServiceOperationMachineInup): Promise<DB.IDB_service_operation_machine> {
    let serviceOperationMachine = await this.idbService.getItem<DB.IDB_service_operation_machine>("service_operation_machine", { id: valueObj.service_operation_machine.id });
    //
    let serviceOperationMachineArr = {
      id: serviceOperationMachine.id,
      id_service_operation: valueObj.service_operation.id,
      id_machine: valueObj.machine.id,
      to_push: "1",
    };
    //
    if (valueObj.enabled) {
      serviceOperationMachineArr["enabled"] = valueObj.enabled ? "1" : "0";
    }
    //
    serviceOperationMachine = await this.idbService.inup<DB.IDB_service_operation_machine>("service_operation_machine", serviceOperationMachineArr, ["id"]);
    //
    return serviceOperationMachine;
  }

  async serviceOperationMachine_delete(serviceOperationMachine: DB.IDB_service_operation_machine) {
    let serviceOperationMachineArr = {
      id: serviceOperationMachine.id,
      enabled: "0",
      to_push: "1",
    };
    serviceOperationMachine = await this.idbService.inup<DB.IDB_service_operation_machine>("service_operation_machine", serviceOperationMachineArr, ["id"]);
  }

  async serviceOperationMachine_deleteFromServiceOperation(serviceOperation: DB.IDB_service_operation) {
    let serviceOperationMachineList = await this.serviceOperationMachine_getList(serviceOperation);
    for (let serviceOperationMachineK in serviceOperationMachineList) {
      let serviceOperationMachine = serviceOperationMachineList[serviceOperationMachineK];
      //
      this.serviceOperationMachine_delete(serviceOperationMachine);
    }
  }

  //##########################################################################################
  // SERVICE_TRIP ############################################################################
  //##########################################################################################

  async serviceTrip_getFromId(id: number) {
    let serviceTrip = await this.idbService.getItem<DB.IDB_service_trip>("service_trip", { id: id });
    //
    return serviceTrip;
  }

  async serviceTrip_getList(userList: DB.IDB_user[], serviceTask?: DB.IDB_service_task, dateStart?, dateEnd?) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    let idUserSet = idUserList ? new Set(idUserList) : null;
    //
    let idServiceTaskList = null;
    let serviceTaskList = await this.serviceTask_getList(userList, dateStart, dateEnd, false);
    if (serviceTaskList !== null) {
      idServiceTaskList = serviceTaskList.map(serviceTask => serviceTask.id);
    }
    let idServiceTaskSet = idServiceTaskList ? new Set(idServiceTaskList) : null;
    //
    let serviceTripList = await this.idbService.idb.table<DB.IDB_service_trip>("service_trip").orderBy("date_start").toArray();
    //
    serviceTripList = serviceTripList.filter(serviceTrip => {
      //
      //enabled
      if (parseInt(serviceTrip.enabled) == 0) {
        return false;
      }
      //
      //id_service_task filter
      if (serviceTask && serviceTask.id != serviceTrip.id_service_task) {
        return false;
      }
      //
      //date_start & date_end
      if (dateStart && dateEnd && (new Date(serviceTrip.date_end) < new Date(dateStart) || new Date(serviceTrip.date_start) > new Date(dateEnd))) {
        return false;
      }
      //
      //id_service_task (estraggo tutti i viaggi del task a cui l'utente è associato, così da mostrare anche i viaggi degli altri utenti)
      if (idServiceTaskSet && idServiceTaskSet.has(serviceTrip.id_service_task)) {
        return true;
      }
      //
      //id_user (nascondo i viaggi fatti da altri e non all'interno dei task associati all'utente)
      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        if (idUserSet && !idUserSet.has(serviceTrip.id_user)) {
          return false;
        }
      }
      //
      return true;
    });
    //
    return serviceTripList;
  }

  async serviceTrip_inup(user: DB.IDB_user, valueObj: I_ServiceTripInup) {
    let serviceTrip: DB.IDB_service_trip;
    //
    if (!valueObj.service_trip) {
      serviceTrip = await this.serviceTrip_create(user, valueObj, valueObj["service_task"] ?? null);
    }
    else {
      serviceTrip = await this.serviceTrip_update(user, valueObj);
    }
    //
    return serviceTrip;
  }

  async serviceTrip_create(user: DB.IDB_user, valueObj: I_ServiceTripInup, serviceTask?: DB.IDB_service_task): Promise<DB.IDB_service_trip> {
    if (!serviceTask) {
      //TODO - Dare errore (non posso fare un extra esterno senza task
    }
    //
    let serviceTripArr = {
      id_service_task: serviceTask.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      id_user: user.id,
      km_real: valueObj.km_real,
      km_invoice: valueObj.km_invoice,
      id_destination: valueObj.destination.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceTrip = await this.idbService.inup<DB.IDB_service_trip>("service_trip", serviceTripArr);
    //
    return serviceTrip;
  }

  async serviceTrip_update(user: DB.IDB_user, valueObj: I_ServiceTripInup): Promise<DB.IDB_service_trip> {
    let serviceTrip = await this.idbService.getItem<DB.IDB_service_trip>("service_trip", { id: valueObj.service_trip.id, enabled: "1" });
    //
    let serviceTripArr = {
      id: serviceTrip.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      id_user: user.id,
      km_real: valueObj.km_real,
      km_invoice: valueObj.km_invoice,
      id_destination: valueObj.destination.id,
      to_push: "1",
    };
    serviceTrip = await this.idbService.inup<DB.IDB_service_trip>("service_trip", serviceTripArr, ["id"]);
    //
    return serviceTrip;
  }

  async serviceTrip_delete(serviceTrip: DB.IDB_service_trip) {
    let serviceTask = await this.serviceTask_getFromId(serviceTrip.id_service_task);
    //
    let serviceTripArr = {
      id: serviceTrip.id,
      enabled: "0",
      to_push: "1",
    };
    serviceTrip = await this.idbService.inup<DB.IDB_service_trip>("service_trip", serviceTripArr, ["id"]);
  }

  async serviceTrip_deleteFromServiceTask(serviceTask: DB.IDB_service_task) {
    let serviceTripList = await this.serviceTrip_getList(null, serviceTask);
    for (let serviceTripK in serviceTripList) {
      let serviceTrip = serviceTripList[serviceTripK];
      //
      this.serviceTrip_delete(serviceTrip);
    }
  }

  async serviceTrip_setDate(serviceTrip: DB.IDB_service_trip, dateStart, dateEnd) {
    let serviceTripOld = await this.serviceTrip_getFromId(serviceTrip.id);
    //
    if (dateEnd == null) {
      let serviceTrip_workMinutes = this.serviceTrip_getHours(serviceTripOld) * 60;
      dateEnd = this.dateService.date_getDateTime(addMinutes(new Date(dateStart), serviceTrip_workMinutes));
    }
    //
    let serviceTripArr = {
      id: serviceTrip.id,
      date_start: this.dateService.date_getDateTime(new Date(dateStart)),
      date_end: this.dateService.date_getDateTime(new Date(dateEnd)),
      to_push: "1",
    };
    serviceTrip = await this.idbService.inup<DB.IDB_service_trip>("service_trip", serviceTripArr, ["id"]);
  }

  serviceTrip_getHours(serviceTrip: DB.IDB_service_trip) {
    let serviceTripHours = differenceInMinutes(new Date(serviceTrip.date_end), new Date(serviceTrip.date_start)) / 60;
    //
    return serviceTripHours;
  }

  serviceTrip_getHoursFromList(serviceTripList: DB.IDB_service_trip[]) {
    let serviceTripWorkHoursTot = 0;
    //
    for (let serviceTripK in serviceTripList) {
      let serviceTrip = serviceTripList[serviceTripK];
      //
      serviceTripWorkHoursTot += this.serviceTrip_getHours(serviceTrip);
    }
    //
    return serviceTripWorkHoursTot;
  }

  async serviceTrip_clone(user: DB.IDB_user, serviceTrip: DB.IDB_service_trip) {
    let serviceTask = await this.serviceTask_getFromId(serviceTrip.id_service_task);
    let destination = await this.destination_getFromId(serviceTrip.id_destination);
    //
    let valueObj = {
      service_trip: null,
      service_task: serviceTask,
      date_start: this.dateService.date_getDateTime(new Date(serviceTrip.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(serviceTrip.date_end)),
      km_real: serviceTrip.km_real,
      km_invoice: serviceTrip.km_invoice,
      destination: destination,
    };
    //
    await this.serviceTrip_create(user, valueObj, serviceTask);
  }

  //##########################################################################################
  // SERVICE_TASK ############################################################################
  //##########################################################################################

  async serviceTask_getFromId(id: number): Promise<DB.IDB_service_task> {
    let serviceTask = await this.idbService.getItem<DB.IDB_service_task>("service_task", { id: id });
    //
    return serviceTask;
  }

  async serviceTask_getList(userList: DB.IDB_user[], dateStart?, dateEnd?, onlyEditable = false) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    //
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    //
    let serviceTaskUserList = await this.serviceTaskUser_getList();
    //
    let serviceTaskList = await this.idbService.idb.table<DB.IDB_service_task>("service_task").toArray();
    await this.idbService.join(serviceTaskList, [
      {
        field: "id", table: "service_task_report", table_field: "id_service_task", joinType: "LEFT", joinList: [
          {
            field: "id_service_task_report_status", table: "service_task_report_status"
          }
        ]
      }
    ]);
    //
    serviceTaskList = await serviceTaskList.filter(serviceTask => {
      //
      //enabled
      if (parseInt(serviceTask.enabled) == 0) {
        return false;
      }
      //
      //date_start & date_end
      if (dateStart && dateEnd && (new Date(serviceTask.date_end) < new Date(dateStart) || new Date(serviceTask.date_start) > new Date(dateEnd))) {
        return false;
      }
      //
      //onlyEditable
      if (onlyEditable && serviceTask["service_task_report"] && serviceTask["service_task_report"]["service_task_report_status"]["code"] != DB.SERVICE_TASK_REPORT_STATUS.NEW) {
        return false;
      }
      //
      //UTENTE COME ULTIMO CONTROLLO PERCHE IL RETURN TRUE SALTEREBBE ALTRI CONTROLLI
      //
      //id_user_creator -> !!! ATTENZIONE !!! RETURN TRUE
      if (idUserList && idUserList.includes(serviceTask.id_user_creator)) {
        return true;
      }
      //
      //id_user
      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        let serviceTaskUserListFiltered = serviceTaskUserList.filter(function (v, k) {
          return v.id_service_task == serviceTask.id;
        })
        //
        if (idUserList && serviceTaskUserListFiltered.length != 0) {
          let idUserListFiltered = serviceTaskUserListFiltered.map(t => t.id_user);
          let idUserListIntersection = idUserListFiltered.filter(id_user => idUserList.includes(id_user));
          if (idUserListIntersection.length == 0) {
            return false;
          }
        }
      }
      //
      return true;
    });
    //
    return serviceTaskList;
  }

  async serviceTask_inup(user: DB.IDB_user, valueObj: I_ServiceTaskInup) {
    let serviceTask: DB.IDB_service_task = null;
    //
    if (!valueObj.service_task) {
      serviceTask = await this.serviceTask_create(user, valueObj);
    }
    else {
      serviceTask = await this.serviceTask_update(user, valueObj);
    }
    //
    return serviceTask;
  }

  async serviceTask_create(user: DB.IDB_user, valueObj: I_ServiceTaskInup): Promise<DB.IDB_service_task> {
    let serviceTaskArr = {
      id_service_call: valueObj.id_service_call ?? null,
      id_job_details: valueObj.id_job_details,
      id_destination: valueObj.id_destination,
      id_user_creator: valueObj.id_user_creator,
      description: valueObj.description,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      is_finished: valueObj.is_finished,
      id_truck: valueObj.id_truck ?? null,
      enabled: "1",
      to_push: "1",
    };
    let serviceTask = await this.idbService.inup<DB.IDB_service_task>("service_task", serviceTaskArr);
    //
    await this.serviceTask_setUser(user, serviceTask);
    await this.setServiceExtra(user, valueObj, serviceTask);
    //
    return serviceTask;
  }

  async serviceTask_update(user: DB.IDB_user, valueObj: I_ServiceTaskInup): Promise<DB.IDB_service_task> {
    let serviceTask = await this.idbService.getItem<DB.IDB_service_task>("service_task", { id: valueObj.service_task.id, enabled: "1" });
    //
    let serviceTaskArr = {
      id: serviceTask.id,
      description: valueObj.description,
      to_push: "1",
    };
    serviceTask = await this.idbService.inup<DB.IDB_service_task>("service_task", serviceTaskArr, ["id"]);
    //
    await this.serviceTask_setUser(user, serviceTask);
    //
    await this.setServiceExtra(user, valueObj, serviceTask);
    //
    return serviceTask;
  }

  async serviceTask_setDescription(serviceTask: DB.IDB_service_task, description) {
    let serviceTaskArr = {
      id: serviceTask.id,
      description: description,
      to_push: "1",
    };
    serviceTask = await this.idbService.inup<DB.IDB_service_task>("service_task", serviceTaskArr, ["id"]);
    //
    return serviceTask;
  }

  async serviceTask_setUser(user: DB.IDB_user, serviceTask: DB.IDB_service_task) {
    let serviceTaskUserArr = {
      id_service_task: serviceTask.id,
      id_user: user.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceTaskuser = await this.idbService.inup<DB.IDB_service_task_user>("service_task_user", serviceTaskUserArr, ["id_service_task", "id_user"]);
    //
    return serviceTaskuser;
  }

  async serviceTask_setDateFromServiceOperation(serviceOperation: DB.IDB_service_operation) {
    if (serviceOperation.id_service_task) {
      let serviceOperationStart: DB.IDB_service_operation = (await this.idbService.getItems<DB.IDB_service_operation>("service_operation", { id_service_task: serviceOperation.id_service_task, enabled: "1" }, [{ field: "date_start", direction: "ASC" }]))[0];
      let serviceOperationEnd: DB.IDB_service_operation = (await this.idbService.getItems<DB.IDB_service_operation>("service_operation", { id_service_task: serviceOperation.id_service_task, enabled: "1" }, [{ field: "date_end", direction: "DESC" }]))[0];
      //
      let serviceTaskArr = {
        id: serviceOperation.id_service_task,
        date_start: this.dateService.date_getDateTime(new Date(serviceOperationStart.date_start)),
        date_end: this.dateService.date_getDateTime(new Date(serviceOperationEnd.date_end)),
        to_push: "1",
      };
      await this.idbService.inup<DB.IDB_service_task>("service_task", serviceTaskArr, ["id"]);
    }
  }

  serviceTask_getWorkHours(serviceTask: DB.IDB_service_task) {
    let serviceTaskWorkHours = differenceInMinutes(new Date(serviceTask.date_end), new Date(serviceTask.date_start)) / 60;
    //
    return serviceTaskWorkHours;
  }

  serviceTask_getWorkHoursFromList(serviceTaskList: DB.IDB_service_task[]) {
    let serviceTaskWorkHoursTot = 0;
    //
    for (let serviceTaskK in serviceTaskList) {
      let serviceTask = serviceTaskList[serviceTaskK];
      //
      serviceTaskWorkHoursTot += this.serviceTask_getWorkHours(serviceTask);
    }
    //
    return serviceTaskWorkHoursTot;
  }

  async serviceTask_getUserList(serviceTask: DB.IDB_service_task) {
    let serviceOperationList = await this.serviceOperation_getList(null, serviceTask);
    await this.idbService.join(serviceOperationList, [
      { field: "id_user", table: "user" },
    ]);
    //
    let userList = [];
    if (serviceOperationList !== null) {
      userList = serviceOperationList.map(serviceOperation => serviceOperation["user"]);
      //
      //array_unique
      userList = userList.filter(
        (thing, i, arr) => arr.findIndex(t => t.id === thing.id) === i
      );
    }
    //
    return userList;
  }

  async serviceTask_delete(serviceTask: DB.IDB_service_task) {
    let serviceTaskArr = {
      id: serviceTask.id,
      enabled: "0",
      to_push: "1",
    };
    serviceTask = await this.idbService.inup<DB.IDB_service_task>("service_task", serviceTaskArr, ["id"]);
    //
    this.serviceTrip_deleteFromServiceTask(serviceTask);
    this.serviceExtra_deleteFromServiceTask(serviceTask);
    this.serviceTaskUser_deleteFromServiceTask(serviceTask);
    this.serviceTaskProduct_deleteFromServiceTask(serviceTask);
    this.serviceTaskReport_deleteFromServiceTask(serviceTask);
  }

  async serviceTask_hasReport(serviceTask: DB.IDB_service_task) {
    let serviceTaskReport = await this.serviceTaskReport_getFromServiceTask(serviceTask);
    //
    let hasReport = false;
    if (serviceTaskReport) {
      hasReport = true;
    }
    //
    return hasReport;
  }

  async serviceTask_isEditable(serviceTask: DB.IDB_service_task) {
    let serviceTaskReport = await this.serviceTaskReport_getFromServiceTask(serviceTask);
    if (!serviceTaskReport) {
      return true;
    }
    let serviceTaskReportStatusNew = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.NEW);
    //
    if (serviceTaskReport.id_service_task_report_status == serviceTaskReportStatusNew.id) {
      return true;
    }
    //
    return false;
  }

  //##########################################################################################
  // SERVICE_TASK_USER #######################################################################
  //##########################################################################################

  async serviceTaskUser_getList(serviceTask?: DB.IDB_service_task) {
    let serviceTaskUserArr = {
      enabled: "1",
    };
    //
    if (serviceTask) {
      serviceTaskUserArr["id_service_task"] = serviceTask.id;
    }
    let serviceTaskUserList = await this.idbService.getItems<DB.IDB_service_task_user>("service_task_user", serviceTaskUserArr);
    //
    return serviceTaskUserList;
  }

  async serviceTaskUser_delete(serviceTaskUser: DB.IDB_service_task_user) {
    let serviceTaskUserArr = {
      id: serviceTaskUser.id,
      enabled: "0",
      to_push: "1",
    };
    serviceTaskUser = await this.idbService.inup<DB.IDB_service_task_user>("service_task_user", serviceTaskUserArr, ["id"]);
  }

  async serviceTaskUser_deleteFromServiceTask(serviceTask: DB.IDB_service_task) {
    let serviceTaskUserList = await this.serviceTaskUser_getList(serviceTask);
    for (let serviceTaskUserK in serviceTaskUserList) {
      let serviceTaskUser = serviceTaskUserList[serviceTaskUserK];
      //
      this.serviceTaskUser_delete(serviceTaskUser);
    }
  }

  //##########################################################################################
  // SERVICE_CALL_STATUS ##############################################################
  //##########################################################################################

  async serviceCallStatus_getFromId(id: number) {
    let serviceCallStatus = await this.idbService.getItem<DB.IDB_service_call_status>("service_call_status", { id: id });
    //
    return serviceCallStatus;
  }

  async serviceCallStatus_getFromCode(code: string) {
    let serviceCallStatus = await this.idbService.getItem<DB.IDB_service_call_status>("service_call_status", { code: code });
    //
    return serviceCallStatus;
  }

  async serviceCallStatus_getList() {
    let serviceCallStatusList = await this.idbService.getItems<DB.IDB_service_call_status>("service_call_status", { enabled: "1" }, [{ field: "priority", direction: "ASC" }]);
    //
    return serviceCallStatusList;
  }

  //##########################################################################################
  // SERVICE_CALL ############################################################################
  //##########################################################################################

  async serviceCall_getFromId(id: number): Promise<DB.IDB_service_call> {
    let serviceCall = await this.idbService.getItem<DB.IDB_service_call>("service_call", { id: id });
    //
    return serviceCall;
  }

  async serviceCall_getList(userList: DB.IDB_user[], dateStart?, dateEnd?, serviceCallStatusList?: DB.IDB_service_call_status[]) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;

    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }

    const [
      serviceCallListRaw,
      serviceCallUserList,
      serviceCallMachineList,
      userTableList,
      machineTableList
    ] = await Promise.all([
      this.idbService.idb.table<DB.IDB_service_call>("service_call").toArray(),
      this.serviceCallUser_getList(),
      this.serviceCallMachine_getList(), // se esiste; altrimenti va creato l'equivalente
      this.idbService.idb.table<DB.IDB_user>("user").toArray(),
      this.idbService.idb.table<DB.IDB_machine>("machine").toArray()
    ]);

    const userMapById = new Map<number, DB.IDB_user>();
    for (const user of userTableList) {
      userMapById.set(user.id, user);
    }

    const machineMapById = new Map<number, DB.IDB_machine>();
    for (const machine of machineTableList) {
      machineMapById.set(machine.id, machine);
    }

    const serviceCallUserMap = new Map<number, DB.IDB_service_call_user[]>();
    for (const scu of serviceCallUserList) {
      if (!serviceCallUserMap.has(scu.id_service_call)) {
        serviceCallUserMap.set(scu.id_service_call, []);
      }
      serviceCallUserMap.get(scu.id_service_call)!.push(scu);
    }

    const serviceCallMachineMap = new Map<number, DB.IDB_service_call_machine[]>();
    for (const scm of serviceCallMachineList) {
      if (!serviceCallMachineMap.has(scm.id_service_call)) {
        serviceCallMachineMap.set(scm.id_service_call, []);
      }
      serviceCallMachineMap.get(scm.id_service_call)!.push(scm);
    }

    let serviceCallList = serviceCallListRaw.filter(serviceCall => {
      if (parseInt(serviceCall.enabled) == 0) {
        return false;
      }

      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        const serviceCallUsers = serviceCallUserMap.get(serviceCall.id) ?? [];

        if (idUserList) {
          const idUserListFilteredArr = serviceCallUsers.map(serviceCallUser => serviceCallUser.id_user);
          const hasAssignedUser = idUserListFilteredArr.some(id_user => idUserList.includes(id_user));
          const isCreatorIncluded = idUserList.includes(serviceCall.id_user_creator);

          if (!hasAssignedUser && !isCreatorIncluded) {
            return false;
          }
        }
      }

      if (serviceCallStatusList && !serviceCallStatusList.find(serviceCallStatus => serviceCallStatus.id == serviceCall.id_service_call_status)) {
        return false;
      }

      if (dateStart && dateEnd && (new Date(serviceCall.date_end) < new Date(dateStart) || new Date(serviceCall.date_start) > new Date(dateEnd))) {
        return false;
      }

      return true;
    });

    serviceCallList = serviceCallList.map(serviceCall => {
      const serviceCallUsers = serviceCallUserMap.get(serviceCall.id) ?? [];
      const serviceCallMachines = serviceCallMachineMap.get(serviceCall.id) ?? [];

      const userListResolved = serviceCallUsers
        .map(link => userMapById.get(link.id_user))
        .filter(user => !!user);

      const machineListResolved = serviceCallMachines
        .map(link => machineMapById.get(link.id_machine))
        .filter(machine => !!machine);

      return {
        ...serviceCall,
        _machine_list: machineListResolved.map(machine => machine.name).join(", "),
        _user_list: userListResolved.map(user => `${user.name_first ?? ""} ${user.name_last ?? ""}`.trim()).join(", "),
        id_user_arr: userListResolved.map(user => user.id)
      };
    });

    return this.idbService.join(serviceCallList, [
      { field: "id_service_call_status", table: "service_call_status" },
      { field: "id_consumer", table: "consumer" },
      { field: "id_user_creator", table: "user" },
      { field: "id_job", table: "job" },
      { field: "id_contact", table: "contact", joinType: "LEFT" }
    ]);
  }

  async serviceCall_inup(valueObj: I_ServiceCallInup, userList: DB.IDB_user[], machineList: DB.IDB_machine[]) {
    let serviceCall: DB.IDB_service_call = null;
    //
    if (!valueObj.service_call) {
      serviceCall = await this.serviceCall_create(valueObj, userList, machineList);
    }
    else {
      serviceCall = await this.serviceCall_update(valueObj, userList, machineList);
    }
    //
    return serviceCall;
  }

  async serviceCall_create(valueObj: I_ServiceCallInup, userList: DB.IDB_user[], machineList: DB.IDB_machine[]): Promise<DB.IDB_service_call> {
    let serviceCallStatusNew = await this.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.NEW);
    let userLogged = this.userSettingService.getLocalStorage("user", null, true) as DB.IDB_user;
    //
    let serviceCallArr = {
      date_start: valueObj.date_start ?? null,
      date_end: valueObj.date_end ?? null,
      id_service_call_status: valueObj.id_service_call_status ?? serviceCallStatusNew.id,
      id_consumer: valueObj.consumer.id,
      id_contact: valueObj?.contact?.id ?? null,
      id_job: valueObj.job.id,
      id_job_details: valueObj?.job_details?.id ?? null,
      id_destination: valueObj?.destination?.id ?? null,
      description: valueObj.description,
      id_user_creator: userLogged.id,
      date_create: this.dateService.date_getDateTime(new Date()),
      enabled: "1",
      to_push: "1",
    };
    let serviceCall = await this.idbService.inup<DB.IDB_service_call>("service_call", serviceCallArr);
    //
    await this.serviceCall_setUserList(serviceCall, userList);
    await this.serviceCall_setMachineList(serviceCall, machineList);
    //
    return serviceCall;
  }

  async serviceCall_update(valueObj: I_ServiceCallInup, userList: DB.IDB_user[], machineList: DB.IDB_machine[]): Promise<DB.IDB_service_call> {
    let serviceCall = await this.idbService.getItem<DB.IDB_service_call>("service_call", { id: valueObj.service_call.id, enabled: "1" });
    //
    let serviceCallArr = {
      id: serviceCall.id,
      date_start: valueObj.date_start ?? null,
      date_end: valueObj.date_end ?? null,
      id_service_call_status: valueObj.id_service_call_status ?? serviceCall.id_service_call_status,
      id_consumer: valueObj.consumer.id,
      id_contact: valueObj?.contact?.id ?? null,
      id_job: valueObj.job.id,
      id_job_details: valueObj?.job_details?.id ?? null,
      id_destination: valueObj?.destination?.id ?? null,
      description: valueObj.description,
      to_push: "1",
    };
    serviceCall = await this.idbService.inup<DB.IDB_service_call>("service_call", serviceCallArr, ["id"]);
    //
    await this.serviceCall_setUserList(serviceCall, userList);
    await this.serviceCall_setMachineList(serviceCall, machineList);
    //
    return serviceCall;
  }

  async serviceCall_delete(serviceCall: DB.IDB_service_call) {
    let serviceCallArr = {
      id: serviceCall.id,
      enabled: "0",
      to_push: "1",
    };
    serviceCall = await this.idbService.inup<DB.IDB_service_call>("service_call", serviceCallArr, ["id"]);
  }

  async serviceCall_deleteSchedulation(serviceCall: DB.IDB_service_call) {
    let serviceCallStatusNew = await this.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.NEW);
    //
    let serviceCallArr = {
      id: serviceCall.id,
      id_service_call_status: serviceCallStatusNew.id,
      date_start: null,
      date_end: null,
      to_push: "1",
    };
    serviceCall = await this.idbService.inup<DB.IDB_service_call>("service_call", serviceCallArr, ["id"]);
    //
    await this.serviceCallUser_deleteFromServiceCall(serviceCall);
  }

  async serviceCall_getMachineList(serviceCall: DB.IDB_service_call) {
    let serviceCallMachineList = await this.serviceCallMachine_getList(serviceCall);
    let serviceCallMachine_idMachineList = serviceCallMachineList.map(serviceCallMachine => serviceCallMachine.id_machine);
    let machineList = await this.machine_getList();
    //
    machineList = machineList.filter(machine => {
      if (!serviceCallMachine_idMachineList.includes(machine.id)) {
        return false;
      }
      //
      return true;
    });
    //
    return machineList;
  }

  async serviceCall_setMachineList(serviceCall: DB.IDB_service_call, machineList: DB.IDB_machine[]) {
    await this.serviceCallMachine_deleteFromServiceCall(serviceCall);
    //
    for (let machineK in machineList) {
      let machine = machineList[machineK];
      //
      let serviceCallMachine = await this.idbService.getItem<DB.IDB_service_call_machine>("service_call_machine", { id_service_call: serviceCall.id, id_machine: machine.id });
      let serviceCallMachineArr = {
        service_call: serviceCall,
        machine: machine,
        enabled: true,
      };
      //
      if (serviceCallMachine) {
        serviceCallMachineArr["service_call_machine"] = serviceCallMachine;
      }
      //
      this.serviceCallMachine_inup(serviceCallMachineArr);
    }
  }

  async serviceCall_getUserList(serviceCall: DB.IDB_service_call) {
    let serviceCallUserList = await this.serviceCallUser_getList(serviceCall);
    let serviceCallUser_idUserList = serviceCallUserList.map(serviceCallUser => serviceCallUser.id_user);
    let userList = await this.user_getList();
    //
    userList = userList.filter(user => {
      if (!serviceCallUser_idUserList.includes(user.id)) {
        return false;
      }
      //
      return true;
    });
    //
    return userList;
  }

  async serviceCall_setUserList(serviceCall: DB.IDB_service_call, userList: DB.IDB_user[]) {
    await this.serviceCallUser_deleteFromServiceCall(serviceCall);
    //
    for (let userK in userList) {
      let user = userList[userK];
      //
      let serviceCallUser = await this.idbService.getItem<DB.IDB_service_call_user>("service_call_user", { id_service_call: serviceCall.id, id_user: user.id });
      let serviceCallUserArr = {
        service_call: serviceCall,
        user: user,
        enabled: true,
      };
      //
      if (serviceCallUser) {
        serviceCallUserArr["service_call_user"] = serviceCallUser;
      }
      //
      this.serviceCallUser_inup(serviceCallUserArr);
    }
  }

  serviceCall_getWorkHours(serviceCall: DB.IDB_service_call) {
    let serviceCallWorkHours = differenceInMinutes(new Date(serviceCall.date_end), new Date(serviceCall.date_start)) / 60;
    //
    return serviceCallWorkHours;
  }

  async serviceCall_setDate(serviceCall: DB.IDB_service_call, dateStart, dateEnd) {
    let serviceCallOld = await this.serviceCall_getFromId(serviceCall.id);
    //
    if (dateEnd == null) {
      let serviceCall_workMinutes = this.serviceCall_getHours(serviceCallOld) * 60;
      dateEnd = this.dateService.date_getDateTime(addMinutes(new Date(dateStart), serviceCall_workMinutes));
    }
    //
    let serviceCallArr = {
      id: serviceCall.id,
      date_start: this.dateService.date_getDateTime(new Date(dateStart)),
      date_end: this.dateService.date_getDateTime(new Date(dateEnd)),
      to_push: "1",
    };
    serviceCall = await this.idbService.inup<DB.IDB_service_call>("service_call", serviceCallArr, ["id"]);
  }

  serviceCall_getHours(serviceCall: DB.IDB_service_call) {
    let serviceCallHours = differenceInMinutes(new Date(serviceCall.date_end), new Date(serviceCall.date_start)) / 60;
    //
    return serviceCallHours;
  }

  serviceCall_getHoursFromList(serviceCallList: DB.IDB_service_call[]) {
    let serviceCallWorkHoursTot = 0;
    //
    for (let serviceCallK in serviceCallList) {
      let serviceCall = serviceCallList[serviceCallK];
      //
      serviceCallWorkHoursTot += this.serviceCall_getHours(serviceCall);
    }
    //
    return serviceCallWorkHoursTot;
  }

  //##########################################################################################
  // SERVICE_CALL_MACHINE ###############################################################
  //##########################################################################################

  async serviceCallMachine_getFromId(id: number): Promise<DB.IDB_service_call_machine> {
    let serviceCallMachine = await this.idbService.getItem<DB.IDB_service_call_machine>("service_call_machine", { id: id });
    //
    return serviceCallMachine;
  }

  async serviceCallMachine_getList(serviceCall?: DB.IDB_service_call) {
    let serviceCallMachineList = await this.idbService.idb.table<DB.IDB_service_call_machine>("service_call_machine").toArray();
    serviceCallMachineList = serviceCallMachineList.filter(serviceCallMachine => {
      //
      //enabled
      if (parseInt(serviceCallMachine.enabled) == 0) {
        return false;
      }
      //
      //id_service_call
      if (serviceCall && serviceCall.id != serviceCallMachine.id_service_call) {
        return false;
      }
      //
      return true;
    });
    //
    this.idbService.join(serviceCallMachineList, [
      { field: "id_service_call", table: "service_call" },
      { field: "id_machine", table: "machine" }
    ]);
    //
    return serviceCallMachineList;
  }

  async serviceCallMachine_inup(valueObj: I_ServiceCallMachineInup) {
    if (!valueObj.service_call_machine) {
      await this.serviceCallMachine_create(valueObj);
    }
    else {
      await this.serviceCallMachine_update(valueObj);
    }
  }

  async serviceCallMachine_create(valueObj: I_ServiceCallMachineInup): Promise<DB.IDB_service_call_machine> {
    let serviceCallMachineArr = {
      id_service_call: valueObj.service_call.id,
      id_machine: valueObj.machine.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceCallMachine = await this.idbService.inup<DB.IDB_service_call_machine>("service_call_machine", serviceCallMachineArr);
    //
    return serviceCallMachine;
  }

  async serviceCallMachine_update(valueObj: I_ServiceCallMachineInup): Promise<DB.IDB_service_call_machine> {
    let serviceCallMachine = await this.idbService.getItem<DB.IDB_service_call_machine>("service_call_machine", { id: valueObj.service_call_machine.id });
    //
    let serviceCallMachineArr = {
      id: serviceCallMachine.id,
      id_service_call: valueObj.service_call.id,
      id_machine: valueObj.machine.id,
      to_push: "1",
    };
    //
    if (valueObj.enabled) {
      serviceCallMachineArr["enabled"] = valueObj.enabled ? "1" : "0";
    }
    //
    serviceCallMachine = await this.idbService.inup<DB.IDB_service_call_machine>("service_call_machine", serviceCallMachineArr, ["id"]);
    //
    return serviceCallMachine;
  }

  async serviceCallMachine_delete(serviceCallMachine: DB.IDB_service_call_machine) {
    let serviceCallMachineArr = {
      id: serviceCallMachine.id,
      enabled: "0",
      to_push: "1",
    };
    serviceCallMachine = await this.idbService.inup<DB.IDB_service_call_machine>("service_call_machine", serviceCallMachineArr, ["id"]);
  }

  async serviceCallMachine_deleteFromServiceCall(serviceCall: DB.IDB_service_call) {
    let serviceCallMachineList = await this.serviceCallMachine_getList(serviceCall);
    for (let serviceCallMachineK in serviceCallMachineList) {
      let serviceCallMachine = serviceCallMachineList[serviceCallMachineK];
      //
      this.serviceCallMachine_delete(serviceCallMachine);
    }
  }

  //##########################################################################################
  // SERVICE_CALL_USER ###############################################################
  //##########################################################################################

  async serviceCallUser_getFromId(id: number): Promise<DB.IDB_service_call_user> {
    let serviceCallUser = await this.idbService.getItem<DB.IDB_service_call_user>("service_call_user", { id: id });
    //
    return serviceCallUser;
  }

  async serviceCallUser_getList(serviceCall?: DB.IDB_service_call) {
    let serviceCallUserList = await this.idbService.idb.table<DB.IDB_service_call_user>("service_call_user").toArray();
    serviceCallUserList = serviceCallUserList.filter(serviceCallUser => {
      //
      //enabled
      if (parseInt(serviceCallUser.enabled) == 0) {
        return false;
      }
      //
      //id_service_call
      if (serviceCall && serviceCall.id != serviceCallUser.id_service_call) {
        return false;
      }
      //
      return true;
    });
    //
    this.idbService.join(serviceCallUserList, [
      { field: "id_service_call", table: "service_call" },
      { field: "id_user", table: "user" }
    ]);
    //
    return serviceCallUserList;
  }

  async serviceCallUser_inup(valueObj: I_ServiceCallUserInup) {
    if (!valueObj.service_call_user) {
      await this.serviceCallUser_create(valueObj);
    }
    else {
      await this.serviceCallUser_update(valueObj);
    }
  }

  async serviceCallUser_create(valueObj: I_ServiceCallUserInup): Promise<DB.IDB_service_call_user> {
    let serviceCallUserArr = {
      id_service_call: valueObj.service_call.id,
      id_user: valueObj.user.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceCallUser = await this.idbService.inup<DB.IDB_service_call_user>("service_call_user", serviceCallUserArr);
    //
    return serviceCallUser;
  }

  async serviceCallUser_update(valueObj: I_ServiceCallUserInup): Promise<DB.IDB_service_call_user> {
    let serviceCallUser = await this.idbService.getItem<DB.IDB_service_call_user>("service_call_user", { id: valueObj.service_call_user.id });
    //
    let serviceCallUserArr = {
      id: serviceCallUser.id,
      id_service_call: valueObj.service_call.id,
      id_user: valueObj.user.id,
      to_push: "1",
    };
    //
    if (valueObj.enabled) {
      serviceCallUserArr["enabled"] = valueObj.enabled ? "1" : "0";
    }
    //
    serviceCallUser = await this.idbService.inup<DB.IDB_service_call_user>("service_call_user", serviceCallUserArr, ["id"]);
    //
    return serviceCallUser;
  }

  async serviceCallUser_delete(serviceCallUser: DB.IDB_service_call_user) {
    let serviceCallUserArr = {
      id: serviceCallUser.id,
      enabled: "0",
      to_push: "1",
    };
    serviceCallUser = await this.idbService.inup<DB.IDB_service_call_user>("service_call_user", serviceCallUserArr, ["id"]);
  }

  async serviceCallUser_deleteFromServiceCall(serviceCall: DB.IDB_service_call) {
    let serviceCallUserList = await this.serviceCallUser_getList(serviceCall);
    for (let serviceCallUserK in serviceCallUserList) {
      let serviceCallUser = serviceCallUserList[serviceCallUserK];
      //
      this.serviceCallUser_delete(serviceCallUser);
    }
  }

  //##########################################################################################
  // SERVICE_EXTRA ###########################################################################
  //##########################################################################################

  async serviceExtra_getFromId(id: number): Promise<DB.IDB_service_extra> {
    let serviceExtra = await this.idbService.getItem<DB.IDB_service_extra>("service_extra", { id: id });
    //
    return serviceExtra;
  }

  async serviceExtra_getList(userList: DB.IDB_user[], serviceTask?: DB.IDB_service_task, serviceTypologyCode?: string, isRefund?: boolean, dateStart?, dateEnd?) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    let idUserSet = idUserList ? new Set(idUserList) : null;
    //
    let idServiceTaskList = null;
    let serviceTaskList = await this.serviceTask_getList(userList, dateStart, dateEnd, false);
    if (serviceTaskList !== null) {
      idServiceTaskList = serviceTaskList.map(serviceTask => serviceTask.id);
    }
    let idServiceTaskSet = idServiceTaskList ? new Set(idServiceTaskList) : null;
    //
    let idServiceExtraTypologyList = null;
    if (isRefund !== null && isRefund !== undefined) {
      let serviceExtraTypologyList = await this.serviceExtraTypology_getList(isRefund);
      idServiceExtraTypologyList = serviceExtraTypologyList.map(serviceExtraTypology => serviceExtraTypology.id);
    }
    let idServiceExtraTypologySet = idServiceExtraTypologyList ? new Set(idServiceExtraTypologyList) : null;
    //
    let serviceExtraList = await this.idbService.idb.table<DB.IDB_service_extra>("service_extra").toArray();
    await this.idbService.join(serviceExtraList, [
      { field: "id_service_typology", table: "service_typology" },
    ]);
    serviceExtraList = serviceExtraList.filter(serviceExtra => {
      //
      //enabled
      if (parseInt(serviceExtra.enabled) == 0) {
        return false;
      }
      //
      //service_typology_code
      if (serviceTypologyCode !== null && serviceTypologyCode !== undefined && serviceExtra["service_typology"] !== undefined && serviceTypologyCode != serviceExtra["service_typology"]["code"]) {
        return false;
      }
      //
      //date_start & date_end
      if (dateStart && dateEnd && (new Date(serviceExtra.date_end) < new Date(dateStart) || new Date(serviceExtra.date_start) > new Date(dateEnd))) {
        return false;
      }
      //
      //is_refund
      if (idServiceExtraTypologySet && !idServiceExtraTypologySet.has(serviceExtra.id_service_extra_typology)) {
        return false;
      }
      //
      //id_service_task filter
      if (serviceTask && serviceTask.id != serviceExtra.id_service_task) {
        return false;
      }
      //
      //id_service_task (estraggo tutti gli extra del task a cui l'utente è associato, così da mostrare anche gli extra degli altri utenti)
      if (idServiceTaskSet && idServiceTaskSet.has(serviceExtra.id_service_task)) {
        return true;
      }
      //
      //id_user (nascondo gli extra fatti da altri e non all'interno dei task associati all'utente)
      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        if (idUserSet && !idUserSet.has(serviceExtra.id_user)) {
          return false;
        }
      }
      //
      return true;
    });
    //
    return serviceExtraList;
  }

  async serviceExtra_inup(user: DB.IDB_user, valueObj: I_ServiceExtraInup) {
    let serviceExtra: DB.IDB_service_extra;
    //
    if (!valueObj.service_extra) {
      serviceExtra = await this.serviceExtra_create(user, valueObj, valueObj["service_task"] ?? null);
    }
    else {
      serviceExtra = await this.serviceExtra_update(user, valueObj);
    }
    //
    return serviceExtra;
  }

  async serviceExtra_create(user: DB.IDB_user, valueObj: I_ServiceExtraInup, serviceTask?: DB.IDB_service_task): Promise<DB.IDB_service_extra> {
    if (valueObj.is_external == "1" && !serviceTask) {
      //TODO - Dare errore (non posso fare un extra esterno senza task
    }
    //
    let serviceExtraArr = {
      id_service_task: valueObj.is_external == "1" ? serviceTask.id : null,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      value: valueObj.value,
      id_job: valueObj.job ? valueObj.job.id : null,
      id_service_extra_typology: valueObj.service_extra_typology.id,
      id_service_typology: valueObj.service_typology.id,
      notes: valueObj.notes,
      id_user: user.id,
      is_external: valueObj.is_external,
      enabled: "1",
      to_push: "1",
    };
    let serviceExtra = await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr);
    //
    return serviceExtra;
  }

  async serviceExtra_update(user: DB.IDB_user, valueObj: I_ServiceExtraInup): Promise<DB.IDB_service_extra> {
    let serviceExtra = await this.idbService.getItem<DB.IDB_service_extra>("service_extra", { id: valueObj.service_extra.id, enabled: "1" });
    //
    let serviceExtraArr = {
      id: serviceExtra.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      date_end: this.dateService.date_getDateTime(new Date(valueObj.date_end)),
      value: valueObj.value,
      id_job: valueObj.job ? valueObj.job.id : null,
      id_service_extra_typology: valueObj.service_extra_typology.id,
      id_service_typology: valueObj.service_typology.id,
      notes: valueObj.notes,
      id_user: user.id,
      is_external: valueObj.is_external,
      to_push: "1",
    };
    serviceExtra = await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr, ["id"]);
    //
    return serviceExtra;
  }

  async serviceExtra_delete(serviceExtra: DB.IDB_service_extra) {
    let serviceExtraArr = {
      id: serviceExtra.id,
      enabled: "0",
      to_push: "1",
    };
    await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr, ["id"]);
  }

  async serviceExtra_deleteFromServiceTask(serviceTask: DB.IDB_service_task) {
    let serviceExtraList = await this.serviceExtra_getList(null, serviceTask);
    for (let serviceExtraK in serviceExtraList) {
      let serviceExtra = serviceExtraList[serviceExtraK];
      //
      this.serviceExtra_delete(serviceExtra);
    }
  }

  async serviceExtra_getListFromServiceExtraTypologyList(serviceExtraTypologList: DB.IDB_service_extra_typology[], serviceTypologyCode?: string, serviceTask?: DB.IDB_service_task, dateStart?, dateEnd?) {
    let serviceExtraList = await this.serviceExtra_getList(this.getUserList(), serviceTask, serviceTypologyCode, null, dateStart, dateEnd);
    //
    let serviceExtraValidList: DB.IDB_service_extra[] = [];
    for (let serviceExtraK in serviceExtraList) {
      let serviceExtra = serviceExtraList[serviceExtraK];
      //
      for (let serviceExtraTypologyK in serviceExtraTypologList) {
        let serviceExtraTypology = serviceExtraTypologList[serviceExtraTypologyK];
        //
        if (serviceExtra.id_service_extra_typology == serviceExtraTypology.id) {
          serviceExtraValidList.push(serviceExtra);
          //
          break;
        }
      }
    }
    //
    return serviceExtraValidList;
  }

  async serviceExtra_getHours(serviceExtra: DB.IDB_service_extra, serviceTypologyCode: string) {
    let serviceExtraHours = 0;
    //
    if (serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      serviceExtraHours = differenceInMinutes(new Date(serviceExtra.date_end), new Date(serviceExtra.date_start)) / 60;
    }
    else {
      let serviceExtraTypology = await this.serviceExtraTypology_getFromId(serviceExtra.id_service_extra_typology);
      //
      if (serviceExtraTypology.code == "ROL") {
        serviceExtraHours += parseInt(serviceExtra.value);
      }
      else if ((serviceExtraTypology.code == "HOLIDAY" || serviceExtraTypology.code == "DISEASE" || serviceExtraTypology.code == "MATERNITY") && serviceExtra.value == "1") {
        serviceExtraHours += 8;
      }
    }
    //
    return serviceExtraHours;
  }

  async serviceExtra_getHoursFromList(serviceExtraList: DB.IDB_service_extra[], serviceTypologyCode) {
    let serviceExtraHoursTot = 0;
    //
    for (let serviceExtraK in serviceExtraList) {
      let serviceExtra = serviceExtraList[serviceExtraK];
      //
      serviceExtraHoursTot += await this.serviceExtra_getHours(serviceExtra, serviceTypologyCode);
    }
    //
    return serviceExtraHoursTot;
  }

  //##########################################################################################
  // SERVICE_EXTRA_TYPOLOGY ##################################################################
  //##########################################################################################

  async serviceExtraTypology_getFromId(id: number): Promise<DB.IDB_service_extra_typology> {
    let serviceExtraTypology = await this.idbService.getItem<DB.IDB_service_extra_typology>("service_extra_typology", { id: id });
    //
    return serviceExtraTypology;
  }

  async serviceExtraTypology_getList(isRefund?: boolean) {
    let serviceExtraTypologyArr = {
      enabled: "1",
    };
    //
    if (isRefund !== null && isRefund !== undefined) {
      serviceExtraTypologyArr["is_refund"] = isRefund ? "1" : "0";
    }
    //
    let serviceExtraTypologyList = this.idbService.getItems<DB.IDB_service_extra_typology>("service_extra_typology", serviceExtraTypologyArr);
    //
    return serviceExtraTypologyList;
  }

  async serviceExtraTypology_getFromCode(code: string) {
    let serviceExtraTypology = this.idbService.getItem<DB.IDB_service_extra_typology>("service_extra_typology", { code: code });
    //
    return serviceExtraTypology;
  }










  //
  //TODO - Le funzioni qui sotto sono da verificare
  //


  async setServiceExtra(user: DB.IDB_user, valueObj: I_ServiceTaskInup, serviceTask: DB.IDB_service_task) {
    //
    //TODO - Sistemare
    if (valueObj.extraLunch) {
      let serviceExtraTypology = await this.idbService.getItem<DB.IDB_service_extra_typology>("service_extra_typology", { code: "LUNCH", enabled: "1" });
      //
      let serviceExtraArr = {
        id_service_task: serviceTask.id,
        id_service_extra_typology: serviceExtraTypology.id,
        value: valueObj.extraLunch,
        date_start: valueObj.date_start,
        date_end: valueObj.date_end,
        id_user: user.id,
        to_push: "1",
      }
      await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr, ["id_service_task", "id_service_extra_typology", "date_start"]);
    }
    //
    //TODO - Sistemare
    if (valueObj.extraDinner) {
      let serviceExtraTypology = await this.idbService.getItem<DB.IDB_service_extra_typology>("service_extra_typology", { code: "DINNER", enabled: "1" });
      //
      let serviceExtraArr = {
        id_service_task: serviceTask.id,
        id_service_extra_typology: serviceExtraTypology.id,
        value: valueObj.extraDinner,
        date_start: valueObj.date_start,
        date_end: valueObj.date_end,
        id_user: user.id,
        to_push: "1",
      }
      await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr, ["id_service_task", "id_service_extra_typology", "date_start"]);
    }
    //
    //TODO - Sistemare
    if (valueObj.extraNight) {
      let serviceExtraTypology = await this.idbService.getItem<DB.IDB_service_extra_typology>("service_extra_typology", { code: "NIGHT", enabled: "1" });
      //
      let serviceExtraArr = {
        id_service_task: serviceTask.id,
        id_service_extra_typology: serviceExtraTypology.id,
        value: valueObj.extraNight,
        date_start: valueObj.date_start,
        date_end: valueObj.date_end,
        id_user: user.id,
        to_push: "1",
      }
      await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr, ["id_service_task", "id_service_extra_typology", "date_start"]);
    }
    //
    //TODO - Sistemare
    if (valueObj.extraTripKm) {
      let serviceExtraTypology = await this.idbService.getItem<DB.IDB_service_extra_typology>("service_extra_typology", { code: "TRIP_KM", enabled: "1" });
      //
      let serviceExtraArr = {
        id_service_task: serviceTask.id,
        id_service_extra_typology: serviceExtraTypology.id,
        value: valueObj.extraTripKm,
        date_start: valueObj.date_start,
        date_end: valueObj.date_end,
        id_user: user.id,
        to_push: "1",
      }
      await this.idbService.inup<DB.IDB_service_extra>("service_extra", serviceExtraArr, ["id_service_task", "id_service_extra_typology", "date_start"]);
    }
  }

  async serviceExtraSetDate(serviceExtra: DB.IDB_service_extra, dateStart) {
    let servicTaskExtraArr = {
      id: serviceExtra.id,
      date_start: this.dateService.date_getDateTime(new Date(dateStart)),
      to_push: "1",
    };
    await this.idbService.inup<DB.IDB_service_extra>("service_extra", servicTaskExtraArr, ["id"]);
  }

  async serviceExtraIsLastInDay(serviceTask: DB.IDB_service_task, dateStart) {
    let dateStart_dayRange = this.dateService.date_getDayRange(dateStart);
    //
    let dayServiceOperationList = await this.serviceOperation_getList(this.getUserList(), serviceTask, null, dateStart_dayRange[0], dateStart_dayRange[1]);
    let dayServicTaskExtraList = await this.serviceExtra_getList(this.getUserList(), serviceTask, null, true, dateStart_dayRange[0], dateStart_dayRange[1])
    //
    if (dayServiceOperationList.length == 1 && dayServicTaskExtraList.length > 0) {
      return true;
    }
    //
    return false;
  }














  //##########################################################################################
  // SERVICE_TASK_PRODUCT ###########################################################################
  //##########################################################################################

  async serviceTaskProduct_getFromId(id: number): Promise<DB.IDB_service_task_product> {
    let serviceTaskProduct = await this.idbService.getItem<DB.IDB_service_task_product>("service_task_product", { id: id });
    //
    return serviceTaskProduct;
  }

  async serviceTaskProduct_getList(userList: DB.IDB_user[], serviceTask?: DB.IDB_service_task, dateStart?, dateEnd?) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    let idUserSet = idUserList ? new Set(idUserList) : null;
    //
    let idServiceTaskList = null;
    let serviceTaskList = await this.serviceTask_getList(userList, dateStart, dateEnd, false);
    if (serviceTaskList !== null) {
      idServiceTaskList = serviceTaskList.map(serviceTask => serviceTask.id);
    }
    let idServiceTaskSet = idServiceTaskList ? new Set(idServiceTaskList) : null;
    //
    let serviceTaskProductList = await this.idbService.idb.table<DB.IDB_service_task_product>("service_task_product").toArray();
    serviceTaskProductList = serviceTaskProductList.filter(serviceTaskProduct => {
      //
      //enabled
      if (parseInt(serviceTaskProduct.enabled) == 0) {
        return false;
      }
      //
      //id_service_task
      if (serviceTask && serviceTask.id != serviceTaskProduct.id_service_task) {
        return false;
      }
      //
      //date_start & date_end
      if (dateStart && dateEnd && (new Date(serviceTaskProduct.date_start) < new Date(dateStart) || new Date(serviceTaskProduct.date_start) > new Date(dateEnd))) {
        return false;
      }
      //
      //id_service_task (estraggo tutti i prodotti del task a cui l'utente è associato, così da mostrare anche i prodotti degli altri utenti)
      if (idServiceTaskSet && idServiceTaskSet.has(serviceTaskProduct.id_service_task)) {
        return true;
      }
      //
      //id_user (nascondo i prodotti fatti da altri e non all'interno dei task associati all'utente)
      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        if (idUserSet && !idUserSet.has(serviceTaskProduct.id_user)) {
          return false;
        }
      }
      //
      return true;
    });
    //
    return serviceTaskProductList;
  }

  async serviceTaskProduct_inup(user: DB.IDB_user, valueObj: I_ServiceTaskProductInup) {
    if (!valueObj.service_task_product) {
      await this.serviceTaskProduct_create(user, valueObj);
    }
    else {
      await this.serviceTaskProduct_update(user, valueObj);
    }
  }

  async serviceTaskProduct_create(user: DB.IDB_user, valueObj: I_ServiceTaskProductInup): Promise<DB.IDB_service_task_product> {
    let serviceTaskProductArr = {
      id_service_task: valueObj.service_task.id,
      id_product: valueObj.product.id,
      value: valueObj.value,
      id_user: user.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      enabled: "1",
      to_push: "1",
    };
    let serviceTaskProduct = await this.idbService.inup<DB.IDB_service_task_product>("service_task_product", serviceTaskProductArr);
    //
    return serviceTaskProduct;
  }

  async serviceTaskProduct_update(user: DB.IDB_user, valueObj: I_ServiceTaskProductInup): Promise<DB.IDB_service_task_product> {
    let serviceTaskProduct = await this.idbService.getItem<DB.IDB_service_task_product>("service_task_product", { id: valueObj.service_task_product.id, enabled: "1" });
    //
    let serviceTaskProductArr = {
      id: serviceTaskProduct.id,
      id_service_task: valueObj.service_task.id,
      id_product: valueObj.product.id,
      value: valueObj.value,
      id_user: user.id,
      date_start: this.dateService.date_getDateTime(new Date(valueObj.date_start)),
      to_push: "1",
    };
    serviceTaskProduct = await this.idbService.inup<DB.IDB_service_task_product>("service_task_product", serviceTaskProductArr, ["id"]);
    //
    return serviceTaskProduct;
  }

  async serviceTaskProduct_delete(serviceTaskProduct: DB.IDB_service_task_product) {
    let serviceTaskProductArr = {
      id: serviceTaskProduct.id,
      enabled: "0",
      to_push: "1",
    };
    serviceTaskProduct = await this.idbService.inup<DB.IDB_service_task_product>("service_task_product", serviceTaskProductArr, ["id"]);
  }

  async serviceTaskProduct_deleteFromServiceTask(serviceTask: DB.IDB_service_task) {
    let serviceTaskProductList = await this.serviceTaskProduct_getList(null, serviceTask);
    for (let serviceTaskProductK in serviceTaskProductList) {
      let serviceTaskProduct = serviceTaskProductList[serviceTaskProductK];
      //
      this.serviceTaskProduct_delete(serviceTaskProduct);
    }
  }

  //##########################################################################################
  // JOB_DETAILS_ACTION ######################################################################
  //##########################################################################################

  async jobDetailsAction_getFromId(id: number) {
    let jobDetailsAction = await this.idbService.getItem<DB.IDB_job_details_action>("job_details_action", { id: id/*, enabled: "1"*/ });
    //
    return jobDetailsAction;
  }

  async jobDetailsAction_getList() {
    let jobDetailsActionList = await this.idbService.getItems<DB.IDB_job_details_action>("job_details_action"/*, { enabled: "1" }*/);
    //
    return jobDetailsActionList;
  }

  //##########################################################################################
  // JOB_DETAILS #############################################################################
  //##########################################################################################

  async jobDetails_getFromId(id: number): Promise<DB.IDB_job_details> {
    let jobDetails = await this.idbService.getItem<DB.IDB_job_details>("job_details", { id: id/*, enabled: "1"*/ });
    //
    return jobDetails;
  }

  async jobDetails_getList() {
    let jobDetailsList = await this.idbService.getItems<DB.IDB_job_details>("job_details"/*, { enabled: "1" }*/);
    //
    return jobDetailsList;
  }

  //##########################################################################################
  // JOB #####################################################################################
  //##########################################################################################

  async job_getFromId(id: number): Promise<DB.IDB_job> {
    let job = await this.idbService.getItem<DB.IDB_job>("job", { id: id/*, enabled: "1"*/ });
    //
    return job;
  }

  async job_getList(consumer?, dateStart?, dateEnd?) {
    let jobList = []
    //
    if (dateStart && dateEnd) {
      //
      //TODO - Filtrare per cliente
      //
      let jobIdList = [];
      let serviceOperationList = await this.serviceOperation_getList(this.getUserList(), null, null, dateStart, dateEnd);
      //
      for (let serviceOperationK in serviceOperationList) {
        let serviceOperation = serviceOperationList[serviceOperationK];
        //
        let jobDetails = await this.jobDetails_getFromId(serviceOperation.id_job_details);
        let job = await this.job_getFromId(jobDetails.id_job);
        //
        if (!jobIdList[job.id]) {
          jobIdList[job.id] = true;
          jobList.push(job);
        }
      }
    }
    else {
      let jobArr = {
        enabled: "1"
      };
      //
      if (consumer) {
        jobArr["id_consumer"] = consumer.id;
      }
      //
      jobList = await this.idbService.getItems<DB.IDB_job>("job", jobArr);
      //
      this.idbService.join(jobList, [
        { field: "id_consumer", table: "consumer" },
        { field: "id_job_typology", joinType: "LEFT", table: "job_typology" },
      ]);
    }
    //
    return jobList;
  }

  //##########################################################################################
  // SERVICE_TASK_REPORT_STATUS ##############################################################
  //##########################################################################################

  async serviceTaskReportStatus_getFromId(id: number) {
    let serviceTaskReportStatus = await this.idbService.getItem<DB.IDB_service_task_report_status>("service_task_report_status", { id: id });
    //
    return serviceTaskReportStatus;
  }

  async serviceTaskReportStatus_getFromCode(code: string) {
    let serviceTaskReportStatus = await this.idbService.getItem<DB.IDB_service_task_report_status>("service_task_report_status", { code: code });
    //
    return serviceTaskReportStatus;
  }

  async serviceTaskReportStatus_getList() {
    let serviceTaskReportStatusList = await this.idbService.getItems<DB.IDB_service_task_report_status>("service_task_report_status", { enabled: "1" }, [{ field: "priority", direction: "ASC" }]);
    //
    return serviceTaskReportStatusList;
  }

  //##########################################################################################
  // SERVICE_TASK_REPORT #####################################################################
  //##########################################################################################

  async serviceTaskReport_getFromId(id: number): Promise<DB.IDB_service_task_report> {
    let serviceTaskReport = await this.idbService.getItem<DB.IDB_service_task_report>("service_task_report", { id: id });
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_getFromIdr(idr: number): Promise<DB.IDB_service_task_report> {
    let serviceTaskReport = await this.idbService.getItem<DB.IDB_service_task_report>("service_task_report", { idr: idr });
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_getList(userList: DB.IDB_user[]) {
    let userGroup = this.userSettingService.getLocalStorage("user_group", null, true) as DB.IDB_user_group;
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    //
    let serviceTaskReportList = await this.idbService.idb.table<DB.IDB_service_task_report>("service_task_report").orderBy("date_create").reverse().toArray();
    serviceTaskReportList = serviceTaskReportList.filter(serviceTrip => {
      //
      //enabled
      if (parseInt(serviceTrip.enabled) == 0) {
        return false;
      }
      //
      //id_user
      if (userGroup.code != "ALL" && userGroup.code != "SUPER") {
        if (idUserList && !idUserList.includes(serviceTrip.id_user)) {
          return false;
        }
      }
      //
      return true;
    });
    //
    return serviceTaskReportList;
  }

  async serviceTaskReport_getFromServiceTask(serviceTask: DB.IDB_service_task): Promise<DB.IDB_service_task_report> {
    let serviceTaskReport = await this.idbService.getItem<DB.IDB_service_task_report>("service_task_report", { id_service_task: serviceTask.id, enabled: "1" });
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_getOrCreateFromServiceTask(user: DB.IDB_user, serviceTask: DB.IDB_service_task): Promise<DB.IDB_service_task_report> {
    let serviceTaskReport = await this.serviceTaskReport_getFromServiceTask(serviceTask);
    //
    if (!serviceTaskReport) {
      serviceTaskReport = await this.serviceTaskReport_create(user, serviceTask);
    }
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_create(user: DB.IDB_user, serviceTask: DB.IDB_service_task): Promise<DB.IDB_service_task_report> {
    let serviceTaskReportStatusNew = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.NEW);
    //
    let serviceTaskReportArr = {
      id_service_task: serviceTask.id,
      code: await this.serviceTaskReport_generateCode(user),
      id_user: user.id,
      date_create: this.dateService.date_getDateTime(new Date()),
      id_service_task_report_status: serviceTaskReportStatusNew.id,
      enabled: "1",
      to_push: "1",
    };
    let serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id_service_task"]);
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_generateCode(user: DB.IDB_user,) {
    let serviceTaskReportCode = (user.ext_code ?? "") + "_" + formatDate(new Date(), "yyMMdd_HHmmss", "en-EN");
    //
    return serviceTaskReportCode;
  }

  async serviceTaskReport_getJsonField(serviceTaskReport: DB.IDB_service_task_report, field) {
    let serviceTaskReportJsonObj = JSON.parse(serviceTaskReport.json ?? "{}");
    //
    return serviceTaskReportJsonObj[field] ?? null;
  }

  async serviceTaskReport_setJsonField(serviceTaskReport: DB.IDB_service_task_report, field, value) {
    let serviceTaskReportJsonObj = JSON.parse(serviceTaskReport.json ?? "{}");
    //
    serviceTaskReportJsonObj[field] = value;
    //
    let serviceTaskReportArr = {
      id: serviceTaskReport.id,
      json: JSON.stringify(serviceTaskReportJsonObj),
      to_push: "1",
    };
    await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
  }

  async serviceTaskReport_setSent(serviceTaskReport: DB.IDB_service_task_report) {
    let serviceTaskReportStatusSigned = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SIGNED);
    //
    if (serviceTaskReport.id_service_task_report_status != serviceTaskReportStatusSigned.id) {
      let serviceTaskReportStatusSent = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SENT);
      //
      let serviceTaskReportArr = {
        id: serviceTaskReport.id,
        id_service_task_report_status: serviceTaskReportStatusSent.id,
        date_sent: this.dateService.date_getDateTime(new Date()),
        to_push: "1",
      };
      await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
    }
  }

  async serviceTaskReport_isSent(serviceTaskReport: DB.IDB_service_task_report) {
    let serviceTaskReportStatusSent = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SENT);
    //
    if (serviceTaskReport.id_service_task_report_status == serviceTaskReportStatusSent.id) {
      return true;
    }
    //
    return false;
  }

  async serviceTaskReport_setViewed(serviceTaskReport: DB.IDB_service_task_report) {
    let serviceTaskReportStatusViewed = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.VIEWED);
    //
    let serviceTaskReportArr = {
      id: serviceTaskReport.id,
      id_service_task_report_status: serviceTaskReportStatusViewed.id,
      to_push: "1",
    };
    serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_setSignature(serviceTaskReport: DB.IDB_service_task_report, signature: string) {
    let serviceTaskReportStatusSigned = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SIGNED);
    //
    let serviceTaskReportArr = {
      id: serviceTaskReport.id,
      id_service_task_report_status: serviceTaskReportStatusSigned.id,
      signature: signature,
      date_signed: this.dateService.date_getDateTime(new Date()),
      to_push: "1",
    };
    serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_removeSignature(serviceTaskReport: DB.IDB_service_task_report) {
    let serviceTaskReportStatusNew = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.NEW);
    //
    let serviceTaskReportArr = {
      id: serviceTaskReport.id,
      id_service_task_report_status: serviceTaskReportStatusNew.id,
      signature: null,
      date_signed: null,
      to_push: "1",
    };
    serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_isSigned(serviceTaskReport: DB.IDB_service_task_report) {
    let serviceTaskReportStatusSigned = await this.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SIGNED);
    //
    if (serviceTaskReport.id_service_task_report_status == serviceTaskReportStatusSigned.id) {
      return true;
    }
    //
    return false;
  }

  async serviceTaskReport_setHtml(serviceTaskReport: DB.IDB_service_task_report, html: string) {
    let serviceTaskReportArr = {
      id: serviceTaskReport.id,
      html: html,
      to_push: "1",
    };
    serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
    //
    return serviceTaskReport;
  }

  async serviceTaskReport_delete(serviceTaskReport: DB.IDB_service_task_report) {
    let serviceTaskReportArr = {
      id: serviceTaskReport.id,
      enabled: "0",
      to_push: "1",
    };
    serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", serviceTaskReportArr, ["id"]);
  }

  async serviceTaskReport_deleteFromServiceTask(serviceTask: DB.IDB_service_task) {
    let serviceTaskReport = await this.serviceTaskReport_getFromServiceTask(serviceTask);
    this.serviceTaskReport_delete(serviceTaskReport);
  }

  //##########################################################################################
  // SERVICE_TASK_REPORT_MAIL ################################################################
  //##########################################################################################

  async serviceTaskReportMail_saveSent(serviceTaskReport: DB.IDB_service_task_report, contactList: DB.IDB_contact[]) {
    let userLogged = this.userSettingService.getLocalStorage("user", null, true) as DB.IDB_user;
    let date_sent = this.dateService.date_getDateTime(new Date());
    //
    for (let contactK in contactList) {
      let contact = contactList[contactK];
      //
      let serviceTaskReportMailArr = {
        id_service_task_report: serviceTaskReport.id,
        id_contact: contact.id,
        date_sent: date_sent,
        id_user: userLogged.id,
        enabled: "1",
        to_push: "1",
      };
      let serviceTaskReportMail = await this.idbService.inup<DB.IDB_service_task_report_mail>("service_task_report_mail", serviceTaskReportMailArr);
    }
  }

  async serviceTaskReportMail_getList(serviceTaskReport?: DB.IDB_service_task_report) {
    let serviceTaskReportMailList = [];
    //
    if (serviceTaskReport) {
      let serviceTaskReportMailArr = {
        enabled: "1",
        id_service_task_report: serviceTaskReport.id,
      };
      //
      serviceTaskReportMailList = await this.idbService.getItems<DB.IDB_service_task_report_mail>("service_task_report_mail", serviceTaskReportMailArr);
      serviceTaskReportMailList = await this.idbService.join(serviceTaskReportMailList, [
        { field: "id_contact", table: "contact" },
        { field: "id_user", table: "user" },
      ]);
    }
    //
    return serviceTaskReportMailList;
  }

  //##########################################################################################
  // CONSUMER ################################################################################
  //##########################################################################################

  async consumer_getFromId(id: number) {
    let consumer = await this.idbService.getItem<DB.IDB_consumer>("consumer", { id: id });
    //
    return consumer;
  }

  async consumer_getList() {
    let consumerArr = {
      enabled: "1",
    };
    //
    let consumerList = await this.idbService.getItems<DB.IDB_consumer>("consumer", consumerArr);
    //
    return consumerList;
  }

  //##########################################################################################
  // CUSTOMER ################################################################################
  //##########################################################################################

  async customer_getFromId(id: number) {
    let customer = await this.idbService.getItem<DB.IDB_consumer>("consumer", { id: id });
    //
    return customer;
  }

  async customer_getList() {
    let customerList = [];
    let consumerTypology = await this.consumerTypology_getFromCode(DB.CONSUMER_TYPOLOGY.CUSTOMER);
    //
    if (consumerTypology) {
      let customerArr = {
        enabled: "1",
        id_consumer_typology: consumerTypology.id,
      };
      customerList = await this.idbService.getItems<DB.IDB_consumer>("consumer", customerArr);
    }
    //
    return customerList;
  }

  async consumer_inup(valueObj: I_ConsumerInup) {
    if (!valueObj.consumer) {
      await this.consumer_create(valueObj);
    }
    else {
      await this.consumer_update(valueObj);
    }
  }

  async consumer_create(valueObj: I_ConsumerInup): Promise<DB.IDB_consumer> {
    let consumerArr = {
      code: valueObj.code,
      name: valueObj.name,
      id_consumer_typology: valueObj.consumer_typology.id,
      id_consumer_parent: valueObj.consumer_parent.id,
      address: valueObj.address,
      city: valueObj.city,
      zip: valueObj.zip,
      province: valueObj.province,
      nation: valueObj.nation,
      vat: valueObj.vat,
      trip_km: valueObj.trip_km,
      trip_minutes: valueObj.trip_minutes,
      enabled: "1",
      to_push: "1",
    };
    let consumer = await this.idbService.inup<DB.IDB_consumer>("consumer", consumerArr);
    //
    return consumer;
  }

  async consumer_update(valueObj: I_ConsumerInup): Promise<DB.IDB_consumer> {
    let consumer = await this.idbService.getItem<DB.IDB_consumer>("consumer", { id: valueObj.consumer.id, enabled: "1" });
    //
    let consumerArr = {
      id: consumer.id,
      code: valueObj.code,
      name: valueObj.name,
      id_consumer_typology: valueObj.consumer_typology.id,
      id_consumer_parent: valueObj.consumer_parent.id,
      address: valueObj.address,
      city: valueObj.city,
      zip: valueObj.zip,
      province: valueObj.province,
      nation: valueObj.nation,
      vat: valueObj.vat,
      trip_km: valueObj.trip_km,
      trip_minutes: valueObj.trip_minutes,
      to_push: "1",
    };
    consumer = await this.idbService.inup<DB.IDB_consumer>("consumer", consumerArr, ["id"]);
    //
    return consumer;
  }


  async consumer_delete(consumer: DB.IDB_consumer) {
    let consumerArr = {
      id: consumer.id,
      enabled: "0",
      to_push: "1",
    };
    await this.idbService.inup<DB.IDB_consumer>("consumer", consumerArr, ["id"]);
  }

  //##########################################################################################
  // DESTINATION #############################################################################
  //##########################################################################################

  async destination_getFromId(id: number) {
    let destination = await this.idbService.getItem<DB.IDB_consumer>("consumer", { id: id });
    //
    return destination;
  }

  async destination_getFromCode(code: string) {
    let destination = await this.idbService.getItem<DB.IDB_consumer>("consumer", { code: code });
    //
    return destination;
  }

  async destination_getList(consumer?: DB.IDB_consumer) {
    let destinationList = [];
    let consumerTypology = await this.consumerTypology_getFromCode(DB.CONSUMER_TYPOLOGY.DESTINATION);
    //
    if (consumerTypology) {
      let destinationArr = {
        enabled: "1",
        id_consumer_typology: consumerTypology.id,
      };
      //
      if (consumer) {
        destinationArr["id_consumer_parent"] = consumer.id;
      }
      //
      destinationList = await this.idbService.getItems<DB.IDB_consumer>("consumer", destinationArr);
    }
    //
    return destinationList;
  }

  //##########################################################################################
  // CONSUMER_TYPOLOGY #######################################################################
  //##########################################################################################

  async consumerTypology_getFromId(id: number) {
    let consumerTypology = await this.idbService.getItem<DB.IDB_consumer_typology>("consumer_typology", { id: id });
    //
    return consumerTypology;
  }

  async consumerTypology_getFromCode(code: string) {
    let consumerTypology = await this.idbService.getItem<DB.IDB_consumer_typology>("consumer_typology", { code: code });
    //
    return consumerTypology;
  }

  async consumerTypology_getList() {
    let consumerTypologyList = await this.idbService.getItems<DB.IDB_consumer_typology>("consumer_typology", { enabled: "1" });
    //
    return consumerTypologyList;
  }

  //##########################################################################################
  // MACHINE #################################################################################
  //##########################################################################################

  async machine_getFromId(id: number): Promise<DB.IDB_machine> {
    let machine = await this.idbService.getItem<DB.IDB_machine>("machine", { id: id });
    //
    return machine;
  }

  async machine_getList(consumer?: DB.IDB_consumer, destination?: DB.IDB_consumer) {
    let machineArr = {
      enabled: "1",
    }
    //
    if (consumer) {
      machineArr["id_consumer"] = consumer.id;
    }
    //
    if (destination) {
      machineArr["id_destination"] = destination.id;
    }
    //
    let machineList = await this.idbService.getItems<DB.IDB_machine>("machine", machineArr);
    //
    return machineList;
  }

  //##########################################################################################
  // PRODUCT #################################################################################
  //##########################################################################################

  async product_getFromId(id: number): Promise<DB.IDB_product> {
    let product = await this.idbService.getItem<DB.IDB_product>("product", { id: id });
    //
    return product;
  }

  async product_getList() {
    let productList = await this.idbService.getItems<DB.IDB_product>("product", { enabled: "1" });
    //
    return productList;
  }

  async product_inup(user: DB.IDB_user, valueObj: I_ProductInup) {
    if (!valueObj.product) {
      return await this.product_create(user, valueObj);
    }
    else {
      return await this.product_update(valueObj);
    }
  }

  async product_create(user: DB.IDB_user, valueObj: I_ProductInup): Promise<DB.IDB_product> {
    let productArr = {
      article: this.product_generateArticle(user),
      name: valueObj.name,
      enabled: "1",
      to_push: "1",
    };
    let product = await this.idbService.inup<DB.IDB_product>("product", productArr);
    //
    return product;
  }

  product_generateArticle(user: DB.IDB_user,) {
    let productArticle = "ZZ99_" + (user.ext_code ?? "") + "_" + formatDate(new Date(), "yyMMdd_HHmmss", "en-EN");
    //
    return productArticle;
  }

  async product_update(valueObj: I_ProductInup): Promise<DB.IDB_product> {
    let product = await this.idbService.getItem<DB.IDB_product>("product", { id: valueObj.product.id, enabled: "1" });
    //
    let productArr = {
      id: product.id,
      article: valueObj.article,
      name: valueObj.name,
      to_push: "1",
    };
    product = await this.idbService.inup<DB.IDB_product>("product", productArr, ["id"]);
    //
    return product;
  }

  async product_delete(product: DB.IDB_product) {
    let productArr = {
      id: product.id,
      enabled: "0",
      to_push: "1",
    };
    await this.idbService.inup<DB.IDB_product>("product", productArr, ["id"]);
  }

  //##########################################################################################
  // CONTACT ###########################################################################
  //##########################################################################################

  async contact_getFromId(id: number): Promise<DB.IDB_contact> {
    let contact = await this.idbService.getItem<DB.IDB_contact>("contact", { id: id });
    //
    return contact;
  }

  async contact_getList(consumer?: DB.IDB_consumer) {
    let contactArr = {
      enabled: "1",
    };
    //
    if (consumer) {
      contactArr["id_consumer"] = consumer.id;
    }
    //
    let contactList = await this.idbService.getItems<DB.IDB_contact>("contact", contactArr);
    //
    return contactList;
  }

  async contact_inup(valueObj: I_ContactInup) {
    if (!valueObj.contact) {
      await this.contact_create(valueObj);
    }
    else {
      await this.contact_update(valueObj);
    }
  }

  async contact_create(valueObj: I_ContactInup): Promise<DB.IDB_contact> {
    let contactArr = {
      name_first: valueObj.name_first,
      name_last: valueObj.name_last,
      phone: valueObj.phone,
      email: valueObj.email,
      id_consumer: valueObj.consumer ? valueObj.consumer.id : null,
      enabled: "1",
      to_push: "1",
    };
    let contact = await this.idbService.inup<DB.IDB_contact>("contact", contactArr);
    //
    return contact;
  }

  async contact_update(valueObj: I_ContactInup): Promise<DB.IDB_contact> {
    let contact = await this.idbService.getItem<DB.IDB_contact>("contact", { id: valueObj.contact.id, enabled: "1" });
    //
    let contactArr = {
      id: contact.id,
      name_first: valueObj.name_first,
      name_last: valueObj.name_last,
      phone: valueObj.phone,
      email: valueObj.email,
      id_consumer: valueObj.consumer ? valueObj.consumer.id : null,
      to_push: "1",
    };
    contact = await this.idbService.inup<DB.IDB_contact>("contact", contactArr, ["id"]);
    //
    return contact;
  }

  async contact_delete(contact: DB.IDB_contact) {
    let contactArr = {
      id: contact.id,
      enabled: "0",
      to_push: "1",
    };
    await this.idbService.inup<DB.IDB_contact>("contact", contactArr, ["id"]);
  }

  //##########################################################################################
  // AUTODOP_VERBAL ##########################################################################
  //##########################################################################################

  async autodopVerbal_getFromId(id: number): Promise<DB.IDB_autodop_verbal> {
    let autodopVerbal = await this.idbService.getItem<DB.IDB_autodop_verbal>("autodop_verbal", { id: id });
    //
    return autodopVerbal;
  }

  async autodopVerbal_getFromIdr(idr: number): Promise<DB.IDB_autodop_verbal> {
    let autodopVerbal = await this.idbService.getItem<DB.IDB_autodop_verbal>("autodop_verbal", { idr: idr, enabled: "1" });
    //
    return autodopVerbal;
  }

  async autodopVerbal_getList(userList: DB.IDB_user[]) {
    let idUserList = null;
    if (userList !== null) {
      idUserList = userList.map(user => user.id);
    }
    //
    let autodopVerbalList = await this.idbService.idb.table<DB.IDB_autodop_verbal>("autodop_verbal").toArray();
    autodopVerbalList = autodopVerbalList.filter(autodopVerbal => {
      //
      //enabled
      if (parseInt(autodopVerbal.enabled) == 0) {
        return false;
      }
      //
      //id_user
      if (idUserList && !idUserList.includes(autodopVerbal.id_user)) {
        return false;
      }
      //
      return true;
    });
    //
    return autodopVerbalList;
  }

  async autodopVerbal_create(user: DB.IDB_user, valueObj: I_AutodopVerbalInup): Promise<DB.IDB_autodop_verbal> {
    let autodopVerbalStatusNew = await this.autodopVerbalStatus_getFromCode(DB.AUTODOP_VERBAL_STATUS.NEW);
    //
    let autodopVerbalArr = {
      code: await this.autodopVerbal_generateCode(user),
      id_user: user.id,
      date_create: this.dateService.date_getDateTime(new Date(valueObj.date_create)),
      id_autodop_verbal_typology: valueObj.autodop_verbal_typology.id,
      id_autodop_verbal_status: autodopVerbalStatusNew.id,
      id_destination: valueObj.destination.id,
      id_job: valueObj.job.id,
      id_machine: valueObj.machine.id,
      enabled: "1",
      to_push: "1",
    };
    let autodopVerbal = await this.idbService.inup<DB.IDB_autodop_verbal>("autodop_verbal", autodopVerbalArr);
    //
    return autodopVerbal;
  }

  async autodopVerbal_generateCode(user: DB.IDB_user,) {
    let autodopVerbalCode = (user.ext_code ?? "") + "_" + formatDate(new Date(), "yyMMdd_HHmmss", "en-EN");
    //
    return autodopVerbalCode;
  }

  async autodopVerbal_delete(autodopVerbal: DB.IDB_autodop_verbal) {
    let autodopVerbalArr = {
      id: autodopVerbal.id,
      enabled: "0",
      to_push: "1",
    };
    autodopVerbal = await this.idbService.inup<DB.IDB_autodop_verbal>("autodop_verbal", autodopVerbalArr, ["id"]);
  }

  async autodopVerbal_setSent(autodopVerbal: DB.IDB_autodop_verbal) {
    let autodopVerbalStatusSent = await this.autodopVerbalStatus_getFromCode(DB.AUTODOP_VERBAL_STATUS.SENT);
    //
    if (autodopVerbal.id_autodop_verbal_status != autodopVerbalStatusSent.id) {
      //
      let autodopVerbalArr = {
        id: autodopVerbal.id,
        id_autodop_verbal_status: autodopVerbalStatusSent.id,
        date_sent: this.dateService.date_getDateTime(new Date()),
        to_push: "1",
      };
      await this.idbService.inup<DB.IDB_autodop_verbal>("autodop_verbal", autodopVerbalArr, ["id"]);
    }
  }

  //##########################################################################################
  // AUTODOP_VERBAL_TYPOLOGY #################################################################
  //##########################################################################################

  async autodopVerbalTypology_getFromId(id: number) {
    let autodopVerbalTypology = await this.idbService.getItem<DB.IDB_autodop_verbal_typology>("autodop_verbal_typology", { id: id });
    //
    return autodopVerbalTypology;
  }

  async autodopVerbalTypology_getFromCode(code: string) {
    let autodopVerbalTypology = await this.idbService.getItem<DB.IDB_autodop_verbal_typology>("autodop_verbal_typology", { code: code });
    //
    return autodopVerbalTypology;
  }

  async autodopVerbalTypology_getList() {
    let autodopVerbalTypologyList = await this.idbService.getItems<DB.IDB_autodop_verbal_typology>("autodop_verbal_typology", { enabled: "1" });
    //
    return autodopVerbalTypologyList;
  }

  //##########################################################################################
  // AUTODOP_VERBAL_STATUS ##############################################################
  //##########################################################################################

  async autodopVerbalStatus_getFromId(id: number) {
    let autodopVerbalStatus = await this.idbService.getItem<DB.IDB_autodop_verbal_status>("autodop_verbal_status", { id: id });
    //
    return autodopVerbalStatus;
  }

  async autodopVerbalStatus_getFromCode(code: string) {
    let autodopVerbalStatus = await this.idbService.getItem<DB.IDB_autodop_verbal_status>("autodop_verbal_status", { code: code });
    //
    return autodopVerbalStatus;
  }

  async autodopVerbalStatus_getList() {
    let autodopVerbalStatusList = await this.idbService.getItems<DB.IDB_autodop_verbal_status>("autodop_verbal_status", { enabled: "1" }, [{ field: "priority", direction: "ASC" }]);
    //
    return autodopVerbalStatusList;
  }

  //##########################################################################################
  // AUTODOP_VERBAL_MAIL ################################################################
  //##########################################################################################

  async autodopVerbalMail_saveSent(autodopVerbal: DB.IDB_autodop_verbal, contactList: DB.IDB_contact[]) {
    let userLogged = this.userSettingService.getLocalStorage("user", null, true) as DB.IDB_user;
    let date_sent = this.dateService.date_getDateTime(new Date());
    //
    for (let contactK in contactList) {
      let contact = contactList[contactK];
      //
      let autodopVerbalMailArr = {
        id_autodop_verbal: autodopVerbal.id,
        id_contact: contact.id,
        date_sent: date_sent,
        id_user: userLogged.id,
        enabled: "1",
        to_push: "1",
      };
      let autodopVerbalMail = await this.idbService.inup<DB.IDB_autodop_verbal_mail>("autodop_verbal_mail", autodopVerbalMailArr);
    }
  }

  async autodopVerbalMail_getList(autodopVerbal?: DB.IDB_autodop_verbal) {
    let autodopVerbalMailList = [];
    //
    if (autodopVerbal) {
      let autodopVerbalMailArr = {
        enabled: "1",
        id_service_task_report: autodopVerbal.id,
      };
      //
      autodopVerbalMailList = await this.idbService.getItems<DB.IDB_autodop_verbal_mail>("autodop_verbal_mail", autodopVerbalMailArr);
      autodopVerbalMailList = await this.idbService.join(autodopVerbalMailList, [
        { field: "id_contact", table: "contact" },
        { field: "id_user", table: "user" },
      ]);
    }
    //
    return autodopVerbalMailList;
  }

  //##########################################################################################
  // TRUCK ###################################################################################
  //##########################################################################################

  async truck_getFromId(id: number): Promise<DB.IDB_truck> {
    let truck = await this.idbService.getItem<DB.IDB_truck>("truck", { id: id });
    //
    return truck;
  }

  async truck_getList() {
    let truckList = await this.idbService.getItems<DB.IDB_truck>("truck", { enabled: "1" });
    //
    return truckList;
  }

  //##########################################################################################
  // TRUCK_STOCK #############################################################################
  //##########################################################################################

  async truckStock_getFromId(id: number): Promise<DB.IDB_truck_stock> {
    let truckStock = await this.idbService.getItem<DB.IDB_truck_stock>("truck_stock", { id: id });
    //
    return truckStock;
  }

  async truckStock_getList(truck?: DB.IDB_truck) {
    let truckStockList = await this.idbService.idb.table<DB.IDB_truck_stock>("truck_stock").toArray();
    //
    truckStockList = truckStockList.filter(truckStock => {
      if (parseInt(truckStock.enabled) == 0) {
        return false;
      }
      //
      if (truck && truckStock.id_truck != truck.id) {
        return false;
      }
      //
      return true;
    });
    //
    truckStockList = await this.idbService.join(truckStockList, [
      { field: "id_truck", table: "truck" },
      { field: "id_product", table: "product" },
    ]);
    //
    return truckStockList;
  }

  async truckStock_clear() {
    await this.idbService.clear("truck_stock");
  }
}
