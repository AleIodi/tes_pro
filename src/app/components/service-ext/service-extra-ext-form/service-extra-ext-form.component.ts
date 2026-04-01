import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { roundToNearestMinutes, add } from 'date-fns'

import { ManagerService } from '../../../services/manager.service'
import { AuthService } from '../../../services/auth.service'
import { DateService } from '../../../services/date.service'
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
  selector: 'app-service-extra-ext-form',
  templateUrl: './service-extra-ext-form.component.html',
  styleUrls: ['./service-extra-ext-form.component.scss'],
  standalone: false
})

export class ServiceExtraExtFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceExtraExtFormComponent"); event.stopPropagation(); } }

  @Input() serviceTask!: DB.IDB_service_task;
  @Input() serviceExtra!: DB.IDB_service_extra;
  @Input() dateStart;

  confirmClicked = false;

  formGroupObj = {
    dateStart: new UntypedFormControl("", [Validators.required]),
    user: new UntypedFormControl("", [CustomValidator.object]),
    serviceTask: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    serviceExtraTypology: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    value: new UntypedFormControl("", [Validators.required, CustomValidator.number]),
    notes: new UntypedFormControl("", []),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  serviceTypology: DB.IDB_service_typology;


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
      this.autocomplete_loadData();
    }
  };

  serviceExtraTypologyAutocompleteObj = {
    dataList: new Observable<DB.IDB_service_extra_typology[]>(),
    setDataList: async () => {
      this.managerService.serviceExtraTypology_getList(true).then(serviceExtraTypologyList => {
        this.serviceExtraTypologyAutocompleteObj.dataList = this.formGroupObj.serviceExtraTypology.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.serviceExtraTypologyAutocompleteObj.filter(serviceExtraTypologyList, name) : serviceExtraTypologyList.slice())
          );
      });
    },
    display: (serviceExtraTypology: DB.IDB_service_extra_typology): string => {
      return serviceExtraTypology && serviceExtraTypology.name ? serviceExtraTypology.name : "";
    },
    filter: (serviceExtraTypologyList: DB.IDB_service_extra_typology[], filterText: string): DB.IDB_service_extra_typology[] => {
      return serviceExtraTypologyList.filter(serviceExtraTypology => serviceExtraTypology.name.toLowerCase().includes(filterText.toLowerCase()));
    },
  };

  constructor(public dialogRef: MatDialogRef<ServiceExtraExtFormComponent>, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService) { }

  async ngOnInit() {
    let user: DB.IDB_user;
    let serviceExtraTypology: DB.IDB_service_extra_typology;

    this.serviceTypology = await this.managerService.serviceTypology_getFromCode(DB.SERVICE_TYPOLOGY.EXTERNAL);

    //Valorizza i campi nel caso di modifica di evento già esistente
    if (this.serviceExtra) {
      let dateStart = new Date(this.serviceExtra.date_start);
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      //
      user = await this.managerService.user_getFromId(this.serviceExtra.id_user);
      serviceExtraTypology = await this.managerService.serviceExtraTypology_getFromId(this.serviceExtra.id_service_extra_typology);
      //
      this.serviceTask = await this.managerService.serviceTask_getFromId(this.serviceExtra.id_service_task);
      let jobDetails = await this.managerService.jobDetails_getFromId(this.serviceTask.id_job_details);
      let job = await this.managerService.job_getFromId(jobDetails.id_job);
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      //
      this.serviceTask["job_details"] = jobDetails;
      this.serviceTask["job_details"]["job"] = job;
      this.serviceTask["job_details"]["job"]["consumer"] = consumer;
      //
      this.formGroupObj.serviceTask.setValue(this.serviceTask);
      this.formGroupObj.serviceExtraTypology.setValue(serviceExtraTypology);
      this.formGroupObj.value.setValue(this.serviceExtra.value);
      this.formGroupObj.notes.setValue(this.serviceExtra.notes);
      //
      this.userAutocompleteObj.chipsObj.dataList = [user];
      this.formGroupObj.user.disable();
      this.userAutocompleteObj.chipsObj.removable = false;
    }
    else {
      let dateStart = this.dateStart ?? new Date();
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      //
      //user chip list
      if (this.serviceTask) {
        let userList = await this.managerService.serviceTask_getUserList(this.serviceTask);
        this.userAutocompleteObj.chipsObj.dataList = userList;
      }
      else {
        this.userAutocompleteObj.chipsObj.dataList = [this.authService.getUserLogged()];
      }
      //
      if (this.serviceTask) {
        if (this.serviceTask.id_job_details) {
          let jobDetails = await this.managerService.jobDetails_getFromId(this.serviceTask.id_job_details);
          jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
          let job = await this.managerService.job_getFromId(jobDetails.id_job);
          let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
          this.serviceTask["job_details"] = jobDetails;
          this.serviceTask["job_details"]["job"] = job;
          this.serviceTask["job_details"]["job"]["consumer"] = consumer;
        }
        //
        this.formGroupObj.serviceTask.setValue(this.serviceTask);
      }
    }
    //
    await this.autocomplete_loadData();
  }

  async autocomplete_loadData() {
    await this.serviceTaskAutocompleteObj.setDataList();
    await this.serviceExtraTypologyAutocompleteObj.setDataList();
    await this.userAutocompleteObj.setDataList();
  }

  //##########################################################################################
  // Eventi ##################################################################################
  //##########################################################################################

  async serviceTaskHintClick(serviceTask) {
    this.formGroupObj.serviceTask.setValue(serviceTask);
    //
    this.autocomplete_loadData();
  }

  async save() {
    this.confirmClicked = true;
    //
    let jobDetails = await this.managerService.jobDetails_getFromId(this.formGroupObj.serviceTask.value.id_job_details);
    let job = await this.managerService.job_getFromId(jobDetails.id_job);
    let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
    let userList = this.userAutocompleteObj.chipsObj.dataList;
    let serviceTask = this.formGroupObj.serviceTask.value ?? null;
    //
    for (let userk in userList) {
      let user = userList[userk];
      //
      let serviceExtra = await this.managerService.serviceExtra_inup(user, {
        service_extra: this.serviceExtra ?? null,
        service_task: serviceTask,
        date_start: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.dateService.date_getHourFirstInDay(),
        date_end: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.dateService.date_getHourLastInDay(),
        consumer: consumer,
        job: job,
        value: this.formGroupObj.value.value,
        service_typology: this.serviceTypology,
        service_extra_typology: this.formGroupObj.serviceExtraTypology.value,
        notes: this.formGroupObj.notes.value,
        is_external: "1",
      });
      //
      serviceTask = { "id": serviceExtra.id_service_task };
    }
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Spesa", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.serviceExtra_delete(this.serviceExtra);
        //
        this.dialogRef.close();
      }
    });
  }
}
