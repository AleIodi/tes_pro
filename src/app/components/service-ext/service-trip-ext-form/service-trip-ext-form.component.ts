import { Component, OnInit, Inject, Input, ViewChild, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { differenceInMinutes, roundToNearestMinutes, add, subMinutes } from 'date-fns';
import { DateService } from 'src/app/services/date.service';
import { AuthService } from 'src/app/services/auth.service';
import { environment } from 'src/environments/environment';
import { th } from 'date-fns/locale';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-service-trip-ext-form',
    templateUrl: './service-trip-ext-form.component.html',
    styleUrls: ['./service-trip-ext-form.component.scss'],
    standalone: false
})

export class ServiceTripExtFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTripExtFormComponent"); event.stopPropagation(); } }

  @Input() serviceTrip!: DB.IDB_service_trip;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;
  @Input() dateEnd;

  confirmClicked = false;
  serviceTaskIsEditable = true;

  formGroupObj = {
    dateStart: new UntypedFormControl("", [Validators.required]),
    timeStart: new UntypedFormControl("", [Validators.required]),
    timeEnd: new UntypedFormControl("", [Validators.required]),
    user: new UntypedFormControl("", [CustomValidator.object]),
    serviceTask: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    destination: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    kmInvoice: new UntypedFormControl("", [Validators.required, CustomValidator.integer]),
    kmReal: new UntypedFormControl("", [Validators.required, CustomValidator.number]),
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

  serviceTaskAutocompleteObj = {
    dataList: new Observable<DB.IDB_service_task[]>(),
    setDataList: async () => {
      let serviceTaskList = await this.managerService.serviceTask_getList(this.managerService.getUserList());
      //
      serviceTaskList = await this.idbService.join(serviceTaskList, [
        {
          field: "id_job_details", table: "job_details", joinType: "LEFT", joinList: [{
            field: "id_job", table: "job", joinList: [{
              field: "id_consumer", table: "consumer"
            }]
          }]
        }
      ]);
      //
      this.serviceTaskAutocompleteObj.dataList = this.formGroupObj.serviceTask.valueChanges.pipe(
        startWith(""),
        map(value => typeof value === "string" ? value : value.name),
        map(name => name ? this.serviceTaskAutocompleteObj.filter(serviceTaskList, name) : serviceTaskList.slice())
      );
    },
    display: (serviceTask: DB.IDB_service_task): string => {
      return serviceTask && serviceTask["job_details"] ? "(" + serviceTask["job_details"]["job"]["code"] + ") " + serviceTask["job_details"]["job"]["consumer"]["name"] + " - " + (serviceTask.code ? serviceTask.code : 'Codice non assegnato') : "";
    },
    filter: (serviceTaskList: DB.IDB_service_task[], filterText: string): DB.IDB_service_task[] => {
      return serviceTaskList.filter(serviceTask => serviceTask.code.toLowerCase().includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let serviceTask: DB.IDB_service_task = event.option.value;
      //
      let jobDetails = await this.managerService.jobDetails_getFromId(serviceTask.id_job_details);
      jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
      let job = await this.managerService.job_getFromId(jobDetails.id_job);
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      //
      this.autocomplete_loadData(consumer, job);
    }
  };

  destinationAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: async (consumer?: DB.IDB_consumer) => {
      let destinationList = await this.managerService.destination_getList(consumer);
      //
      this.destinationAutocompleteObj.dataList = this.formGroupObj.destination.valueChanges.pipe(
        startWith(""),
        map(value => typeof value === "string" ? value : (value ? this.destination_getFilterString(value) : "")),
        map(value => this.destinationAutocompleteObj.filter(destinationList, value))
      );
    },
    display: (destination: DB.IDB_consumer): string => {
      return destination ? destination.name + " - " + destination.address + " " + destination.city + " " + destination.province : "";
    },
    filter: (destinationList: DB.IDB_consumer[], filterText: string): DB.IDB_consumer[] => {
      return destinationList.filter(destination => (this.destination_getFilterString(destination).toLowerCase()).includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let destination: DB.IDB_consumer = event.option.value;
      //
      let dayRange = this.dateService.date_getDayRange(this.dateStart);
      let operationList = await this.managerService.serviceOperation_getList(null, this.serviceTask, DB.SERVICE_TYPOLOGY.EXTERNAL, dayRange[0], dayRange[1]);
      //
      let serviceTripList = await this.managerService.serviceTrip_getList(null, this.serviceTask, this.dateStart);
      //
      if (serviceTripList.length > 0) {
        let dateEndLastOperation = new Date(operationList[operationList.length-1].date_end);
        this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(dateEndLastOperation));
        this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(add(dateEndLastOperation, { minutes: destination.trip_minutes ? destination.trip_minutes : 0 })));
      }
      else {
        let dateStartFirstOperation = new Date(operationList[0].date_start);
        this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(dateStartFirstOperation));
        this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(add(dateStartFirstOperation, { minutes: destination.trip_minutes ? -destination.trip_minutes : 0 })));
      }
      //
      this.formGroupObj.kmInvoice.setValue(destination.trip_km);
      this.formGroupObj.kmReal.setValue(destination.trip_km);
    }
  };

  constructor(public dialogRef: MatDialogRef<ServiceTripExtFormComponent>, private authService: AuthService, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService) { }

  async ngOnInit() {
    let user: DB.IDB_user;
    let consumer: DB.IDB_consumer;
    let destination: DB.IDB_consumer;
    let destination_consumer: DB.IDB_consumer;
    let job: DB.IDB_job;
    let jobDetails: DB.IDB_job_details;
    //
    if (this.serviceTrip) {
      let dateStart = new Date(this.serviceTrip.date_start);
      let dateEnd = new Date(this.serviceTrip.date_end);
      //
      user = await this.managerService.user_getFromId(this.serviceTrip.id_user);
      this.serviceTask = await this.managerService.serviceTask_getFromId(this.serviceTrip.id_service_task);
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(dateStart));
      this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(dateEnd));
      //
      destination = await this.managerService.destination_getFromId(this.serviceTrip.id_destination);
      destination_consumer = await this.managerService.consumer_getFromId(destination.id_consumer_parent);
      destination["consumer"] = destination_consumer;
      //
      this.formGroupObj.user.setValue(this.serviceTrip.id_user);
      this.formGroupObj.destination.setValue(destination);
      this.formGroupObj.kmReal.setValue(this.serviceTrip.km_real);
      this.formGroupObj.kmInvoice.setValue(this.serviceTrip.km_invoice);
      //
      this.userAutocompleteObj.chipsObj.dataList = [user];
      this.formGroupObj.user.disable();
      this.userAutocompleteObj.chipsObj.removable = false;
    }
    else {
      let dateStart = roundToNearestMinutes(new Date(this.dateStart ?? new Date()), { nearestTo: environment.service_trip_step_minutes });
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      //
      let userList = await this.managerService.serviceTask_getUserList(this.serviceTask);
      this.userAutocompleteObj.chipsObj.dataList = userList;
    }
    //
    if (this.serviceTask) {
      if (this.serviceTask.id_job_details) {
        jobDetails = await this.managerService.jobDetails_getFromId(this.serviceTask.id_job_details);
        jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
        job = await this.managerService.job_getFromId(jobDetails.id_job);
        consumer = await this.managerService.consumer_getFromId(job.id_consumer);
        this.serviceTask["job_details"] = jobDetails;
        this.serviceTask["job_details"]["job"] = job;
        this.serviceTask["job_details"]["job"]["consumer"] = consumer;
      }
      //
      this.formGroupObj.serviceTask.setValue(this.serviceTask);
      //
      this.serviceTaskIsEditable = await this.managerService.serviceTask_isEditable(this.serviceTask);
      //
      if (!this.serviceTaskIsEditable) {
        this.formGroup.disable();
      }
    }
    //
    if (this.serviceTaskIsEditable) {
      await this.autocomplete_loadData(consumer, job);
    }
  }

  async autocomplete_loadData(consumer: DB.IDB_consumer, job: DB.IDB_job) {
    await this.serviceTaskAutocompleteObj.setDataList();
    await this.destinationAutocompleteObj.setDataList(consumer);
    await this.userAutocompleteObj.setDataList();
  }

  async serviceTaskHintClick(serviceTask) {
    if (serviceTask.id_job_details) {
      let jobDetails = await this.managerService.jobDetails_getFromId(serviceTask.id_job_details);
      jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
      let job = await this.managerService.job_getFromId(jobDetails.id_job);
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      //
      this.autocomplete_loadData(consumer, job);
    }
    //
    this.formGroupObj.serviceTask.setValue(serviceTask);
  }

  async save() {
    this.confirmClicked = true;
    //
    let userList = this.userAutocompleteObj.chipsObj.dataList;
    let serviceTask = this.formGroupObj.serviceTask.value ?? null;
    //
    for (let userk in userList) {
      let user = userList[userk];
      //
      let serviceTrip = await this.managerService.serviceTrip_inup(user, {
        service_trip: this.serviceTrip ?? null,
        service_task: serviceTask,
        date_start: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeStart.value,
        date_end: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeEnd.value,
        km_invoice: this.formGroupObj.kmInvoice.value ?? null,
        km_real: this.formGroupObj.kmReal.value ?? null,
        destination: this.formGroupObj.destination.value ?? null,
      });
      //
      serviceTask = { "id": serviceTrip.id_service_task };
    }
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Viaggio", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.serviceTrip_delete(this.serviceTrip);
        //
        this.dialogRef.close();
      }
    });
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

  destination_getFilterString(destination: DB.IDB_consumer) {
    if (!destination) {
      return "";
    }
    //
    let filterString = destination.name + " - " + destination.address + " " + destination.city + " " + destination.province;
    //
    return filterString;
  }
}
