import { Component, OnInit, Input, HostListener, ElementRef, ViewChild } from '@angular/core';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { SyncService } from 'src/app/services/sync.service';
import { ManagerService } from 'src/app/services/manager.service';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { MatDialogRef } from '@angular/material/dialog';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactFormComponent } from '../../contact/contact-form/contact-form.component';
import { CustomValidator } from 'src/app/classes/custom-validator';
import { ServiceCallFormComponent } from '../service-call-form/service-call-form.component';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-service-call-select-form',
  templateUrl: './service-call-select-form.component.html',
  styleUrls: ['./service-call-select-form.component.scss'],
  standalone: false
})

export class ServiceCallSelectFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCallSelectFormComponent"); event.stopPropagation(); } }

  @Input() dateStart;
  @Input() dateEnd;
  @Input() onAfterClosed;

  serviceCall: DB.IDB_service_call;

  formGroupObj = {
    serviceCall: new UntypedFormControl("", [CustomValidator.object, Validators.required]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  serviceCallAutocompleteObj = {
    dataList: new Observable<DB.IDB_service_call[]>(),
    setDataList: async () => {
      let serviceCallStatusNew = await this.managerService.serviceCallStatus_getFromCode(DB.SERVICE_CALL_STATUS.NEW);
      //
      this.managerService.serviceCall_getList(this.managerService.getUserList(), null, null, [serviceCallStatusNew]).then(serviceCallList => {
        this.serviceCallAutocompleteObj.dataList = this.formGroupObj.serviceCall.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : (value ? this.serviceCall_getString(value) : "")),
            map(value => this.serviceCallAutocompleteObj.filter(serviceCallList, value))
          );
      });
    },
    display: (serviceCall: DB.IDB_service_call): string => {
      return this.serviceCall_getString(serviceCall);
    },
    filter: (serviceCallList: DB.IDB_service_call[], filterText: string): DB.IDB_service_call[] => {
      let serviceCallSelectableList = [];
      //
      for (let serviceCallK in serviceCallList) {
        let serviceCall = serviceCallList[serviceCallK];
        //
        let found = false;
        for (let serviceCallField_ServiceCallSelectedK in this.serviceCallAutocompleteObj.dataList) {
          let serviceCallField_ServiceCallSelected = this.serviceCallAutocompleteObj.dataList[serviceCallField_ServiceCallSelectedK];
          //
          if (serviceCall.id == serviceCallField_ServiceCallSelected.id) {
            found = true;
            break;
          }
        }
        //
        if (!found) {
          serviceCallSelectableList.push(serviceCall);
        }
      }
      //
      return serviceCallSelectableList.filter(serviceCall => (this.serviceCall_getString(serviceCall).toLowerCase()).includes(filterText.toLowerCase()));
    }
  };

  constructor(
    public dialogRef: MatDialogRef<ServiceCallSelectFormComponent>,
    private idbService: IdbService,
    private syncService: SyncService,
    private managerService: ManagerService,
    public snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.serviceCallAutocompleteObj.setDataList();
  }

  serviceCall_getString(serviceCall: DB.IDB_service_call) {
    if (!serviceCall) {
      return "";
    }

    let job = serviceCall["job"] ? serviceCall["job"] : null;
    let consumer = serviceCall["consumer"] ? serviceCall["consumer"] : null;

    let dateString = serviceCall.date_create ? formatDate(serviceCall.date_create, "dd/MM/yyyy", "en-EN") : "";
    let jobCode = job && job["code"] ? job["code"] : "";
    let consumerName = consumer && consumer["name"] ? consumer["name"] : "";
    let description = serviceCall.description ? serviceCall.description : "";
    let machineList = serviceCall["_machine_list"] ? " (" + serviceCall["_machine_list"] + ")" : "";

    return dateString
      + (jobCode ? " - [" + jobCode + "]" : "")
      + (consumerName ? " " + consumerName : "")
      + (description ? ": " + description : "")
      + machineList;
  }

  async openServiceCall() {
    this.dialogRef.close();
    //
    //TODO apro form call
    //
    let dialog = this.managerService.dialog_open(ServiceCallFormComponent, "Crea Appuntamento", true, true, { width: "50%", height: "800px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceCallFormComponent;
    //
    component.serviceCall = this.formGroupObj.serviceCall.value;
    component.dateStart = this.dateStart;
    component.dateEnd = this.dateEnd;
    component.isTicketSchedulationMode = true;
    //
    dialog.afterClosed().subscribe(async () => {
      this.onAfterClosed();
    });
  }
}
