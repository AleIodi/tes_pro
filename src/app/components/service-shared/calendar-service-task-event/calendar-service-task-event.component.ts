import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'

import { differenceInCalendarDays, addDays, differenceInMinutes } from 'date-fns'
import { formatDate } from '@angular/common';
import { HostListener } from '@angular/core';
import { DateService } from 'src/app/services/date.service';
import { AuthService } from 'src/app/services/auth.service';
import { ServiceCallFormComponent } from '../../service-call/service-call-form/service-call-form.component';

@Component({
    selector: 'app-calendar-service-task-event',
    templateUrl: './calendar-service-task-event.component.html',
    styleUrls: ['./calendar-service-task-event.component.scss'],
    standalone: false
})

export class CalendarServiceTaskEventComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("CalendarServiceTaskEventComponent"); event.stopPropagation(); } }

  @Input() context;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() color!: string;
  @Input() textColor!: string;

  @Output() eventClickEmitter = new EventEmitter<any>();

  serviceTaskEventList = [];
  showEvents = false;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService, private dateService: DateService) { }

  async ngOnInit() {
    let userLogged = this.authService.getUserLogged();
    this.showEvents = false;
    //
    let serviceTaskDayDiff = 1 + differenceInCalendarDays(new Date(this.serviceTask.date_end), new Date(this.serviceTask.date_start));
    //
    for (let dayOffset = 0; dayOffset < serviceTaskDayDiff; dayOffset++) {
      let date = addDays(new Date(this.serviceTask.date_start), dayOffset);
      let date_dayRange = this.dateService.date_getDayRange(date);
      //
      let serviceOperationList = await this.managerService.serviceOperation_getList(this.managerService.getUserList(), this.serviceTask, DB.SERVICE_TYPOLOGY.EXTERNAL, date_dayRange[0], date_dayRange[1]);
      let serviceTripList = await this.managerService.serviceTrip_getList(this.managerService.getUserList(), this.serviceTask, date_dayRange[0], date_dayRange[1]);
      let serviceExtraList = await this.managerService.serviceExtra_getList(this.managerService.getUserList(), this.serviceTask, DB.SERVICE_TYPOLOGY.EXTERNAL, null, date_dayRange[0], date_dayRange[1]);
      let serviceTaskProductList = await this.managerService.serviceTaskProduct_getList(this.managerService.getUserList(), this.serviceTask, date_dayRange[0], date_dayRange[1]);
      //
      //ORDER BY DATE AND USER
      //
      //ordino mettendo prima le cose appartenenti all'utente loggato
      if (userLogged) {
        serviceTripList.sort(function (a, b) {
          return differenceInMinutes(new Date(a.date_start), new Date(b.date_start)) + (b.id_user == userLogged.id ? 1 : 0) - (a.id_user == userLogged.id ? 1 : 0);
        });
        //
        serviceOperationList.sort(function (a, b) {
          return differenceInMinutes(new Date(a.date_start), new Date(b.date_start)) + (b.id_user == userLogged.id ? 1 : 0) - (a.id_user == userLogged.id ? 1 : 0);
        });
      }
      //
      let job: DB.IDB_job = null;
      if (serviceOperationList.length > 0) {
        let jobDetails: DB.IDB_job_details = await this.managerService.jobDetails_getFromId(serviceOperationList[0]["id_job_details"]);
        job = await this.managerService.job_getFromId(jobDetails["id_job"]);
      }
      //
      let userList = await this.managerService.serviceTask_getUserList(this.serviceTask);
      //
      let serviceOperationList_workHours = this.managerService.serviceOperation_getWorkHoursFromList(serviceOperationList);
      //
      //ADD TO LIST
      //
      this.serviceTaskEventList.push({
        date: this.dateService.date_getDate(addDays(new Date(this.serviceTask.date_start), dayOffset)),
        dayOffset: dayOffset,
        serviceTask: this.serviceTask,
        serviceOperationList: serviceOperationList,
        serviceTripList: serviceTripList,
        serviceExtraList: serviceExtraList,
        serviceTaskProductList: serviceTaskProductList,
        serviceOperationList_workHours: serviceOperationList_workHours,
        job: job,
        userList: userList,
        userCnt: userList.length,
        serviceBadgeCnt: serviceTripList.length + serviceExtraList.length + serviceTaskProductList.length,
        isServiceTaskEditable: this.serviceTask["service_task_report"] ? this.serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true,
        hasServiceTaskReport: this.serviceTask["service_task_report"] ? true : false,
        hasServiceCall: this.serviceTask["id_service_call"] ? true : false,
        color: this.color,
        textColor: this.textColor,
      });
    }
    //
    this.showEvents = true;
  }

  eventClick(serviceTaskEvent) {
    this.eventClickEmitter.emit({
      context: this.context,
      serviceTaskEvent: serviceTaskEvent,
    });
  }

  getTooltipTaskExtra(serviceTaskEvent) {
    let tooltipText = "";
    let serviceTripList: DB.IDB_service_trip[] = serviceTaskEvent.serviceTripList;
    let serviceExtraList: DB.IDB_service_extra[] = serviceTaskEvent.serviceExtraList;
    let serviceTaskProductList: DB.IDB_service_task_product[] = serviceTaskEvent.serviceTaskProductList;
    //
    if (serviceTripList.length > 0) {
      tooltipText += serviceTripList.length + " " + (serviceTripList.length == 1 ? "Viaggio" : " Viaggi") + "\n";
    }
    //
    if (serviceExtraList.length > 0) {
      tooltipText += serviceExtraList.length + " " + (serviceExtraList.length == 1 ? "Spesa" : " Spese") + "\n";
    }
    //
    if (serviceTaskProductList.length > 0) {
      tooltipText += serviceTaskProductList.length + " " + (serviceTaskProductList.length == 1 ? "Prodotto" : " Prodotti") + "\n";
    }
    //
    return tooltipText;
  }

  getTooltipUserList(serviceTaskEvent) {
    let tooltipText = "";
    let userList: DB.IDB_user[] = serviceTaskEvent.userList;
    //
    let userNameList = userList.map(user => user.name_first + " " + user.name_last);
    //
    if (userList.length > 0) {
      tooltipText += userNameList.join("\n");
    }
    //
    return tooltipText;
  }
}
