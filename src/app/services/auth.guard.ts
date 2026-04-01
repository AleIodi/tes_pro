import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AuthService, USER_GROUP } from './auth.service';
import { SyncService } from './sync.service';
import { NotificationComponent } from '../components/shared/notification/notification.component';

@Injectable()
export class AuthGuard  {
  constructor(private authService: AuthService, private syncService: SyncService, private router: Router, private snackBar: MatSnackBar) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    //
    //CHECK USER
    //
    let isUserLogged = this.authService.isUserLogged();
    if (isUserLogged) {
      //
      //CHECK USER_GROUP
      //
      let userGroupAuthList = route.data.userGroupAuthList as string[];
      if (userGroupAuthList && userGroupAuthList.length > 0) {
        let isUserGroupValid = this.authService.isUserGroupValid(userGroupAuthList);
        if (!isUserGroupValid) {
          let error = "Permesso negato: Gruppo senza permessi";
          console.log(error);
          this.snackBar.openFromComponent(NotificationComponent, {
            duration: 3000,
            data: {
              text: error
            },
          })
        }
        //
        return isUserGroupValid;
      }
      else {
        return true;
      }
    }
    else {
      let error = "Permesso negato: Utente non connesso";
      console.log(error);
      /*
      this.snackBar.openFromComponent(NotificationComponent, {
        duration: 3000,
        data: {
          text: error
        },
      })
      */
      //
      this.router.navigate(["/login"]);
      //
      return false;
    }
  }
}
