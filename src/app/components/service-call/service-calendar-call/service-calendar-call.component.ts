import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-calendar-call',
    templateUrl: './service-calendar-call.component.html',
    styleUrls: ['./service-calendar-call.component.scss'],
    standalone: false
})
export class ServiceCalendarCallComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCalendarComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void {
  }

}
