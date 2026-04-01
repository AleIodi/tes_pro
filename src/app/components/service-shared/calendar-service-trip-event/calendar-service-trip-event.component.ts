import { Component, OnInit, Input, HostListener } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-calendar-service-trip-event',
    templateUrl: './calendar-service-trip-event.component.html',
    styleUrls: ['./calendar-service-trip-event.component.scss'],
    standalone: false
})
export class CalendarServiceTripEventComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("CalendarServiceTripEventComponent"); event.stopPropagation(); } }

  @Input() context;
  @Input() element;
  @Input() serviceTrip!: DB.IDB_service_trip;
  @Input() color!: string;
  @Input() textColor!: string;

  user: DB.DB_user;
  isDifferentUser: boolean;

  constructor(private idbService: IdbService, private managerService: ManagerService, private authService: AuthService) { }

  async ngOnInit() {
    this.user = await this.managerService.user_getFromId(this.serviceTrip.id_user);
    //
    if (this.user.id == this.authService.getUserLogged().id) {
      this.isDifferentUser = false;
    }
    else {
      this.isDifferentUser = true;
    }
    //
    if (this.isDifferentUser) {
      let time_div = this.element.querySelector(".fc-event-time");
      this.element.setAttribute("title", this.user.name_first + " " + this.user.name_last);
      time_div.innerHTML = time_div.innerHTML + " [" + this.user.name_first + " " + this.user.name_last + "]";
    }
  }
}
