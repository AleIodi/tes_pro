import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-operation-int-list',
    templateUrl: './service-operation-int-list.component.html',
    styleUrls: ['./service-operation-int-list.component.scss'],
    standalone: false
})

export class ServiceOperationIntListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceOperationIntListComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
