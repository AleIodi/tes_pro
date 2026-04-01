import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { CustomValidator } from 'src/app/classes/custom-validator';

@Component({
    selector: 'app-contact-form',
    templateUrl: './contact-form.component.html',
    styleUrls: ['./contact-form.component.scss'],
    standalone: false
})

export class ContactFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ContactFormComponent"); event.stopPropagation(); } }

  @Input() contact!: DB.IDB_contact;

  confirmClicked = false;

  formGroupObj = {
    nameFirst: new UntypedFormControl("", [Validators.required]),
    nameLast: new UntypedFormControl("", [Validators.required]),
    consumer: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    phone: new UntypedFormControl("", []),
    email: new UntypedFormControl("", []),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  consumerAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: () => {
      this.managerService.customer_getList().then(consumerList => {
        this.consumerAutocompleteObj.dataList = this.formGroupObj.consumer.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.consumerAutocompleteObj.filter(consumerList, name) : consumerList.slice())
          );
      });
    },
    display: (consumer: DB.IDB_consumer): string => {
      return consumer && consumer.code ? consumer.code + " - " + consumer.name : "";
    },
    filter: (consumerList: DB.IDB_consumer[], filterText: string): DB.IDB_consumer[] => {
      return consumerList.filter(consumer => (consumer.code + " " + consumer.name).toLowerCase().includes(filterText.toLowerCase()));
    }
  };

  constructor(public dialogRef: MatDialogRef<ContactFormComponent>, private idbService: IdbService, private managerService: ManagerService) { }

  async ngOnInit() {
    let consumer: DB.IDB_consumer;

    if (this.contact) {
      if (this.contact.id_consumer) {
        consumer = await this.managerService.consumer_getFromId(this.contact.id_consumer);
      }
      //
      this.formGroupObj.nameFirst.setValue(this.contact.name_first);
      this.formGroupObj.nameLast.setValue(this.contact.name_last);
      this.formGroupObj.consumer.setValue(consumer);
      this.formGroupObj.phone.setValue(this.contact.phone);
      this.formGroupObj.email.setValue(this.contact.email);
    }

    this.consumerAutocompleteObj.setDataList();
  }

  async save() {
    this.confirmClicked = true;
    //
    this.managerService.contact_inup({
      contact: this.contact ?? null,
      consumer: this.formGroupObj.consumer.value ?? null,
      name_first: this.formGroupObj.nameFirst.value,
      name_last: this.formGroupObj.nameLast.value,
      email: this.formGroupObj.email.value,
      phone: this.formGroupObj.phone.value,
    });
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Contatto", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.contact_delete(this.contact);
        //
        this.dialogRef.close();
      }
    });
  }
}
