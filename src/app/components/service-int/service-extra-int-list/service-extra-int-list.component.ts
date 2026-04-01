import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-service-extra-int-list',
    templateUrl: './service-extra-int-list.component.html',
    styleUrls: ['./service-extra-int-list.component.scss'],
    standalone: false
})

export class ServiceExtraIntListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceExtraIntListComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
