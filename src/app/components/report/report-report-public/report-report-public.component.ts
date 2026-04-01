import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IDB_service_task_report } from 'src/app/idb/4service-pwa.idb';
import { ManagerService } from 'src/app/services/manager.service';
import { SyncService } from 'src/app/services/sync.service';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
    selector: 'app-report-report-public',
    templateUrl: './report-report-public.component.html',
    styleUrls: ['./report-report-public.component.scss'],
    standalone: false
})

export class ReportReportPublicComponent implements OnInit {
  serviceTaskReport!: IDB_service_task_report;
  isLoading: boolean = true;

  constructor(
    private userSettingService: UserSettingService,
    private managerService: ManagerService,
    private syncService: SyncService,
    private activatedRoute: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.activatedRoute.queryParams.subscribe(async paramObj => {
      let datacrypt = paramObj["datacrypt"];
      //
      this.userSettingService.setLocalStorage("service_task_report_public_idr", null);
      //
      await this.syncService.pullFromServer([], false, false, {
        type: "SERVICE_TASK_REPORT",
        datacrypt: datacrypt,
      }, true);
      //
      let serviceTaskReportPublicIdr = this.userSettingService.getLocalStorage("service_task_report_public_idr", null);
      //
      if (serviceTaskReportPublicIdr) {
        this.serviceTaskReport = await this.managerService.serviceTaskReport_getFromIdr(parseInt(serviceTaskReportPublicIdr));
        //
        this.managerService.serviceTaskReport_setViewed(this.serviceTaskReport);
      }
      else {
        //TODO
      }
      //
      this.isLoading = false;
    });
  }
}
