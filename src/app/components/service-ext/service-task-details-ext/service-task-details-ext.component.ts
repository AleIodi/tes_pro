import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

import { ManagerService } from '../../../services/manager.service'

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { UserSettingService } from '../../../services/user-setting.service';

import { ReportReportComponent } from '../../report/report-report/report-report.component';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service'
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-service-task-details-ext',
    templateUrl: './service-task-details-ext.component.html',
    styleUrls: ['./service-task-details-ext.component.scss'],
    standalone: false
})

export class ServiceTaskDetailsExtComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTaskDetailsExtComponent"); event.stopPropagation(); } }

  @Input() _title: string  = "";
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;
  @Input() dateEnd;

  consumer!: DB.IDB_consumer;
  isEditable = false;
  serviceTaskIsEditable = true;
  currentTruck: DB.IDB_truck | null = null;

  formGroupObj = {
    contact: new UntypedFormControl("", [CustomValidator.object]),
    description: new UntypedFormControl("", []),
    notes: new UntypedFormControl("", []),
    notes_internal: new UntypedFormControl("", []),
    truck: new UntypedFormControl({ value: "", disabled: true }, []),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  contactAutocompleteObj = {
    dataList: new Observable<DB.IDB_contact[]>(),
    setDataList: async () => {
      this.managerService.contact_getList(this.consumer).then(contactList => {
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

  constructor(private idbService: IdbService, private managerService: ManagerService, private matDialog: MatDialog, private authService: AuthService, private userSettingService: UserSettingService) {
    let truckId = this.userSettingService.getLocalStorage("id_truck_current");
    if (truckId) {
      this.managerService.truck_getFromId(parseInt(truckId)).then(truck => {
        this.currentTruck = truck ?? null;
        this.formGroupObj.truck.setValue(truck ? truck.code + " - " + truck.name : "Nessun Furgone selezionato");
      });
    } else {
      this.formGroupObj.truck.setValue("Nessun Furgone selezionato");
    }
  }

  async ngOnInit() {
    if (this.serviceTask) {
      this.serviceTaskIsEditable = this.serviceTask["service_task_report"] ? this.serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
      //
      let job_details = await this.managerService.jobDetails_getFromId(this.serviceTask["id_job_details"]);
      let job = await this.managerService.job_getFromId(job_details["id_job"]);
      //
      this.consumer = await this.managerService.consumer_getFromId(job["id_consumer"]);
    }
    //
    this.formGroupObj.description.setValue(this.serviceTask.description);
    this.formGroupObj.notes.setValue(this.serviceTask.notes);
    this.formGroupObj.notes_internal.setValue(this.serviceTask.notes_internal);
    //
    if (this.serviceTask.id_contact) {
      let contact = await this.managerService.contact_getFromId(this.serviceTask.id_contact);
      this.formGroupObj.contact.setValue(contact);
    }
    //
    this.autocomplete_loadData();
    this.serviceTask_setEditable(false);
  }

  autocomplete_loadData() {
    this.contactAutocompleteObj.setDataList();
  }

  async serviceTask_setEditable(isEditable: boolean) {
    this.isEditable = isEditable;
    //
    if (this.isEditable) {
      for (let [k, formControl] of Object.entries(this.formGroupObj)) {
        if (k !== "truck") formControl.enable();
      }
    }
    else {
      for (let [k, formControl] of Object.entries(this.formGroupObj)) {
        if (k !== "truck") formControl.disable();
      }
    }
  }

  async serviceTask_save() {
    this.managerService.serviceTask_setDescription(this.serviceTask, this.formGroupObj.description.value);
    //
    let serviceTaskArr = {
      id: this.serviceTask.id,
      description: this.formGroupObj.description.value,
      id_contact: this.formGroupObj.contact.value.id,
      notes: this.formGroupObj.notes.value,
      notes_internal: this.formGroupObj.notes_internal.value,
      to_push: "1",
    };
    this.serviceTask = await this.idbService.inup<DB.IDB_service_task>("service_task", serviceTaskArr, ["id"]);
    //
    this.serviceTask_setEditable(false);
  }

  async report() {
    let serviceTaskReport = await this.managerService.serviceTaskReport_getOrCreateFromServiceTask(this.authService.getUserLogged(), this.serviceTask);
    //
    let dialog = this.managerService.dialog_open(ReportReportComponent, "Report", true, false, { width: "90%", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as ReportReportComponent;
    //
    component.serviceTaskReport = serviceTaskReport;
  }
}
