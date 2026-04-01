import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-extra-ext-list',
    templateUrl: './service-extra-ext-list.component.html',
    styleUrls: ['./service-extra-ext-list.component.scss'],
    standalone: false
})

export class ServiceExtraExtListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceExtraExtListComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
