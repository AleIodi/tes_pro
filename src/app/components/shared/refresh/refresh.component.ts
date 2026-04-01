import { Component, OnInit, HostListener } from '@angular/core';

@Component({
    selector: 'app-refresh',
    templateUrl: './refresh.component.html',
    styleUrls: ['./refresh.component.scss'],
    standalone: false
})

export class RefreshComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("RefreshComponent"); event.stopPropagation(); } }

  constructor() { }

  ngOnInit(): void { }
}
