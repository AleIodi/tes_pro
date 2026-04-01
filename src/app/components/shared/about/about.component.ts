import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SyncService } from 'src/app/services/sync.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.scss'],
    standalone: false
})

export class AboutComponent implements OnInit {
  appVersion = null;
  serverUrl = null;
  dateYear: string = formatDate(new Date(), "yyyy", "en-EN");

  constructor(private syncService: SyncService) {
    this.appVersion = environment.app_version;
    this.serverUrl = syncService.getUrl();
  }

  ngOnInit() { }
}
