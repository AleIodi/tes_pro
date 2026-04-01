import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { addHours } from 'date-fns'

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { DateService } from 'src/app/services/date.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-service-operation-int-form',
    templateUrl: './service-operation-int-form.component.html',
    styleUrls: ['./service-operation-int-form.component.scss'],
    standalone: false
})

export class ServiceOperationIntFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceOperationIntFormComponent"); event.stopPropagation(); } }

  @Input() serviceOperation!: DB.IDB_service_operation;
  @Input() dateStart;
  @Input() dateEnd;

  confirmClicked = false;

  //
  //TODO - Sistemare la come le form nuove
  //

  formGroupObj = {
    dateStart: new UntypedFormControl("", [Validators.required]),
    hours: new UntypedFormControl("", [Validators.required]),
    consumer: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    job: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    jobDetails: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    description: new UntypedFormControl("", [Validators.required]),
    serviceOperationTypology: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  serviceOperationTypologyList = [];

  serviceTypology: DB.IDB_service_typology;

  consumerAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: async () => {
      this.managerService.consumer_getList().then(consumerList => {
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
      this.formGroupObj.job.setValue("");
      this.formGroupObj.jobDetails.setValue("");
      //
      this.jobAutocompleteObj.dataList = null;
      this.jobDetailsAutocompleteObj.dataList = null;
      //
      this.jobAutocompleteObj.setDataList();
    }
  };

  jobAutocompleteObj = {
    dataList: new Observable<DB.IDB_job[]>(),
    setDataList: async () => {
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
      return jobList.filter(job => job.name.toLowerCase().includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let job: DB.IDB_job = event.option.value;
      //
      this.formGroupObj.jobDetails.setValue("");
      this.jobDetailsAutocompleteObj.dataList = null;
      //
      this.jobDetailsAutocompleteObj.setDataList();
    }
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
  };

  constructor(public dialogRef: MatDialogRef<ServiceOperationIntFormComponent>, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService) { }

  async ngOnInit() {
    let consumer: DB.IDB_consumer;
    let job: DB.IDB_job;
    let jobDetails: DB.IDB_job_details;
    //
    this.serviceTypology = await this.managerService.serviceTypology_getFromCode(DB.SERVICE_TYPOLOGY.INTERNAL);
    this.serviceOperationTypologyList = await this.managerService.serviceOperationTypology_getList(DB.SERVICE_TYPOLOGY.INTERNAL);
    //
    if (this.serviceOperation) {
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(this.serviceOperation.date_start));
      this.formGroupObj.hours.setValue(this.managerService.serviceOperation_getWorkHours(this.serviceOperation));
      //
      jobDetails = await this.managerService.jobDetails_getFromId(this.serviceOperation.id_job_details);
      jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
      job = await this.managerService.job_getFromId(jobDetails.id_job);
      consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      //
      this.formGroupObj.jobDetails.setValue(jobDetails);
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.description.setValue(this.serviceOperation.description);
    }
    else {
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(this.dateStart ?? new Date()));
      this.formGroupObj.hours.setValue(1);
    }

    this.autocomplete_loadData(consumer, job);
  }

  autocomplete_loadData(consumer: DB.IDB_consumer, job: DB.IDB_job) {
    this.consumerAutocompleteObj.setDataList();

    if (consumer && consumer.id) {
      this.jobAutocompleteObj.setDataList();
    }

    if (job && job.id) {
      this.jobDetailsAutocompleteObj.setDataList();
    }
  }

  async save() {
    this.confirmClicked = true;
    //
    let dateStart = this.formGroupObj.dateStart.value + " " + this.dateService.date_getHourFirstInDay();
    let dateEnd = this.dateService.date_getDateTime(addHours(new Date(dateStart), this.formGroupObj.hours.value));
    //
    await this.managerService.serviceOperation_inup(this.authService.getUserLogged(), {
      service_operation: this.serviceOperation ?? null,
      date_start: dateStart,
      date_end: dateEnd,
      consumer: this.formGroupObj.consumer.value,
      job_details: this.formGroupObj.jobDetails.value,
      description: this.formGroupObj.description.value,
      service_typology: this.serviceTypology,
      service_operation_typology: this.formGroupObj.serviceOperationTypology.value,
      is_external: "0",
      is_finished: null,
    });
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
        this.managerService.serviceOperation_delete(this.serviceOperation);
        //
        this.dialogRef.close();
      }
    });
  }
}
