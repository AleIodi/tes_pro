import { Component, OnInit, Inject, Input, ViewChild, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { differenceInMinutes, roundToNearestMinutes, add, subMinutes, sub } from 'date-fns';
import { ManagerService } from '../../../services/manager.service'
import { DateService } from 'src/app/services/date.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../services/auth.service'
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-service-call-form',
    templateUrl: './service-call-form.component.html',
    styleUrls: ['./service-call-form.component.scss'],
    standalone: false
})

export class ServiceCallFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCallFormComponent"); event.stopPropagation(); } }

  @Input() serviceCall!: DB.IDB_service_call;
  @Input() dateStart;
  @Input() dateEnd;
  @Input() isTicketSchedulationMode;

  confirmClicked = false;

  formGroupObj = {
    dateStart: new UntypedFormControl("", []),
    timeStart: new UntypedFormControl("", []),
    timeEnd: new UntypedFormControl("", []),
    user: new UntypedFormControl("", [CustomValidator.object]),
    //
    serviceCall: new UntypedFormControl("", [CustomValidator.object]),
    consumer: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    contact: new UntypedFormControl("", [CustomValidator.object]),
    destination: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    job: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    jobDetails: new UntypedFormControl("", [CustomValidator.object]),
    description: new UntypedFormControl("", [Validators.required]),
    machine: new UntypedFormControl("", [CustomValidator.object]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  serviceCallIsEditable = true;

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

  consumerAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: async () => {
      this.managerService.customer_getList().then(consumerList => {
        this.consumerAutocompleteObj.dataList = this.formGroupObj.consumer.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.consumerAutocompleteObj.filter(consumerList, name) : consumerList.slice())
          );
      });
    },
    display: (consumer: DB.IDB_consumer): string => {
      return consumer && consumer.code ? consumer.code + " - " + consumer.name : "";
    },
    filter: (consumerList: DB.IDB_consumer[], filterText: string): DB.IDB_consumer[] => {
      return consumerList.filter(consumer => consumer.name.toLowerCase().includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let consumer: DB.IDB_consumer = event.option.value;
      //
      this.formGroupObj.serviceCall.setValue("");
      this.formGroupObj.destination.setValue("");
      this.formGroupObj.job.setValue("");
      this.formGroupObj.jobDetails.setValue("");
      //
      this.destinationAutocompleteObj.dataList = null;
      this.jobAutocompleteObj.dataList = null;
      this.jobDetailsAutocompleteObj.dataList = null;
      this.machineAutocompleteObj.chipsObj.dataList = [];
      //
      this.destinationAutocompleteObj.setDataList();
      this.contactAutocompleteObj.setDataList();
      this.jobAutocompleteObj.setDataList();
      this.machineAutocompleteObj.setDataList();
    }
  };

  contactAutocompleteObj = {
    dataList: new Observable<DB.IDB_contact[]>(),
    setDataList: async () => {
      let consumer: DB.IDB_consumer = this.formGroupObj.consumer.value ? this.formGroupObj.consumer.value : null;
      //
      this.managerService.contact_getList(consumer).then(contactList => {
        this.contactAutocompleteObj.dataList = this.formGroupObj.contact.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name_first),
            map(name_first => name_first ? this.contactAutocompleteObj.filter(contactList, name_first) : contactList.slice())
          );
      });
    },
    display: (contact: DB.IDB_contact): string => {
      return contact && contact.name_first ? contact.name_first + " " + contact.name_last : "";
    },
    filter: (contactList: DB.IDB_contact[], filterText: string): DB.IDB_contact[] => {
      return contactList.filter(contact => (contact.name_first + " " + contact.name_last).toLowerCase().includes(filterText.toLowerCase()));
    },
  };

  destinationAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: () => {
      let consumer: DB.IDB_consumer = this.formGroupObj.consumer.value ? this.formGroupObj.consumer.value : null;
      //
      this.managerService.destination_getList(consumer).then(destinationList => {
        this.destinationAutocompleteObj.dataList = this.formGroupObj.destination.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.destinationAutocompleteObj.filter(destinationList, name) : destinationList.slice())
          );
      });
    },
    display: (destination: DB.IDB_consumer): string => {
      return destination ? (destination.city ?? "") + " - " + (destination.address ?? "") : "";
    },
    filter: (destinationList: DB.IDB_consumer[], filterText: string): DB.IDB_consumer[] => {
      return destinationList.filter(destination => (destination.code.toLowerCase() + (destination.name ?? "").toLowerCase()).includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let destination: DB.IDB_consumer = event.option.value;
      //
      this.machineAutocompleteObj.chipsObj.dataList = [];
      //
      this.machineAutocompleteObj.setDataList();
    }
  };

  jobAutocompleteObj = {
    dataList: new Observable<DB.IDB_job[]>(),
    setDataList: () => {
      let consumer: DB.IDB_consumer = this.formGroupObj.consumer.value ? this.formGroupObj.consumer.value : null;
      //
      this.managerService.job_getList(consumer).then(jobList => {
        this.jobAutocompleteObj.dataList = this.formGroupObj.job.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.jobAutocompleteObj.filter(jobList, name) : jobList.slice())
          );
      });
    },
    display: (job: DB.IDB_job): string => {
      return job && job.code ? job.code + " - " + job.name : "";
    },
    filter: (jobList: DB.IDB_job[], filterText: string): DB.IDB_job[] => {
      return jobList.filter(job => (job.code.toLowerCase() + (job.name ?? "").toLowerCase()).includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let job: DB.IDB_job = event.option.value;
      //
      this.formGroupObj.serviceCall.setValue("");
      this.formGroupObj.jobDetails.setValue("");
      this.jobAutocompleteObj.dataList = null;
      //
      this.jobDetailsAutocompleteObj.setDataList();
      //
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      this.jobAutocompleteObj.setDataList();
      this.machineAutocompleteObj.setDataList();
      //
      this.formGroupObj.consumer.setValue(consumer);
      this.destinationAutocompleteObj.setDataList();
      this.contactAutocompleteObj.setDataList();
    },
  };

  jobDetailsAutocompleteObj = {
    dataList: new Observable<DB.IDB_job_details[]>(),
    setDataList: async () => {
      let job: DB.IDB_job = this.formGroupObj.job.value ? this.formGroupObj.job.value : null;
      //
      this.idbService.getItems<DB.IDB_job_details>("job_details", { id_job: job.id, enabled: "1" }).then(async jobDetailsList => {
        jobDetailsList = await this.idbService.join(jobDetailsList, [
          { field: "id_job_details_action", table: "job_details_action" },
        ])
        //
        this.jobDetailsAutocompleteObj.dataList = this.formGroupObj.jobDetails.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.jobDetailsAutocompleteObj.filter(jobDetailsList, name) : jobDetailsList.slice())
          );
      });
    },
    display: (jobDetails: DB.IDB_job_details): string => {
      return jobDetails && jobDetails["job_details_action"] ? jobDetails["job_details_action"]["code"] + " - " + jobDetails["job_details_action"]["name"] : "";
    },
    filter: (jobDetailsList: DB.IDB_job_details[], filterText: string): DB.IDB_job_details[] => {
      return jobDetailsList.filter(jobDetails => jobDetails["job_details_action"]["code"].toString().toLowerCase().includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let jobDetails: DB.IDB_job_details = event.option.value;
      //
      //TODO - fare environment per decidere se cambiare task
      //this.formGroupObj.serviceTask.setValue("");
    },
  };

  machineAutocompleteObj = {
    dataList: new Observable<DB.IDB_machine[]>(),
    setDataList: () => {
      let consumer: DB.IDB_consumer = this.formGroupObj.consumer.value ? this.formGroupObj.consumer.value : null;
      let destination: DB.IDB_consumer = this.formGroupObj.destination.value ? this.formGroupObj.destination.value : null;
      //
      this.managerService.machine_getList(consumer, destination).then(machineList => {
        this.machineAutocompleteObj.dataList = this.formGroupObj.machine.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : (value ? this.machine_getString(value) : "")),
            map(value => this.machineAutocompleteObj.filter(machineList, value))
          );
      });
    },
    display: (machine: DB.IDB_machine): string => {
      return this.machine_getString(machine);
    },
    filter: (machineList: DB.IDB_machine[], filterText: string): DB.IDB_machine[] => {
      let machineSelectableList = [];
      //
      for (let machineK in machineList) {
        let machine = machineList[machineK];
        //
        let found = false;
        for (let machineField_MachineSelectedK in this.machineAutocompleteObj.chipsObj.dataList) {
          let machineField_MachineSelected = this.machineAutocompleteObj.chipsObj.dataList[machineField_MachineSelectedK];
          //
          if (machine.id == machineField_MachineSelected.id) {
            found = true;
            break;
          }
        }
        //
        if (!found) {
          machineSelectableList.push(machine);
        }
      }
      //
      return machineSelectableList.filter(machine => (this.machine_getString(machine).toLowerCase()).includes(filterText.toLowerCase()));
    },
    chipsObj: {
      enabled: true,
      removable: true,
      required: false,
      dataList: [],
    }
  };

  constructor(public dialogRef: MatDialogRef<ServiceCallFormComponent>, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService) { }

  async ngOnInit() {
    let consumer: DB.IDB_consumer = null;
    let destination: DB.IDB_consumer = null;
    let job: DB.IDB_job = null;
    let jobDetails: DB.IDB_job_details = null;
    let contact: DB.IDB_contact = null;
    let machineList: DB.IDB_machine[] = null;
    //
    if(this.isTicketSchedulationMode){
      this.formGroupObj.dateStart = new UntypedFormControl("", [Validators.required]);
      this.formGroupObj.timeStart = new UntypedFormControl("", [Validators.required]);
      this.formGroupObj.timeEnd = new UntypedFormControl("", [Validators.required]);
    }
    //
    if(this.serviceCall) {
      consumer = await this.managerService.consumer_getFromId(this.serviceCall.id_consumer);
      //
      if(this.serviceCall.id_job) {
        job = await this.managerService.job_getFromId(this.serviceCall.id_job);
      }
      //
      if(this.serviceCall.id_job_details) {
        jobDetails = await this.managerService.jobDetails_getFromId(this.serviceCall.id_job_details);
        jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
        job = await this.managerService.job_getFromId(jobDetails.id_job);
        //
        this.serviceCall["job_details"] = jobDetails;
        this.serviceCall["job_details"]["job"] = job;
        this.serviceCall["job_details"]["job"]["consumer"] = consumer;
      }
      //
      if(this.serviceCall.id_destination) {
        destination = await this.managerService.destination_getFromId(this.serviceCall.id_destination);
        this.serviceCall["destination"] = destination;
      }
      //
      let serviceCallStatus = await this.managerService.serviceCallStatus_getFromId(this.serviceCall.id_service_call_status);
      this.serviceCall["service_call_status"] = serviceCallStatus;
      //
      if(this.serviceCall.id_contact) {
        contact = await this.managerService.contact_getFromId(this.serviceCall.id_contact);
      }
      //
      if(this.isTicketSchedulationMode){
        this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(this.serviceCall.date_start??this.dateStart));
        this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(this.serviceCall.date_start??this.dateStart));
        this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(this.serviceCall.date_end??this.dateEnd));
      }
      //
      this.formGroupObj.jobDetails.setValue(jobDetails);
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.contact.setValue(contact);
      this.formGroupObj.destination.setValue(destination);
      this.formGroupObj.description.setValue(this.serviceCall.description);
      //
      //machine
      machineList = await this.managerService.serviceCall_getMachineList(this.serviceCall);
      this.machineAutocompleteObj.chipsObj.dataList = machineList;
      //
      //user
      let userList = await this.managerService.serviceCall_getUserList(this.serviceCall);
      this.userAutocompleteObj.chipsObj.dataList = userList;
      //
      this.serviceCallIsEditable = this.serviceCall["service_call_status"]["code"] == DB.SERVICE_CALL_STATUS.NEW || (this.serviceCall["service_call_status"]["code"] == DB.SERVICE_CALL_STATUS.SCHEDULED && this.isTicketSchedulationMode);
      //
      if(!this.serviceCallIsEditable) {
        this.formGroup.disable();
        this.userAutocompleteObj.chipsObj.removable = false;
        this.machineAutocompleteObj.chipsObj.removable = false;
      }
      else {
        this.formGroupObj.consumer.disable();
        //this.formGroupObj.destination.disable();
        //this.formGroupObj.job.disable();
      }
    }
    //
    if (this.serviceCallIsEditable) {
      await this.autocomplete_loadData(consumer, job);
    }
  }

  async autocomplete_loadData(consumer: DB.IDB_consumer, job: DB.IDB_job) {
    await this.consumerAutocompleteObj.setDataList();
    await this.userAutocompleteObj.setDataList();
    await this.jobAutocompleteObj.setDataList();

    if(consumer && consumer.id) {
      await this.contactAutocompleteObj.setDataList();
      await this.machineAutocompleteObj.setDataList();
    }

    if (job && job.id) {
      await this.jobDetailsAutocompleteObj.setDataList();
    }
  }

  async save() {
    this.confirmClicked = true;
    //
    let serviceCallStatusNew = await this.managerService.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.NEW);
    let serviceCallStatusScheduled = await this.managerService.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.SCHEDULED);
    let machineList = this.machineAutocompleteObj.chipsObj.dataList;
    let userList = this.userAutocompleteObj.chipsObj.dataList;
    //
    let serviceCall = await this.managerService.serviceCall_inup(
      {
        service_call: this.serviceCall ?? null,
        id_service_call_status: this.isTicketSchedulationMode ? serviceCallStatusScheduled.id : serviceCallStatusNew.id,
        date_start: this.isTicketSchedulationMode ? this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeStart.value : null,
        date_end: this.isTicketSchedulationMode ? this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeEnd.value : null,
        consumer: this.formGroupObj.consumer.value,
        contact: this.formGroupObj.contact.value ?? null,
        destination: this.formGroupObj.destination.value ?? null,
        job: this.formGroupObj.job.value,
        job_details: this.formGroupObj.jobDetails.value ?? null,
        description: this.formGroupObj.description.value,
      },
      userList,
      machineList
    );
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, this.isTicketSchedulationMode ? "Cancellare Appuntamento" : "Cancellare Ticket", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        if(this.isTicketSchedulationMode){
          this.managerService.serviceCall_deleteSchedulation(this.serviceCall);
        }
        else{
          this.managerService.serviceCall_delete(this.serviceCall);
        }
        //
        this.dialogRef.close();
      }
    });
  }

  machine_getString(machine: DB.IDB_machine) {
    if (!machine) {
      return "";
    }
    //
    let machineString = machine.name;
    //
    return machineString;
  }

  getDifferenceInMinutes() {
    if (!this.formGroupObj.timeStart.value || !this.formGroupObj.timeEnd.value) {
      return 0;
    }
    //
    let dateTimeStart = roundToNearestMinutes(new Date(this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeStart.value), { nearestTo: environment.service_operation_step_minutes });
    let dateTimeEnd = roundToNearestMinutes(new Date(this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeEnd.value), { nearestTo: environment.service_operation_step_minutes });
    //
    let difference = differenceInMinutes(dateTimeEnd, dateTimeStart) / 60;
    //
    return difference;
  }

  fixStartEndTime(isStartChanged) {
    let dateTimeStart = roundToNearestMinutes(new Date(this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeStart.value), { nearestTo: environment.service_operation_step_minutes });
    let dateTimeEnd = roundToNearestMinutes(new Date(this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeEnd.value), { nearestTo: environment.service_operation_step_minutes });
    //
    if (isStartChanged && dateTimeStart >= dateTimeEnd) {
      dateTimeEnd = add(dateTimeStart, { minutes: environment.service_operation_step_minutes });
    }
    else if (!isStartChanged && dateTimeStart >= dateTimeEnd) {
      if (dateTimeEnd.getHours() == 0 && dateTimeEnd.getMinutes() == 0) {
        dateTimeEnd = add(dateTimeEnd, { minutes: environment.service_operation_step_minutes });
      }
      dateTimeStart = subMinutes(dateTimeEnd, environment.service_operation_step_minutes);
    }
    //
    this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(dateTimeStart));
    this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(dateTimeEnd));
  }
}
