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

@Component({
    selector: 'app-verbal-mail-details',
    templateUrl: './verbal-mail-details.component.html',
    styleUrls: ['./verbal-mail-details.component.scss'],
    standalone: false
})
export class VerbalMailDetailsComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalMailDetailsComponent"); event.stopPropagation(); } }

  @Input() _title: string  = "";
  @Input() autodopVerbal!: DB.IDB_autodop_verbal;

  isSendMailDisabled = false;
  contact: DB.IDB_contact;

  formGroupObj = {
    contact: new UntypedFormControl("", [CustomValidator.object]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  contactAutocompleteObj = {
    dataList: new Observable<DB.IDB_contact[]>(),
    setDataList: async () => {
      this.managerService.contact_getList().then(contactList => {
        this.contactAutocompleteObj.dataList = this.formGroupObj.contact.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : (value ? this.contact_getMailString(value) : "")),
            map(value => this.contactAutocompleteObj.filter(contactList, value))
          );
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
    buttonObj: {
      label: "Crea nuovo contatto",
      click: () => { this.addContact() },
      icon: "mdi mdi-plus",
    }
  };

  constructor(
    public dialogRef: MatDialogRef<VerbalMailDetailsComponent>,
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
      mail_type: "AUTODOP_VERBAL",
      autodopVerbal: this.autodopVerbal,
      contactList: this.contactAutocompleteObj.chipsObj.dataList,
    });
    //
    if(success){
      await this.managerService.autodopVerbal_setSent(this.autodopVerbal);
      await this.managerService.autodopVerbalMail_saveSent(this.autodopVerbal,this.contactAutocompleteObj.chipsObj.dataList);
    }
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

  addContact() {
    let dialog = this.managerService.dialog_open(ContactFormComponent, "Aggiungi Contatto", true, true, { width: "40%", height: "500px" });
    let component = dialog.componentInstance.componentInnerInstance as ContactFormComponent;
    //
    dialog.afterClosed().subscribe(async () => {
      await this.contactAutocompleteObj.setDataList();
      //
      //TODO - Selezionare subito quello appena creato
    });
  }
}
