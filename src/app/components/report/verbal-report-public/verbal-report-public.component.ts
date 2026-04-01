import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IDB_autodop_verbal, IDB_autodop_verbal_typology, IDB_machine } from 'src/app/idb/4service-pwa.idb';
import { ManagerService } from 'src/app/services/manager.service';
import { SyncService } from 'src/app/services/sync.service';
import { UserSettingService } from 'src/app/services/user-setting.service';

@Component({
    selector: 'app-verbal-report-public',
    templateUrl: './verbal-report-public.component.html',
    styleUrls: ['./verbal-report-public.component.scss'],
    standalone: false
})
export class VerbalReportPublicComponent implements OnInit {
  autodopVerbal!: IDB_autodop_verbal;
  autodopVerbalTypology!: IDB_autodop_verbal_typology;
  machine!: IDB_machine;
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
      this.userSettingService.setLocalStorage("autodop_verbal_public_idr", null);
      //
      await this.syncService.pullFromServer([], false, false, {
        type: "AUTODOP_VERBAL",
        datacrypt: datacrypt,
      }, true);
      //
      let autodopVerbalPublicIdr = this.userSettingService.getLocalStorage("autodop_verbal_public_idr", null);
      //
      if(autodopVerbalPublicIdr) {
        this.autodopVerbal = await this.managerService.autodopVerbal_getFromIdr(parseInt(autodopVerbalPublicIdr));
        this.autodopVerbalTypology = await this.managerService.autodopVerbalTypology_getFromId(this.autodopVerbal.id_autodop_verbal_typology);
        this.machine = await this.managerService.machine_getFromId(this.autodopVerbal.id_machine);
        //
        //this.managerService.autodopVerbal_setViewed(this.autodopVerbal);
      }
      else {
        //TODO
      }
      //
      this.isLoading = false;
    });
  }
}
