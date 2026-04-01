import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-operation-ext-list',
    templateUrl: './service-operation-ext-list.component.html',
    styleUrls: ['./service-operation-ext-list.component.scss'],
    standalone: false
})

export class ServiceOperationExtListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceOperationExtListComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
