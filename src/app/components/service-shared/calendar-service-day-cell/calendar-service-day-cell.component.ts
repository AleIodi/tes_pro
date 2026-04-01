import { Component, OnInit, Input, HostListener } from '@angular/core';
import { ManagerService } from '../../../services/manager.service'
import { IdbService } from 'src/app/services/idb.service';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-calendar-service-day-cell',
    templateUrl: './calendar-service-day-cell.component.html',
    styleUrls: ['./calendar-service-day-cell.component.scss'],
    standalone: false
})

export class CalendarServiceDayCellComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("CalendarServiceDayCellComponent"); event.stopPropagation(); } }

  @Input() context;
  @Input() date;
  @Input() serviceTypologyCode!: string;

  dayWorkHours;
  serviceOperationWorkHours;

  serviceExtraRefundList;
  serviceExtraDayList;

  constructor(private idbService: IdbService, private managerService: ManagerService) {
  }

  async ngOnInit() {
    let hoursObj = await this.managerService.day_getHoursObj(this.managerService.getUserList(),this.date, this.serviceTypologyCode);
    //
    this.dayWorkHours = hoursObj["dayWorkHours"];
    this.serviceOperationWorkHours = hoursObj["serviceOperationWorkHours"];

    this.serviceExtraRefundList = hoursObj["serviceExtraRefundList"];
    this.serviceExtraDayList = hoursObj["serviceExtraDayList"];
  }

  getServiceExtraRefundTooltip() {
    let tooltipText = "";
    //
    let serviceExtraList = this.serviceExtraRefundList;
    for (let serviceExtraK in serviceExtraList) {
      let serviceExtra = serviceExtraList[serviceExtraK];
      //
      tooltipText += serviceExtra["service_extra_typology"]["name"] + ": " + serviceExtra["value"] + "\n";
    }
    return tooltipText;
  }

  getServiceExtraDayTooltip() {
    let tooltipText = "";
    //
    if (this.serviceOperationWorkHours) {
      tooltipText = "Lavoro: " + this.serviceOperationWorkHours + "\n";
    }
    //
    let serviceExtraList = this.serviceExtraDayList;
    for (let serviceExtraK in serviceExtraList) {
      let serviceExtra = serviceExtraList[serviceExtraK];
      //
      tooltipText += serviceExtra["service_extra_typology"]["name"] + ": " + serviceExtra["value"] + "\n";
    }
    return tooltipText;
  }
}
