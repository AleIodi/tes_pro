import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SwUpdate } from '@angular/service-worker';

import { UpdateService } from 'src/app/services/update.service'

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent {
  title = "4Service PWA";

  constructor(private updateService: UpdateService, public dialog: MatDialog) {
    this.updateService.checkForUpdates();
  }

  ngOnInit() { }
}
