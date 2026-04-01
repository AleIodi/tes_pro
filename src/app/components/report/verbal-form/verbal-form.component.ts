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
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../../shared/notification/notification.component';

@Component({
    selector: 'app-verbal-form',
    templateUrl: './verbal-form.component.html',
    styleUrls: ['./verbal-form.component.scss'],
    standalone: false
})
export class VerbalFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalFormComponent"); event.stopPropagation(); } }

  @Input() autodopVerbal!: DB.IDB_autodop_verbal;
  @Input() dateCreate;

  confirmClicked = false;

  formGroupObj = {
    autodopVerbalTypology: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    dateCreate: new UntypedFormControl("", [Validators.required]),
    user: new UntypedFormControl("", [CustomValidator.object]),
    consumer: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    destination: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    job: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    machine: new UntypedFormControl("", [CustomValidator.object]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  autodopVerbalTypologyList = [];
  autodopVerbalIsEditable = true;

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
      return userList.filter(user => (user.name_first + " " + user.name_last).toLowerCase().includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let user: DB.IDB_user = event.option.value;
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
      this.formGroupObj.destination.setValue("");
      this.formGroupObj.job.setValue("");
      this.formGroupObj.machine.setValue("");
      //
      this.destinationAutocompleteObj.dataList = null;
      this.jobAutocompleteObj.dataList = null;
      this.machineAutocompleteObj.dataList = null;
      //
      this.destinationAutocompleteObj.setDataList();
      this.jobAutocompleteObj.setDataList();
      this.machineAutocompleteObj.setDataList();
    }
  };

  destinationAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: () => {
      let consumer: DB.IDB_consumer = this.formGroupObj.consumer.value ? this.formGroupObj.consumer.value : null;
      //
      this.managerService.destination_getList(consumer).then(destinationList => {
        /*
        //TODO - concatenare sede autodop
        this.managerService.destination_getFromCode("C000029").then(destination_autodop => {
          destinationList.push(destination_autodop);
          */
        //
        this.destinationAutocompleteObj.dataList = this.formGroupObj.destination.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.destinationAutocompleteObj.filter(destinationList, name) : destinationList.slice())
          );
        //});
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
      this.machineAutocompleteObj.dataList = null;
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
      this.jobAutocompleteObj.dataList = null;
      //
      let consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      this.jobAutocompleteObj.setDataList();
      this.machineAutocompleteObj.setDataList();
      //
      this.formGroupObj.consumer.setValue(consumer);
    }
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
      return machineList.filter(machine => (this.machine_getString(machine).toLowerCase()).includes(filterText.toLowerCase()));
    }
  };

  constructor(public dialogRef: MatDialogRef<VerbalFormComponent>, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService, public snackBar: MatSnackBar) { }

  async ngOnInit() {
    let user: DB.IDB_user;
    let consumer: DB.IDB_consumer;
    let destination: DB.IDB_consumer;
    let job: DB.IDB_job;
    //
    this.autodopVerbalTypologyList = await this.managerService.autodopVerbalTypology_getList();
    //
    if (this.autodopVerbal) {
      let dateCreate = new Date(this.autodopVerbal.date_create);
      //
      this.formGroupObj.dateCreate.setValue(this.dateService.date_getDate(dateCreate));
      //
      user = await this.managerService.user_getFromId(this.autodopVerbal.id_user);
      job = await this.managerService.job_getFromId(this.autodopVerbal.id_job);
      consumer = await this.managerService.consumer_getFromId(job.id_consumer);
      if (this.autodopVerbal.id_destination) {
        destination = await this.managerService.destination_getFromId(this.autodopVerbal.id_destination);
      }
      //
      this.formGroupObj.user.setValue(user);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.destination.setValue(destination);
      this.formGroupObj.job.setValue(job);
      //
      this.autodopVerbalTypologyList.map(autodopVerbalTypology => {
        if (autodopVerbalTypology.id == this.autodopVerbal.id_autodop_verbal_typology) {
          this.formGroupObj.autodopVerbalTypology.setValue(autodopVerbalTypology);
        }
      });
    }
    else {
      let dateCreate = this.dateCreate ?? new Date();
      this.formGroupObj.dateCreate.setValue(this.dateService.date_getDate(dateCreate));
      this.formGroupObj.user.setValue(this.authService.getUserLogged());
    }
    //
    /*
    if (this.autodopVerbal) {
      this.autodopVerbalIsEditable = await this.managerService.serviceTask_isEditable(this.serviceTask);
      //
      if (!this.autodopVerbalIsEditable) {
        this.formGroup.disable();
      } else {
        this.formGroupObj.serviceTask.disable();
        this.formGroupObj.consumer.disable();
        this.formGroupObj.destination.disable();
        this.formGroupObj.job.disable();
      }
    }
    */
    //
    if (this.autodopVerbalIsEditable) {
      await this.autocomplete_loadData(consumer, job);
    }
  }

  async autocomplete_loadData(consumer: DB.IDB_consumer, job: DB.IDB_job) {
    await this.consumerAutocompleteObj.setDataList();
    await this.userAutocompleteObj.setDataList();
  }

  async save() {
    this.confirmClicked = true;
    //
    if(
      !this.formGroupObj.machine.value["name"].toUpperCase().includes("ERGON") &&
      !this.formGroupObj.machine.value["name"].toUpperCase().includes("DIONISO") &&
      !this.formGroupObj.machine.value["name"].toUpperCase().includes("KRONOS") &&
      !this.formGroupObj.machine.value["name"].toUpperCase().includes("ELETTRA") &&
      !this.formGroupObj.machine.value["name"].toUpperCase().includes("MAIA") &&
      !this.formGroupObj.machine.value["name"].toUpperCase().includes("ALCIONE")
    )
    {
      this.snackBar.openFromComponent(NotificationComponent, {
        duration: 3000,
        data: {
          text: "Tipologia verbale non presente"
        },
      });
      return;
    }
    //
    let autodopVerbal = await this.managerService.autodopVerbal_create(this.formGroupObj.user.value,
      {
        autodop_verbal_typology: this.formGroupObj.autodopVerbalTypology.value,
        date_create: this.formGroupObj.dateCreate.value,
        destination: this.formGroupObj.destination.value,
        job: this.formGroupObj.job.value,
        machine: this.formGroupObj.machine.value,
      }
    );
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Verbale", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.autodopVerbal_delete(this.autodopVerbal);
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
}
