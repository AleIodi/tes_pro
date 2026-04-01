import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

import { ManagerService } from '../../../services/manager.service'

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { DateService } from 'src/app/services/date.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-service-details-int',
    templateUrl: './service-details-int.component.html',
    styleUrls: ['./service-details-int.component.scss'],
    standalone: false
})

export class ServiceDetailsIntComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceDetailsIntComponent"); event.stopPropagation(); } }

  @Input() _title: string  = "";
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;
  @Input() dateEnd;

  extraObj = {
    HOLIDAY: {
      enabled: undefined,
      value: undefined,
    },
    TICKET: {
      enabled: undefined,
      value: undefined,
    },
    DISEASE: {
      enabled: undefined,
      value: undefined,
    },
    MATERNITY: {
      enabled: undefined,
      value: undefined,
    },
    ROL: {
      enabled: undefined,
      value: undefined,
      formControl: new UntypedFormControl(),
    },
  }

  constructor(private idbService: IdbService, private managerService: ManagerService, private dateService: DateService, private authService: AuthService) { }

  async ngOnInit() {
    let serviceExtraTypologyList = await this.managerService.serviceExtraTypology_getList(false);
    //
    //CHECK SERVICE_EXTRA_TYPOLOGY ENABLED
    //
    for (let serviceExtraTypologyK in serviceExtraTypologyList) {
      let serviceExtraTypology = serviceExtraTypologyList[serviceExtraTypologyK];
      //
      if (this.extraObj[serviceExtraTypology.code] && serviceExtraTypology.enabled) {
        this.extraObj[serviceExtraTypology.code].enabled = true;
      }
    }
    //
    //GET SERVICE_EXTRA DATA
    //
    let dateStart_dayRange = this.dateService.date_getDayRange(this.dateStart);
    //
    let serviceExtraList = await this.managerService.serviceExtra_getList(this.managerService.getUserList(),this.serviceTask, DB.SERVICE_TYPOLOGY.INTERNAL, false, dateStart_dayRange[0], dateStart_dayRange[1]);
    serviceExtraList = await this.idbService.join(serviceExtraList, [{ field: "id_service_extra_typology", table: "service_extra_typology" }]);
    for (let serviceExtraK in serviceExtraList) {
      let serviceExtra = serviceExtraList[serviceExtraK];
      //
      if (this.extraObj && this.extraObj[serviceExtra["service_extra_typology"]["code"]]) {
        //formControl
        if (this.extraObj[serviceExtra["service_extra_typology"]["code"]].formControl) {
          this.extraObj[serviceExtra["service_extra_typology"]["code"]].formControl.setValue(serviceExtra.value);
        }
        //checkbox
        else {
          this.extraObj[serviceExtra["service_extra_typology"]["code"]].value = parseInt(serviceExtra.value);
        }
      }
    }
  }

  async serviceExtraChange(event, serviceExtraTypologyCode) {
    let dateStart_dayRange = this.dateService.date_getDayRange(this.dateStart);
    //
    let serviceExtraTypology = await this.managerService.serviceExtraTypology_getFromCode(serviceExtraTypologyCode);
    let serviceExtraList = await this.managerService.serviceExtra_getListFromServiceExtraTypologyList([serviceExtraTypology], null, this.serviceTask, dateStart_dayRange[0], dateStart_dayRange[1]);
    let serviceExtra = serviceExtraList && serviceExtraList.length > 0 ? serviceExtraList[0] : null;
    let serviceTypology = await this.managerService.serviceTypology_getFromCode(DB.SERVICE_TYPOLOGY.INTERNAL);
    //
    let serviceExtraValue = "0";
    //formControl
    if (this.extraObj && this.extraObj[serviceExtraTypologyCode] && this.extraObj[serviceExtraTypologyCode].formControl) {
      serviceExtraValue = this.extraObj[serviceExtraTypologyCode].formControl.value;
    }
    //checkbox
    else {
      serviceExtraValue = event.checked ? "1" : "0";
    }
    //
    this.managerService.serviceExtra_inup(this.authService.getUserLogged(), {
      service_extra: serviceExtra ?? null,
      date_start: this.dateStart,
      date_end: this.dateStart,
      consumer: null, //TODO
      job: null, //TODO
      value: serviceExtraValue,
      service_extra_typology: serviceExtraTypology,
      service_typology: serviceTypology,
      notes: "",
      is_external: "0",
    });
  }
}
