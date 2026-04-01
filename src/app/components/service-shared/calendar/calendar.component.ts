import { Component, ViewChild, OnInit, AfterViewInit, Injector, Input, ChangeDetectorRef, HostListener, ComponentFactoryResolver, ApplicationRef } from "@angular/core";
import { ComponentPortal, DomPortalOutlet } from '@angular/cdk/portal';

import { AuthService, USER_GROUP } from '../../../services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'

import { MatDialog } from '@angular/material/dialog';
import { CalendarServiceTaskEventComponent } from '../calendar-service-task-event/calendar-service-task-event.component';
import { CalendarServiceOperationEventComponent } from '../calendar-service-operation-event/calendar-service-operation-event.component';
import { CalendarServiceTripEventComponent } from '../calendar-service-trip-event/calendar-service-trip-event.component';
import { ServiceDetailsIntComponent } from '../../service-int/service-details-int/service-details-int.component';
import { ServiceOperationExtFormComponent } from '../../service-ext/service-operation-ext-form/service-operation-ext-form.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { FullCalendarComponent } from '@fullcalendar/angular';
import { Calendar, CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import itLocale from '@fullcalendar/core/locales/it';

import { formatDate } from '@angular/common';
import { addDays, subSeconds } from 'date-fns'

import { MatMenuTrigger } from '@angular/material/menu';
import { CalendarServiceDayCellComponent } from '../calendar-service-day-cell/calendar-service-day-cell.component';
import { ServiceOperationIntFormComponent } from '../../service-int/service-operation-int-form/service-operation-int-form.component';
import { ConsumerTypologyListComponent } from '../../consumer/consumer-typology-list/consumer-typology-list.component';
import { ServiceTaskDetailsExtComponent } from '../../service-ext/service-task-details-ext/service-task-details-ext.component';
import { ReportReportComponent } from '../../report/report-report/report-report.component';
import { DateService } from 'src/app/services/date.service';
import { environment } from 'src/environments/environment';
import { ServiceTripExtFormComponent } from '../../service-ext/service-trip-ext-form/service-trip-ext-form.component';
import { ServiceExtraExtFormComponent } from '../../service-ext/service-extra-ext-form/service-extra-ext-form.component';
import { ServiceTaskProductExtFormComponent } from '../../service-ext/service-task-product-ext-form/service-task-product-ext-form.component';
import { UserSelectFormComponent } from '../../user/user-select-form/user-select-form.component';
import { ServiceCallSelectFormComponent } from '../../service-call/service-call-select-form/service-call-select-form.component';
import { ServiceCallFormComponent } from '../../service-call/service-call-form/service-call-form.component';
import { CalendarServiceCallEventComponent } from '../calendar-service-call-event/calendar-service-call-event.component';
import { ServiceCallMailFormComponent } from '../../service-call/service-call-mail-form/service-call-mail-form.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: false
})

