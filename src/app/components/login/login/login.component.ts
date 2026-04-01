import { Component, HostListener, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

import { AuthService } from '../../../services/auth.service';
import { SyncService } from '../../../services/sync.service';

import { NotificationComponent } from '../../shared/notification/notification.component';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})

export class LoginComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("LoginComponent"); event.stopPropagation(); } }

  appVersion = null;

  usernameField = new UntypedFormControl();
  passwordField = new UntypedFormControl();

  constructor(
    private router: Router,
    private authService: AuthService,
    private syncService: SyncService,
    public snackBar: MatSnackBar
  ) {
    this.appVersion = environment.app_version;
    //
    authService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(["/welcome"]);
      }
    });
  }

  async ngOnInit() {
    await this.syncService.pushToServer(["user"], false);
    this.syncService.pullFromServer(["user_group", "user"], false, true, {}, true);
  }

  async login() {
    let isLogged = await this.authService.login(this.usernameField.value ?? null, this.passwordField.value ?? null, true, "/welcome");
    //
    if (!isLogged) {
      this.usernameField.setValue("");
      this.passwordField.setValue("");
      //
      this.snackBar.openFromComponent(NotificationComponent, {
        duration: 3000,
        data: {
          text: "Utente o password non validi"
        },
      })
    }
  }
}
