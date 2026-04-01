import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-base',
    templateUrl: './base.component.html',
    styleUrls: ['./base.component.scss'],
    standalone: false
})

export class BaseComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) {
    if (event.ctrlKey && event.shiftKey && event.altKey) {
      alert("this.componentName");
      event.stopPropagation();
    }
  }

  constructor() { }

  ngOnInit(): void { }
}