export class CalendarComponent implements OnInit, AfterViewInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("CalendarComponent"); event.stopPropagation(); } }

  @Input() serviceTypologyCode!: string;

  @ViewChild("calendar") calendarComponent!: FullCalendarComponent;
  @ViewChild(MatMenuTrigger) eventContextMenu!: MatMenuTrigger;

  dayTooltipObj = {};
  dayClassObj = {};

  eventContextMenuPosition = { x: "0px", y: "0px" };

  private touchCreateTimer: any = null;
  private touchCreateStarted: boolean = false;
  private touchCreateActive: boolean = false;
  private touchStartPoint: { x: number, y: number } | null = null;
  private touchStartCell: HTMLElement | null = null;
  private touchCurrentCell: HTMLElement | null = null;
  private touchStartCol: HTMLElement | null = null;
  private touchCurrentCol: HTMLElement | null = null;
  private eventTouchTimer: any = null;
  private eventTouchLongPress: boolean = false;

  title: string = "";

  calendarOptionsObj: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: "timeGridWeek", //Modificato in ngOnInit
    eventDisplay: "auto",
    height: "100%",
    locale: itLocale,
    // weekNumbers: true,
    weekText: "",
    weekends: true,
    nowIndicator: true,
    selectable: true, //Modificato in ngOnInit
    selectMirror: true,
    editable: true,
    dayMaxEventRows: true,
    //
    longPressDelay: 500,
    eventLongPressDelay: 500,
    selectLongPressDelay: 500,
    selectMinDistance: 8,
    dragScroll: true,
    //
    eventClassNames: "f4ns-event",
    slotLabelClassNames: "f4ns-slot-label",
    //
    slotMaxTime: "23:00:00",
    slotDuration: "01:00:00",
    snapDuration: environment.calendar_step_duration,
    scrollTime: "08:00:00",
    businessHours: [
      {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: "09:00",
        endTime: "13:00",
      },
      {
        daysOfWeek: [1, 2, 3, 4, 5],
        startTime: "14:00",
        endTime: "18:00",
      },
    ],
    headerToolbar: {
      left: "",
      center: "",
      right: "",
    },
    slotLabelFormat: {
      hour: "2-digit",
      minute: "2-digit",
      omitZeroMinute: false,
      meridiem: false,
    },
    events: (fetchInfo, successCallback, failureCallback) => {
      return this.getEvents(fetchInfo, successCallback, failureCallback);
    },
    dayCellContent: " ",
    dayCellClassNames: (eventContent) => { return this.dayClassObj[this.dateService.date_getDate(eventContent.date)] ?? "" },
    dayCellDidMount: (eventContent) => { return this.dayCellDidMount(eventContent) },
    eventDidMount: (eventContent) => { return this.eventDidMount(eventContent) },
    select: (eventContent) => {
      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("FC select", eventContent);
      return this.select(eventContent);
    },
    selectAllow: (eventContent) => {
      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("FC selectAllow", eventContent.start, eventContent.end, eventContent);
      return this.selectOrEventAllow(eventContent);
    },
    eventAllow: (eventContent) => {
      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("FC eventAllow", eventContent.start, eventContent.end, eventContent);
      return this.selectOrEventAllow(eventContent);
    },
    datesSet: (eventInfo) => {
      let calendarApi = this.calendarComponent.getApi();
      //
      this.title = calendarApi.view.title;
    },
    eventClick: (eventInfo) => {
      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("FC eventClick", eventInfo);
      return this.eventClick(eventInfo);
    },
    eventDrop: (eventInfo) => { return this.eventDrop(eventInfo) },
    eventResize: (eventInfo) => { return this.eventResize(eventInfo) },
  }

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private authService: AuthService,
    private idbService: IdbService,
    private managerService: ManagerService,
    private dateService: DateService,
    private matDialog: MatDialog,
    private resolver: ComponentFactoryResolver,
    private injector: Injector,
    private app: ApplicationRef
  ) {
    const name = Calendar.name;
  }

  ngOnInit() {
    this.calendarOptionsObj.initialView = (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL || this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.TICKET) ? "timeGridWeek" : "dayGridMonth";
    //
    if (this.isTouchDevice()) {
      this.calendarOptionsObj.longPressDelay = 500;
      this.calendarOptionsObj.eventLongPressDelay = 500;
      this.calendarOptionsObj.selectLongPressDelay = 500;
    }
  }

  ngAfterViewInit() {
    let calendarEl = this.calendarComponent?.getApi()?.el;

    if (!calendarEl) {
      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("CALENDAR ROOT NOT FOUND");
      return;
    }

    calendarEl.addEventListener("touchstart", (e: any) => {
      this.onCalendarTouchStart(e);
    }, { passive: true });

    calendarEl.addEventListener("touchmove", (e: any) => {
      this.onCalendarTouchMove(e);
    }, { passive: false });

    calendarEl.addEventListener("touchend", (e: any) => {
      this.onCalendarTouchEnd(e);
    }, { passive: false });

    calendarEl.addEventListener("touchcancel", (e: any) => {
      this.onCalendarTouchCancel(e);
    }, { passive: false });

    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("CALENDAR TOUCH HANDLERS READY");
  }

  getEvents(fetchInfo, successCallback, failureCallback) {
    let dateStart = this.dateService.date_getDateTime(fetchInfo.start);
    let dateEnd = this.dateService.date_getDateTime(fetchInfo.end);
    //
    Promise.all([
      //
      //SERVICE_TASK
      //
      this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL ? this.managerService.serviceTask_getList(this.managerService.getUserList(), dateStart, dateEnd) : [],
      //
      //SERVICE_OPERATION
      //
      this.managerService.serviceOperation_getList(this.managerService.getUserList(), null, this.serviceTypologyCode, dateStart, dateEnd).then(operationList => {
        return this.idbService.join(operationList, [{
          field: "id_job_details", table: "job_details", joinList: [
            {
              field: "id_job", table: "job", joinList: [{
                field: "id_consumer", table: "consumer"
              }]
            },
            { field: "id_job_details_action", table: "job_details_action" }
          ],
        }])
      }),
      //
      //SERVICE_TRIP
      //
      this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL ? this.managerService.serviceTrip_getList(this.managerService.getUserList(), null, dateStart, dateEnd) : [],
      //
      //SERVICE_CALL
      //
      this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.TICKET ? this.managerService.serviceCall_getList(this.managerService.getUserList(), dateStart, dateEnd) : [],
    ])
      .then((res: [DB.IDB_service_task[], DB.IDB_service_operation[], DB.IDB_service_trip[], DB.IDB_service_call[]]) => {
        let serviceTaskList = res[0];
        let serviceOperationList = res[1];
        let serviceTripList = res[2];
        let serviceCallList = res[3];
        //
        let eventList = [];
        //
        //SERVICE_TASK
        //
        if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
          let idServiceTaskWithServiceOperationArr = serviceOperationList.map(serviceOperation => serviceOperation.id_service_task)
          //
          for (let serviceTaskK in serviceTaskList) {
            let serviceTask = serviceTaskList[serviceTaskK];
            if (!idServiceTaskWithServiceOperationArr.includes(serviceTask.id)) {
              continue;
            }
            let colorH = (360 / 15) * (serviceTask.id % 15);
            //
            //fix date_end (Aggiunge un giorno e, se è mezzanotte, la porta alle 23:59:59 del giorno prima) [2020-06-14 00:00:00 -> 2020-06-13 23:59:59]
            let serviceTaskDateEndFixed = addDays(new Date(serviceTask.date_end), 1);
            if (this.dateService.date_getTimeMs(serviceTaskDateEndFixed) == this.dateService.date_getHourFirstInDay() + ".000") {
              serviceTaskDateEndFixed = subSeconds(serviceTaskDateEndFixed, 1);
            }
            //
            let isEditable = serviceTask["service_task_report"] ? serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
            //
            eventList.push({
              id: serviceTask.id,
              title: "",
              start: serviceTask.date_start,
              end: this.dateService.date_getDateTimeMs(serviceTaskDateEndFixed),
              allDay: true,
              editable: false,
              color: isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "hsl(" + colorH + ", 30%, 80%)",
              borderColor: isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "#aaaaaa",
              //
              data: {
                serviceType: "service_task",
                serviceTask: serviceTask,
                color: isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "hsl(" + colorH + ", 30%, 80%)",
                textColor: isEditable ? "#ffffff" : "#444444",
              }
            });
          }
        }
        //
        //SERVICE_OPERATION EXTERNAL
        //
        if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
          for (let serviceOperationK in serviceOperationList) {
            let serviceOperation = serviceOperationList[serviceOperationK];
            let serviceOperation_workHours = this.managerService.serviceOperation_getWorkHours(serviceOperation);
            let colorH = (360 / 15) * (serviceOperation.id_service_task ?? 0 % 15);
            let serviceTask = serviceTaskList.find(function (serviceTask) {
              return serviceTask.id === serviceOperation.id_service_task;
            });
            //
            serviceOperation["service_task"] = serviceTask;
            //
            let isEditable = serviceTask["service_task_report"] ? serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
            let isDifferentUser = serviceOperation.id_user != this.authService.getUserLogged().id;
            //
            eventList.push({
              id: serviceOperation.id,
              title: serviceOperation_workHours + "h (" + serviceOperation["job_details"]?.["job"]?.["code"] + ")\n" + serviceOperation["job_details"]?.["job"]?.["consumer"]?.["name"]/* + (serviceOperation.description ? "\n" + serviceOperation.description : "")*/,
              start: serviceOperation.date_start,
              end: serviceOperation.date_end,
              allDay: false,
              color: isDifferentUser ? 'white' : (isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "hsl(" + colorH + ", 30%, 80%)"),
              borderColor: isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "#aaaaaa",
              textColor: isDifferentUser ? (isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "hsl(" + colorH + ", 30%, 80%)") : (isEditable ? "#ffffff" : "#444444"),
              editable: isEditable,
              //
              data: {
                serviceType: "service_operation",
                serviceOperation: serviceOperation,
              }
            });
          }
        }
        //
        //SERVICE_OPERATION INTERNAL
        //
        if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.INTERNAL) {
          for (let serviceOperationK in serviceOperationList) {
            let serviceOperation = serviceOperationList[serviceOperationK];
            let serviceOperation_workHours = this.managerService.serviceOperation_getWorkHours(serviceOperation);
            let colorH = (360 / 15) * (serviceOperation["job_details"]["job"]["id"] ?? 0 % 15);
            //
            eventList.push({
              id: serviceOperation.id,
              title: serviceOperation_workHours + "h (" + serviceOperation["job_details"]["job"]["consumer"]["code"] + "\n" + serviceOperation["job_details"]["job"]["code"] + ") " + serviceOperation["job_details"]["job_details_action"]["name"],
              start: serviceOperation.date_start,
              end: serviceOperation.date_end,
              allDay: true,
              color: "hsl(" + colorH + ", 50%, 65%)",
              //
              data: {
                serviceType: "service_operation",
                serviceOperation: serviceOperation,
              }
            });
          }
        }
        //
        //SERVICE_TRIP
        //
        if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
          for (let serviceTripK in serviceTripList) {
            let serviceTrip = serviceTripList[serviceTripK];
            let serviceTrip_hours = this.managerService.serviceTrip_getHours(serviceTrip);
            let colorH = (360 / 15) * (serviceTrip.id_service_task ?? 0 % 15);
            let serviceTask = serviceTaskList.find(function (serviceTask) {
              return serviceTask.id === serviceTrip.id_service_task;
            });
            //
            serviceTrip["service_task"] = serviceTask;
            //
            let isEditable = serviceTask["service_task_report"] ? serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
            let isDifferentUser = serviceTrip.id_user != this.authService.getUserLogged().id;
            //
            eventList.push({
              id: serviceTrip.id,
              title: serviceTrip_hours + "h",
              start: serviceTrip.date_start,
              end: serviceTrip.date_end,
              allDay: false,
              editable: isEditable,
              color: isDifferentUser ? '#fefefe' : (isEditable ? "hsl(" + colorH + ", 50%, 85%)" : "hsl(" + colorH + ", 30%, 95%)"),
              borderColor: isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "#aaaaaa",
              textColor: isDifferentUser ? ((isEditable ? "hsl(" + colorH + ", 50%, 85%)" : "hsl(" + colorH + ", 30%, 95%)")) : (isEditable ? "#fefefe" : "#444444"),
              //
              data: {
                serviceType: "service_trip",
                serviceTrip: serviceTrip,
              }
            });
          }
        }
        //
        //SERVICE_CALL
        //
        if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.TICKET) {
          for (let serviceCallK in serviceCallList) {
            let serviceCall = serviceCallList[serviceCallK];
            let serviceCall_workHours = this.managerService.serviceCall_getWorkHours(serviceCall);
            let colorH = (360 / 15) * (serviceCall.id ?? 0 % 15);
            //
            let isEditable = serviceCall["service_call_status"]["code"] != DB.SERVICE_CALL_STATUS.COMPLETED;
            let isDifferentUser = !serviceCall["id_user_arr"].includes(this.authService.getUserLogged().id);
            //
            eventList.push({
              id: serviceCall.id,
              title: serviceCall_workHours + "h (" + serviceCall["consumer"]["name"] + ")\n[ " + serviceCall["_user_list"] + " ]" + (serviceCall.description ? "\n" + serviceCall.description : ""),
              start: serviceCall.date_start,
              end: serviceCall.date_end,
              allDay: false,
              color: isDifferentUser ? 'white' : (isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "hsl(" + colorH + ", 30%, 80%)"),
              borderColor: isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "#aaaaaa",
              textColor: isDifferentUser ? (isEditable ? "hsl(" + colorH + ", 50%, 65%)" : "hsl(" + colorH + ", 30%, 80%)") : (isEditable ? "#ffffff" : "#444444"),
              editable: isEditable,
              //
              data: {
                serviceType: "service_call",
                serviceCall: serviceCall,
              }
            });
          }
        }
        //
        successCallback(eventList);
      });
  }

  dayCellDidMount(eventContent) {
    if (eventContent.view.type == "dayGridMonth") {
      let elementContainer = new DomPortalOutlet(
        eventContent.el.querySelector("div.fc-daygrid-day-top"),
        this.app,
        this.injector);
      //
      if (elementContainer.outletElement) {
        const componentRef = elementContainer.attach(new ComponentPortal(CalendarServiceDayCellComponent));
        //
        componentRef.instance.context = this;
        componentRef.instance.date = eventContent.date;
        componentRef.instance.serviceTypologyCode = this.serviceTypologyCode;
        //
        this.dayTooltipObj[this.dateService.date_getDate(eventContent.date)] = componentRef;
      }
      //
      this.updateDayClass(eventContent.date);
    }
  }

  eventDidMount(eventContent) {
    //
    //SERVICE_TASK
    //
    if (eventContent.event.extendedProps.data && eventContent.event.extendedProps.data.serviceType == "service_task") {
      let elementContainer = new DomPortalOutlet(
        eventContent.el,
        this.app,
        this.injector);
      const componentRef = elementContainer.attach(new ComponentPortal(CalendarServiceTaskEventComponent));
      //
      componentRef.instance.context = this;
      componentRef.instance.serviceTask = eventContent.event.extendedProps.data.serviceTask;
      componentRef.instance.color = eventContent.event.extendedProps.data.color;
    }
    //
    //SERVICE_OPERATION
    //
    else if (eventContent.event.extendedProps.data && eventContent.event.extendedProps.data.serviceType == "service_operation") {
      let elementContainer = new DomPortalOutlet(
        eventContent.el,
        this.app,
        this.injector);
      const componentRef = elementContainer.attach(new ComponentPortal(CalendarServiceOperationEventComponent));
      //
      componentRef.instance.context = this;
      componentRef.instance.element = eventContent.el;
      componentRef.instance.serviceOperation = eventContent.event.extendedProps.data.serviceOperation;
      componentRef.instance.color = eventContent.event.extendedProps.data.color;
      componentRef.instance.textColor = eventContent.event.extendedProps.data.textColor;
    }
    //
    //SERVICE_TRIP
    //
    else if (eventContent.event.extendedProps.data && eventContent.event.extendedProps.data.serviceType == "service_trip") {
      let elementContainer = new DomPortalOutlet(
        eventContent.el,
        this.app,
        this.injector);
      const componentRef = elementContainer.attach(new ComponentPortal(CalendarServiceTripEventComponent));
      //
      componentRef.instance.context = this;
      componentRef.instance.element = eventContent.el;
      componentRef.instance.serviceTrip = eventContent.event.extendedProps.data.serviceTrip;
      componentRef.instance.color = eventContent.event.extendedProps.data.color;
      componentRef.instance.textColor = eventContent.event.extendedProps.data.textColor;
    }
    //
    //SERVICE_CALL
    //
    else if (eventContent.event.extendedProps.data && eventContent.event.extendedProps.data.serviceType == "service_call") {
      let elementContainer = new DomPortalOutlet(
        eventContent.el,
        this.app,
        this.injector);
      const componentRef = elementContainer.attach(new ComponentPortal(CalendarServiceCallEventComponent));
      //
      componentRef.instance.context = this;
      componentRef.instance.element = eventContent.el;
      componentRef.instance.serviceCall = eventContent.event.extendedProps.data.serviceCall;
      componentRef.instance.color = eventContent.event.extendedProps.data.color;
      componentRef.instance.textColor = eventContent.event.extendedProps.data.textColor;
    }
    //
    //Click destro
    //
    eventContent.el.addEventListener("contextmenu", (contextMenuEvent) => {
      contextMenuEvent.preventDefault();
      this.eventRightClick(eventContent, contextMenuEvent);
      return false;
    }, false);
    //
    //TOUCH
    //
    this.bindMobileTap(eventContent);
  }

  eventClick(eventInfo) {
    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("METHOD eventClick", eventInfo);
    //
    if (eventInfo.event.extendedProps.data.serviceType == "service_task") {
      let serviceTask = eventInfo.event.extendedProps.data.serviceTask;
      this.openServiceTaskDetails(serviceTask, serviceTask.date_start);
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_operation") {
      this.managerService.serviceOperation_getFromId(eventInfo.event.id).then(serviceOperation => {
        if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
          let dialog = this.managerService.dialog_open(ServiceOperationExtFormComponent, serviceOperation ? "Modifica Operazione" : "Aggiungi Operazione", true, true, { width: "750px", height: "90%" });
          let component = dialog.componentInstance.componentInnerInstance as ServiceOperationExtFormComponent;
          //
          component.serviceOperation = serviceOperation;
          //
          dialog.afterClosed().subscribe(() => {
            this.refresh();
          });
        }
        else if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.INTERNAL) {
          let dialog = this.managerService.dialog_open(ServiceOperationIntFormComponent, serviceOperation ? "Modifica Operazione" : "Aggiungi Operazione", true, true, { width: "600px", height: "90%" });
          let component = dialog.componentInstance.componentInnerInstance as ServiceOperationIntFormComponent;
          //
          component.serviceOperation = serviceOperation;
          //
          dialog.afterClosed().subscribe(() => {
            this.refresh();
          });
        }
      });
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_trip") {
      this.managerService.serviceTrip_getFromId(eventInfo.event.id).then(serviceTrip => {
        let dialog = this.managerService.dialog_open(ServiceTripExtFormComponent, "Modifica Viaggio", true, true, { width: "40%", height: "500px" });
        let component = dialog.componentInstance.componentInnerInstance as ServiceTripExtFormComponent;
        //
        component.serviceTrip = serviceTrip;
        //
        dialog.afterClosed().subscribe(() => {
          this.refresh();
        });
      });
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_call") {
      if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.TICKET) {
        let serviceCall = eventInfo.event.extendedProps.data.serviceCall;
        let dialog = this.managerService.dialog_open(ServiceCallFormComponent, "Modifica Appuntamento", true, true, { width: "750px", height: "700px" });
        let component = dialog.componentInstance.componentInnerInstance as ServiceCallFormComponent;
        //
        component.serviceCall = serviceCall;
        component.isTicketSchedulationMode = true;
        //
        dialog.afterClosed().subscribe(() => {
          this.refresh();
        });
      }
    }
  }

  async eventDrop(eventInfo) {
    if (eventInfo.event.extendedProps.data.serviceType == "service_operation") {
      let serviceOperation = await this.managerService.serviceOperation_getFromId(parseInt(eventInfo.event.id));
      //
      let dateStartBefore = this.dateService.date_getDate(serviceOperation.date_start);
      let dateStartAfter = this.dateService.date_getDate(eventInfo.event.start);
      //
      let isLastInDay = false;
      if (serviceOperation.id_service_task) {
        let serviceTask = await this.managerService.serviceTask_getFromId(serviceOperation.id_service_task);
        isLastInDay = await this.managerService.serviceExtraIsLastInDay(serviceTask, serviceOperation.date_start);
      }
      //
      if (isLastInDay && dateStartBefore != dateStartAfter) {
        let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
        let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
        //
        component.message = "I rimborsi associati verranno spostati.\nProcedere?";
        //
        dialog.afterClosed().subscribe(result => {
          if (result) {
            this.managerService.serviceOperation_setDate(serviceOperation, this.dateService.date_getDateTimeMs(eventInfo.event.start), eventInfo.event.end ? this.dateService.date_getDateTimeMs(eventInfo.event.end) : null).then(() => {
              this.refresh([dateStartBefore, dateStartAfter]);
            });
          }
          else {
            this.refresh([dateStartBefore, dateStartAfter]);
          }
        });
      }
      else {
        this.managerService.serviceOperation_setDate(serviceOperation, this.dateService.date_getDateTimeMs(eventInfo.event.start), eventInfo.event.end ? this.dateService.date_getDateTimeMs(eventInfo.event.end) : null).then(() => {
          this.refresh([dateStartBefore, dateStartAfter]);
        });
      }
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_trip") {
      let serviceTrip = await this.managerService.serviceTrip_getFromId(parseInt(eventInfo.event.id));
      //
      let dateStartBefore = this.dateService.date_getDate(serviceTrip.date_start);
      let dateStartAfter = this.dateService.date_getDate(eventInfo.event.start);
      //
      this.managerService.serviceTrip_setDate(serviceTrip, this.dateService.date_getDateTimeMs(eventInfo.event.start), eventInfo.event.end ? this.dateService.date_getDateTimeMs(eventInfo.event.end) : null).then(() => {
        this.refresh([dateStartBefore, dateStartAfter]);
      });
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_call") {
      let serviceCall = await this.managerService.serviceCall_getFromId(parseInt(eventInfo.event.id));
      //
      let dateStartBefore = this.dateService.date_getDate(serviceCall.date_start);
      let dateStartAfter = this.dateService.date_getDate(eventInfo.event.start);
      //
      this.managerService.serviceCall_setDate(serviceCall, this.dateService.date_getDateTimeMs(eventInfo.event.start), eventInfo.event.end ? this.dateService.date_getDateTimeMs(eventInfo.event.end) : null).then(() => {
        this.refresh([dateStartBefore, dateStartAfter]);
      });
    }
  }

  eventResize(eventInfo) {
    if (eventInfo.event.extendedProps.data.serviceType == "service_operation") {
      this.managerService.serviceOperation_getFromId(parseInt(eventInfo.event.id)).then((serviceOperation) => {
        let dateStartBefore = this.dateService.date_getDate(serviceOperation.date_start);
        let dateStartAfter = this.dateService.date_getDate(eventInfo.event.start);
        //
        this.managerService.serviceTask_getFromId(serviceOperation.id_service_task).then((serviceTask) => {
          this.managerService.serviceExtraIsLastInDay(serviceTask, serviceOperation.date_start).then((isLastInDay) => {
            if (isLastInDay && dateStartBefore != dateStartAfter) {
              let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
              let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
              //
              component.message = "I rimborsi associati verranno spostati.\nProcedere?";
              //
              dialog.afterClosed().subscribe(result => {
                if (result) {
                  this.managerService.serviceOperation_setDate(serviceOperation, this.dateService.date_getDateTimeMs(eventInfo.event.start), this.dateService.date_getDateTimeMs(eventInfo.event.end)).then(() => {
                    this.refresh([dateStartBefore, dateStartAfter]);
                  });
                }
                else {
                  this.refresh([dateStartBefore, dateStartAfter]);
                }
              });
            }
            else {
              this.managerService.serviceOperation_setDate(serviceOperation, this.dateService.date_getDateTimeMs(eventInfo.event.start), this.dateService.date_getDateTimeMs(eventInfo.event.end)).then(() => {
                this.refresh([dateStartBefore, dateStartAfter]);
              });
            }
          });
        });
      });
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_trip") {
      this.managerService.serviceTrip_getFromId(parseInt(eventInfo.event.id)).then((serviceTrip) => {
        let dateStartBefore = this.dateService.date_getDate(serviceTrip.date_start);
        let dateStartAfter = this.dateService.date_getDate(eventInfo.event.start);
        //
        this.managerService.serviceTrip_setDate(serviceTrip, this.dateService.date_getDateTimeMs(eventInfo.event.start), this.dateService.date_getDateTimeMs(eventInfo.event.end)).then(() => {
          this.refresh([dateStartBefore, dateStartAfter]);
        });
      });
    }
    else if (eventInfo.event.extendedProps.data.serviceType == "service_call") {
      this.managerService.serviceCall_getFromId(parseInt(eventInfo.event.id)).then((serviceCall) => {
        let dateStartBefore = this.dateService.date_getDate(serviceCall.date_start);
        let dateStartAfter = this.dateService.date_getDate(eventInfo.event.start);
        //
        this.managerService.serviceCall_setDate(serviceCall, this.dateService.date_getDateTimeMs(eventInfo.event.start), this.dateService.date_getDateTimeMs(eventInfo.event.end)).then(() => {
          this.refresh([dateStartBefore, dateStartAfter]);
        });
      });
    }
  }

  select(eventInfo) {
    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("METHOD select", eventInfo);
    //
    if (eventInfo.view.type == "dayGridMonth") {
      this.openServiceDetails(eventInfo.start, eventInfo.end);
    }
    else {
      if (!eventInfo.allDay) {
        if (eventInfo.jsEvent.shiftKey) {
          //TODO

          // let dialog = this.managerService.dialog_open(ServiceTripExtFormComponent, "Aggiungi Viaggio", true, true, { width: "40%", height: "500px" });
          // let component = dialog.componentInstance.componentInnerInstance as ServiceTripExtFormComponent;
          // //
          // component.dateStart = eventInfo.start;
          // component.dateEnd = eventInfo.end;
          // //
          // dialog.afterClosed().subscribe(() => {
          //   this.refresh();
          // });
        }
        else {
          this.openServiceDetails(eventInfo.start, eventInfo.end);
        }
      }
    }
  }


  selectOrEventAllow(eventInfo) {
    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("METHOD selectOrEventAllow", eventInfo.start, eventInfo.end, eventInfo);
    //
    if (
      eventInfo.start.getFullYear() == eventInfo.end.getFullYear() &&
      eventInfo.start.getMonth() == eventInfo.end.getMonth() &&
      eventInfo.start.getDate() == new Date(eventInfo.end.getTime() - 1).getDate()
    ) {
      return true;
    }
    //
    return false;
  }

  async updateDayClass(date) {
    let dayClass = await this.getDayClass(date);
    this.dayClassObj[this.dateService.date_getDate(date)] = dayClass;
    this.calendarOptionsObj.dayCellClassNames = (eventContent) => { return this.dayClassObj[this.dateService.date_getDate(eventContent.date)] ?? "" };
  }

  async getDayClass(date) {
    let dayCellClassName = "";
    let hoursObj = await this.managerService.day_getHoursObj(this.managerService.getUserList(), date, this.serviceTypologyCode);
    //
    if (hoursObj["dayWorkHours"] && hoursObj["dayWorkHours"] > 0 && hoursObj["dayWorkHours"] < 8) {
      dayCellClassName = "f4ns-day-wip";
    }
    else if (hoursObj["dayWorkHours"] && hoursObj["dayWorkHours"] >= 8) {
      dayCellClassName = "f4ns-day-completed";
    }
    //
    return dayCellClassName;
  }

  eventRightClick(eventInfo, contextMenuEvent) {
    contextMenuEvent.preventDefault();
    this.eventContextMenuPosition.x = contextMenuEvent.clientX + "px";
    this.eventContextMenuPosition.y = contextMenuEvent.clientY + "px";
    this.eventContextMenu.menuData = { eventInfo: eventInfo };
    this.eventContextMenu.menu.focusFirstItem("mouse");
    this.eventContextMenu.openMenu();
  }

  openServiceDetails(dateStart, dateEnd) {
    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("METHOD openServiceDetails", dateStart, dateEnd);
    //
    if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      let dialog = this.managerService.dialog_open(ServiceOperationExtFormComponent, "Aggiungi Operazione", true, true, { width: "750px", height: "90%" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceOperationExtFormComponent;
      //
      component.dateStart = dateStart;
      component.dateEnd = dateEnd;
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh([this.dateService.date_getDate(dateStart)]);
      });
    }
    else if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.INTERNAL) {
      let dialog = this.managerService.dialog_open(ServiceDetailsIntComponent, "Dettaglio Giorno: " + this.dateService.date_getDate(dateStart), true, false, { width: "90%", height: "90%" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceDetailsIntComponent;
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh([this.dateService.date_getDate(dateStart)]);
      });
    }
    else if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.TICKET) {
      let dialog = this.managerService.dialog_open(ServiceCallSelectFormComponent, "Seleziona Ticket", true, true, { width: "70%", height: "250px" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceCallSelectFormComponent;
      //
      component.dateStart = dateStart;
      component.dateEnd = dateEnd;
      component.onAfterClosed = (() => {
        this.refresh([this.dateService.date_getDate(dateStart)]);
      });
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh([this.dateService.date_getDate(dateStart)]);
      });
    }
  }

  openServiceTaskDetails(serviceTask, date) {
    if (this.serviceTypologyCode == DB.SERVICE_TYPOLOGY.EXTERNAL) {
      let dialog = this.managerService.dialog_open(ServiceTaskDetailsExtComponent, "Dettaglio Attività", true, false, { width: "90%", height: "90%" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceTaskDetailsExtComponent;
      //
      component.serviceTask = serviceTask;
      component.dateStart = date;
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh([this.dateService.date_getDate(date)]);
      });
    }
  }

  changeView(viewName) {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.changeView(viewName);
    //
    this.title = calendarApi.view.title;
  }

  today() {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.today();
    //
    this.title = calendarApi.view.title;
  }

  prev() {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.prev();
    //
    this.title = calendarApi.view.title;
  }

  next() {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.next();
    //
    this.title = calendarApi.view.title;
  }

  refresh(dateStartList?: any[]) {
    let calendarApi = this.calendarComponent.getApi();
    calendarApi.refetchEvents();
    //
    if (calendarApi.view.type == "dayGridMonth") {
      if (dateStartList && dateStartList.length > 0) {
        for (let dateStartK in dateStartList) {
          let dateStart = dateStartList[dateStartK];
          //
          this.dayTooltipObj[dateStart].instance.ngOnInit();
          this.updateDayClass(dateStart);
        }
      }
    }
    //
    this.title = calendarApi.view.title;
  }

  isTouchDevice(): boolean {
    return window.matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  }

  private getSlotLaneFromPoint(x: number, y: number): HTMLElement | null {
    let el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) {
      return null;
    }
    return el.closest(".fc-timegrid-slot-lane") as HTMLElement | null;
  }

  private getTimeGridColFromPoint(x: number, y: number): HTMLElement | null {
    let el = document.elementFromPoint(x, y) as HTMLElement | null;
    if (!el) {
      return null;
    }
    return el.closest(".fc-timegrid-col") as HTMLElement | null;
  }

  private onCalendarTouchStart(e: any) {
    if (!this.isTouchDevice()) {
      return;
    }

    if (e.touches.length !== 1) {
      return;
    }

    let touch = e.touches[0];
    let slot = this.getSlotLaneFromPoint(touch.clientX, touch.clientY);
    let col = this.getTimeGridColFromPoint(touch.clientX, touch.clientY);

    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH start", {
      target: e.target,
      slot: slot,
      col: col
    });

    if (!slot || !col) {
      this.resetTouchCreateState();
      return;
    }

    // evento esistente: non entriamo nella create mode manuale
    if ((e.target as HTMLElement)?.closest(".fc-event")) {
      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH start on existing event");
      this.resetTouchCreateState();
      return;
    }

    this.touchStartPoint = {
      x: touch.clientX,
      y: touch.clientY
    };
    this.touchStartCell = slot;
    this.touchCurrentCell = slot;
    this.touchStartCol = col;
    this.touchCurrentCol = col;
    this.touchCreateStarted = true;
    this.touchCreateActive = false;

    clearTimeout(this.touchCreateTimer);
    this.touchCreateTimer = setTimeout(() => {
      this.touchCreateActive = true;
      this.calendarComponent?.getApi()?.el.classList.add("f4ns-calendar-touch-selecting");
      document.body.style.overflow = "hidden";

      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH longpress ACTIVE", {
        slot: this.touchStartCell,
        col: this.touchStartCol
      });
    }, 500);
  }

  private onCalendarTouchMove(e: any) {
    if (!this.isTouchDevice()) {
      return;
    }

    if (!this.touchCreateStarted) {
      return;
    }

    let touch = e.touches[0];

    if (!this.touchCreateActive && this.touchStartPoint) {
      let dx = Math.abs(touch.clientX - this.touchStartPoint.x);
      let dy = Math.abs(touch.clientY - this.touchStartPoint.y);

      if (dx > 10 || dy > 10) {
        if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH cancelled before longpress", dx, dy);
        clearTimeout(this.touchCreateTimer);
        this.resetTouchCreateState();
        return;
      }

      return;
    }

    if (this.touchCreateActive) {
      e.preventDefault();

      let slot = this.getSlotLaneFromPoint(touch.clientX, touch.clientY);
      let col = this.getTimeGridColFromPoint(touch.clientX, touch.clientY);

      if (slot) {
        this.touchCurrentCell = slot;
      }

      if (col) {
        this.touchCurrentCol = col;
      }

      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH move selecting", {
        slot: this.touchCurrentCell,
        col: this.touchCurrentCol
      });
    }
  }

  private onCalendarTouchEnd(e: any) {
    if (!this.isTouchDevice()) {
      return;
    }

    clearTimeout(this.touchCreateTimer);

    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH end", {
      active: this.touchCreateActive,
      startCell: this.touchStartCell,
      currentCell: this.touchCurrentCell,
      startCol: this.touchStartCol,
      currentCol: this.touchCurrentCol
    });

    if (this.touchCreateActive && this.touchStartCell && this.touchCurrentCell && this.touchStartCol && this.touchCurrentCol) {
      let start = this.buildDateFromTouchCell(this.touchStartCol, this.touchStartCell);
      let end = this.buildDateFromTouchCell(this.touchCurrentCol, this.touchCurrentCell);

      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH selection raw", start, end);

      if (start && end) {
        let dateStart = start <= end ? start : end;
        let dateEnd = start <= end ? end : start;

        dateEnd = new Date(dateEnd.getTime() + 60 * 60 * 1000);

        if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH create event", dateStart, dateEnd);

        this.openServiceDetails(dateStart, dateEnd);
      }
    }

    this.resetTouchCreateState();
  }

  private onCalendarTouchCancel(e: any) {
    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH cancel", e);
    clearTimeout(this.touchCreateTimer);
    this.resetTouchCreateState();
  }

  private resetTouchCreateState() {
    this.touchCreateStarted = false;
    this.touchCreateActive = false;
    this.touchStartPoint = null;
    this.touchStartCell = null;
    this.touchCurrentCell = null;
    this.touchStartCol = null;
    this.touchCurrentCol = null;

    this.calendarComponent?.getApi()?.el.classList.remove("f4ns-calendar-touch-selecting");

    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("TOUCH state reset");
  }

  private buildDateFromTouchCell(colEl: HTMLElement, slotEl: HTMLElement): Date | null {
    let dateStr = colEl.getAttribute("data-date");
    let timeStr = slotEl.getAttribute("data-time");

    if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("buildDateFromTouchCell", dateStr, timeStr, colEl, slotEl);

    if (!dateStr || !timeStr) {
      return null;
    }

    return new Date(dateStr + "T" + timeStr);
  }

  private bindMobileTap(eventContent: any) {
    if (!this.isTouchDevice()) {
      return;
    }

    let touchStartX = 0;
    let touchStartY = 0;
    let touchMoved = false;

    eventContent.el.addEventListener("touchstart", (e: TouchEvent) => {
      let touch = e.changedTouches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchMoved = false;
      this.eventTouchLongPress = false;

      clearTimeout(this.eventTouchTimer);
      this.eventTouchTimer = setTimeout(() => {
        this.eventTouchLongPress = true;

        if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("EVENT longpress contextmenu", eventContent.event.id);

        this.eventRightClick(eventContent, {
          preventDefault: () => { },
          stopPropagation: () => { },
          clientX: touch.clientX,
          clientY: touch.clientY
        });
      }, 500);

      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("EVENT touchstart", eventContent.event.id, eventContent.event.extendedProps?.data?.serviceType);
    }, { passive: true });

    eventContent.el.addEventListener("touchmove", (e: TouchEvent) => {
      let touch = e.changedTouches[0];

      if (Math.abs(touch.clientX - touchStartX) > 10 || Math.abs(touch.clientY - touchStartY) > 10) {
        touchMoved = true;
        clearTimeout(this.eventTouchTimer);
      }
    }, { passive: true });

    eventContent.el.addEventListener("touchend", (e: TouchEvent) => {
      clearTimeout(this.eventTouchTimer);

      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("EVENT touchend", eventContent.event.id, {
        moved: touchMoved,
        longPress: this.eventTouchLongPress,
        type: eventContent.event.extendedProps?.data?.serviceType
      });

      if (touchMoved) {
        this.eventTouchLongPress = false;
        return;
      }

      if (this.eventTouchLongPress) {
        e.preventDefault();
        e.stopPropagation();
        this.eventTouchLongPress = false;
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (this.authService.getUserGroupLogged().code == USER_GROUP.SUPER) console.log("EVENT synthetic click", eventContent.event.id);

      this.eventClick({
        event: eventContent.event,
        el: eventContent.el,
        jsEvent: e,
        view: eventContent.view
      });
    }, { passive: false });

    eventContent.el.addEventListener("touchcancel", () => {
      clearTimeout(this.eventTouchTimer);
      this.eventTouchLongPress = false;
    }, { passive: true });
  }

  serviceTask_hasReport(eventInfo) {
    let serviceTask: DB.IDB_service_task = eventInfo.event.extendedProps.data.serviceTask;
    //
    return serviceTask["service_task_report"] ? true : false;
  }

  serviceTask_isEditable(eventInfo) {
    let serviceTask: DB.IDB_service_task = eventInfo.event.extendedProps.data.serviceTask;
    //
    let isEditable = serviceTask["service_task_report"] ? serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
    return isEditable;
  }

  async serviceTask_addServiceOperation(eventInfo) {
    let serviceTask: DB.IDB_service_task = eventInfo.event.extendedProps.data.serviceTask;
    //
    let dialog = this.managerService.dialog_open(ServiceOperationExtFormComponent, "Aggiungi Operazione", true, true, { width: "750px", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceOperationExtFormComponent;
    //
    component.serviceOperation = null;
    component.serviceTask = serviceTask;
    component.dateStart = serviceTask.date_start;
    component.dateEnd = null;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  async serviceTask_addServiceTrip(eventInfo) {
    let serviceTask: DB.IDB_service_task = eventInfo.event.extendedProps.data.serviceTask;
    //
    let dialog = this.managerService.dialog_open(ServiceTripExtFormComponent, "Aggiungi Viaggio", true, true, { width: "40%", height: "500px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceTripExtFormComponent;
    //
    component.serviceTrip = null;
    component.serviceTask = serviceTask;
    component.dateStart = serviceTask.date_start;
    component.dateEnd = null;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  async serviceTask_addServiceExtra(eventInfo) {
    let serviceTask: DB.IDB_service_task = eventInfo.event.extendedProps.data.serviceTask;
    //
    let dialog = this.managerService.dialog_open(ServiceExtraExtFormComponent, "Aggiungi Spesa", true, true, { width: "40%", height: "550px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceExtraExtFormComponent;
    //
    component.serviceExtra = null;
    component.serviceTask = serviceTask;
    component.dateStart = serviceTask.date_start;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  async serviceTask_addServiceTaskProduct(eventInfo) {
    let serviceTask: DB.IDB_service_task = eventInfo.event.extendedProps.data.serviceTask;
    //
    let dialog = this.managerService.dialog_open(ServiceTaskProductExtFormComponent, "Aggiungi Prodotto", true, true, { width: "90%", height: "400px" });
    let component = dialog.componentInstance.componentInnerInstance as ServiceTaskProductExtFormComponent;
    //
    component.serviceTaskProduct = null;
    component.serviceTask = serviceTask;
    component.dateStart = serviceTask.date_start;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }

  async serviceTask_openReport(eventInfo) {
    let serviceTask = eventInfo.event.extendedProps.data.serviceTask;
    let serviceTaskReport = await this.managerService.serviceTaskReport_getOrCreateFromServiceTask(this.authService.getUserLogged(), serviceTask);
    //
    let dialog = this.managerService.dialog_open(ReportReportComponent, "Dettaglio Attività", true, false, { width: "90%", height: "90%" });
    let component = dialog.componentInstance.componentInnerInstance as ReportReportComponent;
    //
    component.serviceTaskReport = serviceTaskReport;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh([this.dateService.date_getDate(serviceTask.date_start)]);
    });
  }

  serviceOperation_clone(eventInfo) {
    let dialog = this.managerService.dialog_open(UserSelectFormComponent, "Clonare Operazione", true, true, { width: "40%", height: "250px" });
    let component = dialog.componentInstance.componentInnerInstance as UserSelectFormComponent;
    //
    dialog.afterClosed().subscribe(userList => {
      if (userList && userList.length > 0) {
        for (let userk in userList) {
          let user = userList[userk];
          //
          this.managerService.serviceOperation_getFromId(eventInfo.event.id).then((serviceOperation) => {
            this.managerService.serviceOperation_clone(user, serviceOperation).then(() => {
              this.refresh([this.dateService.date_getDate(serviceOperation.date_start)]);
            });
          });
        }
      }
    });
  }

  serviceOperation_delete(eventInfo) {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Operazione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.serviceOperation_getFromId(eventInfo.event.id).then((serviceOperation) => {
          this.managerService.serviceOperation_delete(serviceOperation).then(() => {
            this.refresh([this.dateService.date_getDate(serviceOperation.date_start)]);
          });
        });
      }
    });
  }

  serviceOperation_isEditable(eventInfo) {
    let serviceOperation: DB.IDB_service_operation = eventInfo.event.extendedProps.data.serviceOperation;
    let serviceTask = serviceOperation["service_task"];
    //
    let isEditable = serviceTask && serviceTask["service_task_report"] ? serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
    return isEditable;
  }

  serviceTrip_clone(eventInfo) {
    let dialog = this.managerService.dialog_open(UserSelectFormComponent, "Clonare Viaggio", true, true, { width: "40%", height: "250px" });
    let component = dialog.componentInstance.componentInnerInstance as UserSelectFormComponent;
    //
    dialog.afterClosed().subscribe(userList => {
      if (userList && userList.length > 0) {
        for (let userk in userList) {
          let user = userList[userk];
          //
          this.managerService.serviceTrip_getFromId(eventInfo.event.id).then((serviceTrip) => {
            this.managerService.serviceTrip_clone(user, serviceTrip).then(() => {
              this.refresh([this.dateService.date_getDate(serviceTrip.date_start)]);
            });
          });
        }
      }
    });
  }

  serviceTrip_delete(eventInfo) {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Viaggio", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.serviceTrip_getFromId(eventInfo.event.id).then((serviceTrip) => {
          this.managerService.serviceTrip_delete(serviceTrip).then(() => {
            this.refresh([this.dateService.date_getDate(serviceTrip.date_start)]);
          });
        });
      }
    });
  }

  serviceTrip_isEditable(eventInfo) {
    let serviceTrip: DB.IDB_service_trip = eventInfo.event.extendedProps.data.serviceTrip;
    let serviceTask = serviceTrip["service_task"];
    //
    let isEditable = serviceTask && serviceTask["service_task_report"] ? serviceTask["service_task_report"]["service_task_report_status"]["code"] == DB.SERVICE_TASK_REPORT_STATUS.NEW : true;
    return isEditable;
  }

  serviceCall_isSchedulable(eventInfo) {
    let serviceCall: DB.IDB_service_trip = eventInfo.event.extendedProps.data.serviceCall;
    let isEditable = serviceCall["service_call_status"]["code"] != DB.SERVICE_CALL_STATUS.COMPLETED ? true : false;
    //
    return isEditable;
  }

  serviceCall_isSendMailVisible(eventInfo) {
    let serviceCall: DB.IDB_service_trip = eventInfo.event.extendedProps.data.serviceCall;
    //
    return this.authService.getUserGroupLogged().code == USER_GROUP.ALL || this.authService.getUserGroupLogged().code == USER_GROUP.SUPER;
  }

  serviceCall_deleteSchedulation(eventInfo) {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Appuntamento", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.serviceCall_getFromId(eventInfo.event.id).then((serviceCall) => {
          this.managerService.serviceCall_deleteSchedulation(serviceCall).then(() => {
            this.refresh([this.dateService.date_getDate(serviceCall.date_start)]);
          });
        });
      }
    });
  }

  serviceCall_createTaskAndOperation(eventInfo) {
    this.managerService.serviceCall_getFromId(eventInfo.event.id).then((serviceCall) => {
      let dialog = this.managerService.dialog_open(ServiceOperationExtFormComponent, "Crea Intervento da Appuntamento", true, true, { width: "750px", height: "90%" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceOperationExtFormComponent;
      //
      component.serviceCall = serviceCall;
      //
      dialog.afterClosed().subscribe(() => {
        this.refresh();
      });
    });
  }

  public serviceCall_openSendMailForm(eventInfo) {
    this.managerService.serviceCall_getFromId(eventInfo.event.id).then((serviceCall) => {
      let dialog = this.managerService.dialog_open(ServiceCallMailFormComponent, "Invio Mail", true, true, { width: "70%", height: "250px" });
      let component = dialog.componentInstance.componentInnerInstance as ServiceCallMailFormComponent;
      //
      component.serviceCall = serviceCall;
      //
      dialog.afterClosed().subscribe((a) => {
        this.refresh();
      });
    });
  }
}
