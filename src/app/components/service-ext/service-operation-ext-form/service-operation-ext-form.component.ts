import { Component, OnInit, Inject, Input, ViewChild, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { differenceInMinutes, roundToNearestMinutes, add, subMinutes, sub } from 'date-fns';
import { DateService } from 'src/app/services/date.service';
import { environment } from 'src/environments/environment';
import { AuthService } from '../../../services/auth.service'
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { CustomValidator } from 'src/app/classes/custom-validator';
import { UserSettingService } from '../../../services/user-setting.service';

@Component({
  selector: 'app-service-operation-ext-form',
  templateUrl: './service-operation-ext-form.component.html',
  styleUrls: ['./service-operation-ext-form.component.scss'],
  standalone: false
})

export class ServiceOperationExtFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceOperationExtFormComponent"); event.stopPropagation(); } }

  @Input() serviceCall!: DB.IDB_service_call;
  @Input() serviceOperation!: DB.IDB_service_operation;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;
  @Input() dateEnd;

  confirmClicked = false;

  formGroupObj = {
    dateStart: new UntypedFormControl("", [Validators.required]),
    timeStart: new UntypedFormControl("", [Validators.required]),
    timeEnd: new UntypedFormControl("", [Validators.required]),
    user: new UntypedFormControl("", [CustomValidator.object]),
    serviceTask: new UntypedFormControl("", [CustomValidator.object]),
    consumer: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    destination: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    job: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    jobDetails: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    description: new UntypedFormControl("", [Validators.required]),
    serviceOperationTypology: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    machine: new UntypedFormControl("", [CustomValidator.object]),
    isFinished: new UntypedFormControl("", [Validators.required]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  isFinishAnswerList = [
    {
      id: "0",
      name: "Intervento da concludere",
    },
    {
      id: "1",
      name: "Intervento concluso",
    }
  ];

  serviceTaskHintList: any[] = [];
  serviceTaskHintIdSelected: string;

  serviceOperationTypologyList = [];
  serviceTaskIsEditable = true;

  id_truck: string | null = null;
  truckLabel: string = "";

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
      let serviceTaskList = await this.managerService.serviceTask_getList(this.managerService.getUserList(), null, null, true);
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
      if (serviceTaskList.length == 0) {
        this.formGroupObj.serviceTask.disable();
      }
      //
      this.serviceTaskAutocompleteObj.dataList = this.formGroupObj.serviceTask.valueChanges.pipe(
        startWith(""),
        map(value => typeof value === "string" ? value : (value && value.name ? value.name : "")),
        map(name => name ? this.serviceTaskAutocompleteObj.filter(serviceTaskList, name) : serviceTaskList.slice())
      );
    },
    display: (serviceTask: DB.IDB_service_task): string => {
      if (!serviceTask) {
        return "";
      }

      let jobDetails = serviceTask["job_details"];
      let job = jobDetails ? jobDetails["job"] : null;
      let consumer = job ? job["consumer"] : null;

      if (!job || !consumer) {
        return serviceTask.code ? serviceTask.code : "";
      }

      return "(" + (job["code"] ? job["code"] : "") + ") "
        + (consumer["name"] ? consumer["name"] : "")
        + " - "
        + (serviceTask.code ? serviceTask.code : "Codice non assegnato");
    },
    filter: (serviceTaskList: DB.IDB_service_task[], filterText: string): DB.IDB_service_task[] => {
      let text = filterText ? filterText.toLowerCase() : "";

      return serviceTaskList.filter(serviceTask => {
        let code = serviceTask && serviceTask.code ? serviceTask.code.toLowerCase() : "";
        return code.includes(text);
      });
    },
    optionSelected: async (event) => {
      let serviceTask: DB.IDB_service_task = event.option.value;
      //
      let jobDetails = await this.managerService.jobDetails_getFromId(serviceTask.id_job_details);
      jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
      let job = await this.managerService.job_getFromId(jobDetails.id_job);
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      //
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.jobDetails.setValue(jobDetails);
      //
      this.autocomplete_loadData(consumer, job);
      //
      this.serviceTaskHintIdSelected = serviceTask.id.toString();
    }
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
      this.formGroupObj.serviceTask.setValue("");
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
      this.jobAutocompleteObj.setDataList();
      this.machineAutocompleteObj.setDataList();
      //
      this.serviceTaskHintIdSelected = null;
    }
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
      this.formGroupObj.serviceTask.setValue("");
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
      //
      this.serviceTaskHintIdSelected = null;
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

  constructor(public dialogRef: MatDialogRef<ServiceOperationExtFormComponent>, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService, private userSettingService: UserSettingService) {
    //
  }

  async ngOnInit() {
    let user: DB.IDB_user;
    let consumer: DB.IDB_consumer;
    let destination: DB.IDB_consumer;
    let job: DB.IDB_job;
    let jobDetails: DB.IDB_job_details;
    let machineList: DB.IDB_machine[];
    //
    this.serviceTypology = await this.managerService.serviceTypology_getFromCode(DB.SERVICE_TYPOLOGY.EXTERNAL);
    this.serviceOperationTypologyList = await this.managerService.serviceOperationTypology_getList(DB.SERVICE_TYPOLOGY.EXTERNAL);
    //
    //TRUCK
    //
    this.id_truck = null;
    this.truckLabel = "";
    //
    //EDIT
    //
    if (this.serviceOperation) {
      let dateStart = new Date(this.serviceOperation.date_start);
      let dateEnd = new Date(this.serviceOperation.date_end);
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(dateStart));
      this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(dateEnd));
      //
      //DISATTIVATI I SUGGRERIMENTI PER BUG
      //this.serviceTaskHintList = await this.managerService.serviceTask_getList(this.managerService.getUserList(), this.dateService.date_getDate(add(dateStart, { days: -5 })) + " " + this.dateService.date_getHourFirstInDay(), this.dateService.date_getDate(dateStart) + " " + this.dateService.date_getHourLastInDay(), true);
      //
      user = await this.managerService.user_getFromId(this.serviceOperation.id_user);
      jobDetails = await this.managerService.jobDetails_getFromId(this.serviceOperation.id_job_details);
      jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
      job = await this.managerService.job_getFromId(jobDetails.id_job);
      consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      this.serviceTask = await this.managerService.serviceTask_getFromId(this.serviceOperation.id_service_task);
      //
      if (this.serviceTask.id_service_call) {
        this.serviceCall = await this.managerService.serviceCall_getFromId(this.serviceTask.id_service_call);
      }
      //
      if (this.serviceTask.id_destination) {
        destination = await this.managerService.destination_getFromId(this.serviceTask.id_destination);
      }
      //
      if (this.serviceTask.id_truck) {
        this.id_truck = this.serviceTask.id_truck.toString();
      }
      //
      this.serviceTask["job_details"] = jobDetails;
      this.serviceTask["job_details"]["job"] = job;
      this.serviceTask["job_details"]["job"]["consumer"] = consumer;
      this.serviceTask["destination"] = destination;
      //
      this.formGroupObj.user.setValue(this.serviceOperation.id_user);
      this.formGroupObj.jobDetails.setValue(jobDetails);
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.destination.setValue(destination);
      this.formGroupObj.serviceTask.setValue(this.serviceTask);
      this.formGroupObj.description.setValue(this.serviceOperation.description);
      this.formGroupObj.isFinished.setValue(this.isFinishAnswerList.find(answer => answer.id == this.serviceTask.is_finished));
      //
      this.userAutocompleteObj.chipsObj.dataList = [user];
      this.formGroupObj.user.disable();
      this.userAutocompleteObj.chipsObj.removable = false;
      //
      this.serviceOperationTypologyList.map(serviceOperationTypology => {
        if (serviceOperationTypology.id == this.serviceOperation.id_service_operation_typology) {
          this.formGroupObj.serviceOperationTypology.setValue(serviceOperationTypology);
        }
      });
      //
      machineList = await this.managerService.serviceOperation_getMachineList(this.serviceOperation);
      this.machineAutocompleteObj.chipsObj.dataList = machineList;
    }
    //
    //FROM_SERVICE_CALL
    //
    else if (this.serviceCall) {
      let dateStart = new Date(this.serviceCall.date_start);
      let dateEnd = new Date(this.serviceCall.date_end);
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(dateStart));
      this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(dateEnd));
      //
      var userList = await this.managerService.serviceCall_getUserList(this.serviceCall);
      this.userAutocompleteObj.chipsObj.dataList = userList;
      //
      machineList = await this.managerService.serviceCall_getMachineList(this.serviceCall);
      this.machineAutocompleteObj.chipsObj.dataList = machineList;
      //
      if (this.serviceCall.id_job_details) {
        jobDetails = await this.managerService.jobDetails_getFromId(this.serviceCall.id_job_details);
        jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
        job = await this.managerService.job_getFromId(jobDetails.id_job);
        consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      }
      else {
        consumer = await this.managerService.consumer_getFromId(this.serviceCall.id_consumer);
        job = await this.managerService.job_getFromId(this.serviceCall.id_job);
      }
      //
      if (this.serviceCall.id_destination) {
        destination = await this.managerService.destination_getFromId(this.serviceCall.id_destination);
      }
      //
      this.id_truck = this.userSettingService.getLocalStorage("id_truck_current");
      //
      this.formGroupObj.jobDetails.setValue(jobDetails);
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.destination.setValue(destination);
    }
    //
    //NEW
    //
    else {
      let dateStart = roundToNearestMinutes(new Date(this.dateStart ?? new Date()), { nearestTo: environment.service_operation_step_minutes });
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
      //
      if (this.dateEnd) {
        let dateEnd = roundToNearestMinutes(new Date(this.dateEnd ?? add(new Date(), { hours: 1 })), { nearestTo: environment.service_operation_step_minutes });
        this.formGroupObj.timeStart.setValue(this.dateService.date_getTimeHourMinute(dateStart));
        this.formGroupObj.timeEnd.setValue(this.dateService.date_getTimeHourMinute(dateEnd));
      }
      //
      //user chip list
      if (this.serviceTask) {
        let userList = await this.managerService.serviceTask_getUserList(this.serviceTask);
        this.userAutocompleteObj.chipsObj.dataList = userList;
        //
        if (this.serviceTask.id_service_call) {
          this.serviceCall = await this.managerService.serviceCall_getFromId(this.serviceTask.id_service_call);
        }
      }
      else {
        this.userAutocompleteObj.chipsObj.dataList = [this.authService.getUserLogged()];
      }
      //
      this.id_truck = this.userSettingService.getLocalStorage("id_truck_current");
      //
      //DISATTIVATI I SUGGRERIMENTI PER BUG
      //this.serviceTaskHintList = await this.managerService.serviceTask_getList(this.managerService.getUserList(), this.dateService.date_getDate(add(dateStart, { days: -5 })) + " " + this.dateService.date_getHourFirstInDay(), this.dateService.date_getDate(dateStart) + " " + this.dateService.date_getHourLastInDay(), true);
      //
      if (this.serviceTask) {
        await this.serviceTaskHintClick(this.serviceTask, false);
      }
    }
    //
    //TRUCK
    //
    if (this.id_truck) {
      this.managerService.truck_getFromId(parseInt(this.id_truck)).then(truck => {
        this.truckLabel = truck ? truck.code + " - " + truck.name : "Nessun furgone selezionato";
      });
    } else {
      this.truckLabel = "Nessun furgone selezionato";
    }
    //
    if (this.serviceOperation || this.serviceTask) {
      this.serviceTaskIsEditable = await this.managerService.serviceTask_isEditable(this.serviceTask);
      //
      if (!this.serviceTaskIsEditable) {
        this.formGroup.disable();
        this.userAutocompleteObj.chipsObj.removable = false;
        this.machineAutocompleteObj.chipsObj.removable = false;
      } else {
        this.formGroupObj.serviceTask.disable();
        this.formGroupObj.consumer.disable();
        this.formGroupObj.destination.disable();
        this.formGroupObj.job.disable();
        this.formGroupObj.isFinished.disable();
      }
    }
    else if (this.serviceCall) {
      this.formGroupObj.consumer.disable();
    }
    //
    /*
    if (this.serviceTaskHintList.length > 0) {
      this.serviceTaskHintList = await this.idbService.join(this.serviceTaskHintList, [
        {
          field: "id_job_details", table: "job_details", joinType: "LEFT", joinList: [{
            field: "id_job", table: "job", joinList: [{
              field: "id_consumer", table: "consumer"
            }]
          }]
        }
      ]);
    }
      */
    //
    if (this.serviceTaskIsEditable) {
      await this.autocomplete_loadData(consumer, job);
    }
  }

  async autocomplete_loadData(consumer: DB.IDB_consumer, job: DB.IDB_job) {
    await this.serviceTaskAutocompleteObj.setDataList();
    await this.consumerAutocompleteObj.setDataList();
    await this.userAutocompleteObj.setDataList();

    await this.jobAutocompleteObj.setDataList();
    await this.machineAutocompleteObj.setDataList();

    if (job && job.id) {
      await this.jobDetailsAutocompleteObj.setDataList();
    }
  }

  async serviceTaskHintClick(serviceTask, isSelected) {
    if (!isSelected) {
      this.serviceTaskHintIdSelected = serviceTask.id;
      //
      let jobDetails = await this.managerService.jobDetails_getFromId(serviceTask.id_job_details);
      jobDetails["job_details_action"] = await this.managerService.jobDetailsAction_getFromId(jobDetails.id_job_details_action);
      let job = await this.managerService.job_getFromId(jobDetails.id_job);
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      //
      let destination = null;
      if (serviceTask.id_destination) {
        destination = await this.managerService.destination_getFromId(serviceTask.id_destination);
      }
      //
      this.formGroupObj.serviceTask.setValue(serviceTask);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.destination.setValue(destination);
      this.formGroupObj.job.setValue(job);
      this.formGroupObj.jobDetails.setValue(jobDetails);
      this.formGroupObj.isFinished.setValue(this.isFinishAnswerList.find(answer => answer.id == serviceTask.is_finished));
      //
      this.formGroupObj.serviceTask.disable();
      this.formGroupObj.consumer.disable();
      this.formGroupObj.destination.disable();
      this.formGroupObj.job.disable();
      this.formGroupObj.isFinished.disable();
      //
      this.autocomplete_loadData(consumer, job);
    }
    else {
      this.serviceTaskHintIdSelected = null;
      //
      this.formGroupObj.serviceTask.setValue("");
      this.formGroupObj.consumer.setValue("");
      this.formGroupObj.destination.setValue("");
      this.formGroupObj.job.setValue("");
      this.formGroupObj.jobDetails.setValue("");
      //
      this.formGroupObj.serviceTask.enable();
      this.formGroupObj.consumer.enable();
      this.formGroupObj.destination.enable();
      this.formGroupObj.job.enable();
      //
      this.autocomplete_loadData(null, null);
    }
  }

  async save() {
    this.confirmClicked = true;
    //
    let machineList = this.machineAutocompleteObj.chipsObj.dataList;
    let userList = this.userAutocompleteObj.chipsObj.dataList;
    let serviceTask = this.formGroupObj.serviceTask.value ?? null;
    //
    for (let userk in userList) {
      let user = userList[userk];
      //
      let serviceOperation = await this.managerService.serviceOperation_inup(user,
        {
          service_operation: this.serviceOperation ?? null,
          service_task: serviceTask,
          service_call: this.serviceCall ?? null,
          service_typology: this.serviceTypology,
          date_start: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeStart.value,
          date_end: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.formGroupObj.timeEnd.value,
          consumer: this.formGroupObj.consumer.value,
          destination: this.formGroupObj.destination.value,
          job_details: this.formGroupObj.jobDetails.value,
          description: this.formGroupObj.description.value,
          service_operation_typology: this.formGroupObj.serviceOperationTypology.value,
          is_external: "1",
          is_finished: this.formGroupObj.isFinished.value.id,
          id_truck: this.id_truck ? parseInt(this.id_truck) : null,
        },
        machineList
      );
      //
      serviceTask = { "id": serviceOperation.id_service_task };
    }
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Operazione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
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

  machine_getString(machine: DB.IDB_machine) {
    if (!machine) {
      return "";
    }
    //
    let machineString = machine.name;
    //
    return machineString;
  }
}
