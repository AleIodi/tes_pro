import { Component, OnInit, Input, HostListener, ElementRef, ViewChild } from '@angular/core';

import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatAutocompleteSelectedEvent, MatAutocomplete } from '@angular/material/autocomplete';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { SyncService } from 'src/app/services/sync.service';
import { ManagerService } from 'src/app/services/manager.service';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { MatDialogRef } from '@angular/material/dialog';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ContactFormComponent } from '../../contact/contact-form/contact-form.component';
import { FormFieldComponent } from '../../shared/form-field/form-field.component';
import { CustomValidator } from 'src/app/classes/custom-validator';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-service-call-mail-form',
    templateUrl: './service-call-mail-form.component.html',
    styleUrls: ['./service-call-mail-form.component.scss'],
    standalone: false
})
export class ServiceCallMailFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceCallMailFormComponent"); event.stopPropagation(); } }

  @Input() _title: string  = "";
  @Input() serviceCall!: DB.IDB_service_call;

  isSendMailDisabled = false;
  contact: DB.IDB_contact;

  formGroupObj = {
    contact: new UntypedFormControl("", [CustomValidator.object]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  contactAutocompleteObj = {
    dataList: new Observable<DB.IDB_contact[]>(),
    setDataList: async () => {
      this.managerService.consumer_getFromId(environment.id_consumer_autodop).then(consumer => {
        this.managerService.contact_getList(consumer).then(contactList => {
          this.contactAutocompleteObj.dataList = this.formGroupObj.contact.valueChanges
            .pipe(
              startWith(""),
              map(value => typeof value === "string" ? value : (value ? this.contact_getMailString(value) : "")),
              map(value => this.contactAutocompleteObj.filter(contactList, value))
            );
        });
      });
    },
    display: (contact: DB.IDB_contact): string => {
      return this.contact_getMailString(contact);
    },
    filter: (contactList: DB.IDB_contact[], filterText: string): DB.IDB_contact[] => {
      let contactSelectableList = [];
      //
      for (let contactK in contactList) {
        let contact = contactList[contactK];
        //
        let found = false;
        for (let contactField_ContactSelectedK in this.contactAutocompleteObj.chipsObj.dataList) {
          let contactField_ContactSelected = this.contactAutocompleteObj.chipsObj.dataList[contactField_ContactSelectedK];
          //
          if (contact.id == contactField_ContactSelected.id) {
            found = true;
            break;
          }
        }
        //
        if (!found) {
          contactSelectableList.push(contact);
        }
      }
      //
      return contactSelectableList.filter(contact => (this.contact_getMailString(contact).toLowerCase()).includes(filterText.toLowerCase()));
    },
    chipsObj: {
      enabled: true,
      removable: true,
      required: true,
      dataList: [],
    },
  };

  constructor(
    public dialogRef: MatDialogRef<ServiceCallMailFormComponent>,
    private idbService: IdbService,
    private syncService: SyncService,
    private managerService: ManagerService,
    public snackBar: MatSnackBar
  ) { }

  async ngOnInit() {
    this.contactAutocompleteObj.setDataList();
  }

  async sendMail() {
    let success = await this.syncService.sendMail({
      mail_type: "TICKET",
      serviceCall: this.serviceCall,
      contactList: this.contactAutocompleteObj.chipsObj.dataList,
    });
    //
    this.snackBar.openFromComponent(NotificationComponent, {
      duration: 3000,
      data: {
        text: success ? "Completato" : "Errore"
      },
    }).afterOpened().subscribe(() => {
      this.dialogRef.close();
    });
    //
    this.dialogRef.close();
  }

  contact_getMailString(contact: DB.IDB_contact) {
    if (!contact) {
      return "";
    }
    //
    let mailString = contact.name_first + " " + contact.name_last + " <" + contact.email + ">";
    //
    return mailString;
  }
}
