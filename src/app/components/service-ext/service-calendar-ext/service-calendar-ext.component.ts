import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-calendar-ext',
    templateUrl: './service-calendar-ext.component.html',
    styleUrls: ['./service-calendar-ext.component.scss'],
    standalone: false
})

export class ServiceCalendarExtComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCalendarExtComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
