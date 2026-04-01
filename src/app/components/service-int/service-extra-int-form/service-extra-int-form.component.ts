import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { add } from 'date-fns';
import { DateService } from 'src/app/services/date.service';
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-service-extra-int-form',
    templateUrl: './service-extra-int-form.component.html',
    styleUrls: ['./service-extra-int-form.component.scss'],
    standalone: false
})

export class ServiceExtraIntFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceExtraIntFormComponent"); event.stopPropagation(); } }

  @Input() serviceExtra!: DB.IDB_service_extra;
  @Input() dateStart;

  confirmClicked = false;

  formGroupObj = {
    dateStart: new UntypedFormControl("", [Validators.required]),
    consumer: new UntypedFormControl("", [Validators.required]),
    job: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    serviceExtraTypology: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    value: new UntypedFormControl("", [Validators.required, CustomValidator.number]),
    notes: new UntypedFormControl("", []),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

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
      //
      this.jobAutocompleteObj.dataList = null;
      //
      this.jobAutocompleteObj.setDataList(consumer);
    },
  };

  jobAutocompleteObj = {
    dataList: new Observable<DB.IDB_job[]>(),
    setDataList: async (consumer: DB.IDB_consumer) => {
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

  jobHintList: DB.IDB_job[] = [];
  jobHintCodeSelected: string;

  constructor(public dialogRef: MatDialogRef<ServiceExtraIntFormComponent>, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService) { }

  async ngOnInit() {
    let consumer: DB.IDB_consumer;
    let job: DB.IDB_job;
    let serviceExtraTypology: DB.IDB_service_extra_typology;

    this.serviceTypology = await this.managerService.serviceTypology_getFromCode(DB.SERVICE_TYPOLOGY.INTERNAL);

    //Valorizza i campi nel caso di modifica di evento già esistente
    if (this.serviceExtra) {
      let dateStart = new Date(this.serviceExtra.date_start);
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      //
      this.jobHintList = await this.managerService.job_getList(null, this.dateService.date_getDate(dateStart) + " " + this.dateService.date_getHourFirstInDay(), this.dateService.date_getDate(add(dateStart, { days: 1 })) + " " + this.dateService.date_getHourFirstInDay());
      //
      job = await this.managerService.job_getFromId(this.serviceExtra.id_job);
      consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      serviceExtraTypology = await this.managerService.serviceExtraTypology_getFromId(this.serviceExtra.id_service_extra_typology);
      //
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.serviceExtraTypology.setValue(serviceExtraTypology);
      this.formGroupObj.value.setValue(this.serviceExtra.value);
      this.formGroupObj.notes.setValue(this.serviceExtra.notes);
    }
    else {
      let dateStart = this.dateStart ?? new Date();
      //
      this.jobHintList = await this.managerService.job_getList(null, this.dateService.date_getDate(dateStart) + " " + this.dateService.date_getHourFirstInDay(), this.dateService.date_getDate(add(dateStart, { days: 1 })) + " " + this.dateService.date_getHourFirstInDay());
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
    }

    this.autocomplete_loadData(consumer, job);
  }

  autocomplete_loadData(consumer: DB.IDB_consumer, job: DB.IDB_job) {
    this.consumerAutocompleteObj.setDataList();

    if (consumer && consumer.id) {
      this.jobAutocompleteObj.setDataList(consumer);
    }

    this.serviceExtraTypologyAutocompleteObj.setDataList();
  }

  //##########################################################################################
  // Eventi ##################################################################################
  //##########################################################################################

  async jobHintClick(job) {
    this.jobHintCodeSelected = job.code;
    //
    let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
    //
    this.formGroupObj.job.setValue(job);
    this.formGroupObj.consumer.setValue(consumer);
    //
    this.autocomplete_loadData(consumer, job);
  }

  async save() {
    this.confirmClicked = true;
    //
    let dateStart = this.formGroupObj.dateStart.value + " " + this.dateService.date_getHourFirstInDay();
    //
    this.managerService.serviceExtra_inup(this.authService.getUserLogged(), {
      service_extra: this.serviceExtra ?? null,
      date_start: dateStart,
      date_end: dateStart,
      consumer: this.formGroupObj.consumer.value,
      job: this.formGroupObj.job.value,
      value: this.formGroupObj.value.value,
      service_typology: this.serviceTypology,
      service_extra_typology: this.formGroupObj.serviceExtraTypology.value,
      notes: this.formGroupObj.notes.value,
      is_external: "0",
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
        this.managerService.serviceExtra_delete(this.serviceExtra);
        //
        this.dialogRef.close();
      }
    });
  }
}
