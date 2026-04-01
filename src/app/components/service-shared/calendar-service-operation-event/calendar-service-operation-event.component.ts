import { Component, OnInit, Input, HostListener } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-calendar-service-operation-event',
    templateUrl: './calendar-service-operation-event.component.html',
    styleUrls: ['./calendar-service-operation-event.component.scss'],
    standalone: false
})

export class CalendarServiceOperationEventComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("CalendarServiceOperationEventComponent"); event.stopPropagation(); } }

  @Input() context;
  @Input() element;
  @Input() serviceOperation!: DB.IDB_service_operation;
  @Input() color!: string;
  @Input() textColor!: string;

  user: DB.DB_user;
  isDifferentUser: boolean;

  constructor(private idbService: IdbService, private managerService: ManagerService, private authService: AuthService) { }

  async ngOnInit() {
    this.user = await this.managerService.user_getFromId(this.serviceOperation.id_user);
    //
    if (this.user.id == this.authService.getUserLogged().id) {
      this.isDifferentUser = false;
    }
    else{
      this.isDifferentUser = true;
    }
    //
    if(this.isDifferentUser){
      let time_div = this.element.querySelector(".fc-event-time");
      this.element.setAttribute("title", this.user.name_first + " " + this.user.name_last);
      time_div.innerHTML =  time_div.innerHTML + " [" + this.user.name_first + " " + this.user.name_last + "]";
    }
  }
}
