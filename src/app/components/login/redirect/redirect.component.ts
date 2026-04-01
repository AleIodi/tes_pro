import { Component, HostListener, OnInit } from '@angular/core';

import { ActivatedRoute } from "@angular/router";

import { AuthService } from 'src/app/services/auth.service';

@Component({
    selector: 'app-redirect',
    templateUrl: './redirect.component.html',
    styleUrls: ['./redirect.component.scss'],
    standalone: false
})

export class RedirectComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("RedirectComponent"); event.stopPropagation(); } }

  constructor(private route: ActivatedRoute, private authService: AuthService) {
    let paramUsername = route.snapshot.queryParams["username"] ?? null;
    let paramPasswordMD5 = route.snapshot.queryParams["password"] ?? null;
    let paramRoute = route.snapshot.queryParams["route"] ?? null;

    if (paramUsername && paramPasswordMD5 && paramRoute) {
      authService.login(paramUsername, paramPasswordMD5, false, paramRoute);
    }
  }

  ngOnInit(): void { }
}
