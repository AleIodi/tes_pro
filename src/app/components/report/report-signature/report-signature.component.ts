import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { SignatureComponent } from '../../shared/signature/signature.component';
import { ManagerService } from 'src/app/services/manager.service';

@Component({
    selector: 'app-report-signature',
    templateUrl: './report-signature.component.html',
    styleUrls: ['./report-signature.component.scss'],
    standalone: false
})

export class ReportSignatureComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ReportSignatureComponent"); event.stopPropagation(); } }

  @Input() _saveCallback;
  @Input() serviceTaskReport!: DB.IDB_service_task_report;

  confirmClicked = false;

  @ViewChild(SignatureComponent) signatureComponent!: SignatureComponent;

  constructor(private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit(): void { }

  async save() {
    this.confirmClicked = true;
    //
    let signature = this.signatureComponent.getData();
    //
    this.serviceTaskReport = await this.managerService.serviceTaskReport_setSignature(this.serviceTaskReport, signature);
    //
    if (this._saveCallback) {
      this._saveCallback(this.serviceTaskReport);
    }
  }

  async clear() {
    this.signatureComponent.clear();
  }
}
