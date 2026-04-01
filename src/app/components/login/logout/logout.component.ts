import { Component, HostListener, OnInit } from '@angular/core';

import { AuthService } from '../../../services/auth.service';

@Component({
    selector: 'app-logout',
    templateUrl: './logout.component.html',
    styleUrls: ['./logout.component.scss'],
    standalone: false
})

export class LogoutComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("LogoutComponent"); event.stopPropagation(); } }

  constructor(private authService: AuthService) {
    authService.logout();
  }

  ngOnInit(): void { }
}
