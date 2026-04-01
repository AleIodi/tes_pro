import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { SignatureComponent } from '../../shared/signature/signature.component';
import { ManagerService } from 'src/app/services/manager.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../../shared/notification/notification.component';

@Component({
    selector: 'app-user-signature',
    templateUrl: './user-signature.component.html',
    styleUrls: ['./user-signature.component.scss'],
    standalone: false
})

export class UserSignatureComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("UserSignatureComponent"); event.stopPropagation(); } }

  @Input() _saveCallback;
  @Input() user!: DB.DB_user;

  confirmClicked = false;

  @ViewChild(SignatureComponent) signatureComponent!: SignatureComponent;

  constructor(
    private idbService: IdbService,
    private managerService: ManagerService,
    public snackBar: MatSnackBar
    ) { }

  ngOnInit(): void { }

  async save() {
    this.confirmClicked = true;
    //
    if (!this.signatureComponent.signaturePad.isEmpty()) {
      let signature = this.signatureComponent.getData();
      //
      this.user = await this.managerService.user_setSignature(this.user, signature);
      //
      if (this._saveCallback) {
        this._saveCallback();
      }
      //
      this.snackBar.openFromComponent(NotificationComponent, {
        duration: 3000,
        data: {
          text: "Firma salvata"
        },
      })
    }
    else{
      this.snackBar.openFromComponent(NotificationComponent, {
        duration: 3000,
        data: {
          text: "Errore - Firma non trovata"
        },
      })
    }
  }

  async clear() {
    this.signatureComponent.clear();
  }
}
