import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Observer, fromEvent, merge, interval, BehaviorSubject } from 'rxjs';
import { map, switchMap, filter, catchError, timeout, startWith } from 'rxjs/operators';
import { of } from 'rxjs';

import { SyncService } from './sync.service';
import { nextTick } from 'process';
import { RSA_X931_PADDING } from 'constants';
import { UserSettingService } from './user-setting.service';

@Injectable({
  providedIn: 'root'
})

export class ConnectionService {
  public isOnline$: BehaviorSubject<boolean> = new BehaviorSubject(null);

  constructor(private httpClient: HttpClient, private syncService: SyncService, private userSettingService: UserSettingService) {
    this.isOnline$ = new BehaviorSubject<boolean>(false);
    //
    this.isServerOnlineInterval$(5000).subscribe((isServerOnline) => {
      this.isOnline$.next(isServerOnline);
      //
      if (!isServerOnline) {
        let sideOld = userSettingService.getLocalStorage("side", "remote");
        let sideNew = sideOld == "remote" ? "local" : "remote";
        //
        userSettingService.setLocalStorage("side", sideNew);
        //
        console.log("Switched to side " + sideNew);
      }
    });
  }

  private isServerOnlineInterval$(milliseconds) {
    return interval(milliseconds).pipe(
      startWith(0),
      switchMap(e => this.isServerOnline$())
    );
  }

  private isServerOnline$() {
    return this.syncService.check$().pipe(
      timeout(500),
      map(e => e ? true : false),
      catchError(error => {
        return of(false);
      })
    );
  }
}

