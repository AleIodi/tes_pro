import { Injectable } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { interval } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConfirmComponent } from '../components/shared/confirm/confirm.component';
import { ManagerService } from './manager.service';

@Injectable({
  providedIn: 'root'
})
export class UpdateService {
  constructor(public updates: SwUpdate, private managerService: ManagerService) {
    if (updates.isEnabled) {
      interval(6 * 60 * 60).subscribe(() => updates.checkForUpdate());
    }
  }

  public checkForUpdates(): void {
    this.updates.versionUpdates
      .pipe(
        filter(
          (event): event is VersionReadyEvent =>
            event.type === 'VERSION_READY'
        )
      )
      .subscribe(() => this.promptUser());
  }

  private promptUser(): void {
    console.log('Aggiornamento alla nuova versione');

    const dialog = this.managerService.dialog_open(
      ConfirmComponent,
      'Attenzione',
      true,
      true,
      { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height }
    );

    const component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    component.message = 'Nuova versione disponibile.\nAggiornare ora?';

    dialog.afterClosed().subscribe(async result => {
      if (result) {
        this.updates.activateUpdate().then(() => document.location.reload());
      }
    });
  }
}