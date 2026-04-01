import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-calendar-int',
    templateUrl: './service-calendar-int.component.html',
    styleUrls: ['./service-calendar-int.component.scss'],
    standalone: false
})

export class ServiceCalendarIntComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCalendarIntComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
