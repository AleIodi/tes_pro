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
    selector: 'app-destination-form',
    templateUrl: './destination-form.component.html',
    styleUrls: ['./destination-form.component.scss'],
    standalone: false
})
export class DestinationFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("DestinationFormComponent"); event.stopPropagation(); } }

  @Input() destination!: DB.IDB_consumer;
  @Input() consumer!: DB.IDB_consumer;

  confirmClicked = false;

  formGroupObj = {
    consumer: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    code: new UntypedFormControl("", [Validators.required]),
    name: new UntypedFormControl("", [Validators.required]),
    address: new UntypedFormControl("", [Validators.required]),
    city: new UntypedFormControl("", [Validators.required]),
    province: new UntypedFormControl("", [Validators.required]),
    nation: new UntypedFormControl("", [Validators.required]),
    zip: new UntypedFormControl("", [Validators.required]),
    trip_km: new UntypedFormControl("", [CustomValidator.number]),
    trip_minutes: new UntypedFormControl("", [CustomValidator.number]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  consumerAutocompleteObj = {
    dataList: new Observable<DB.IDB_consumer[]>(),
    setDataList: async () => {
      await this.managerService.customer_getList().then(customerList => {
        this.consumerAutocompleteObj.dataList = this.formGroupObj.consumer.valueChanges
          .pipe(
            startWith(""),
            map(value => typeof value === "string" ? value : value.name),
            map(name => name ? this.consumerAutocompleteObj.filter(customerList, name) : customerList.slice())
          );
      });
    },
    display: (consumer: DB.IDB_consumer): string => {
      return consumer && consumer.code ? consumer.code + " - " + consumer.name : "";
    },
    filter: (consumerList: DB.IDB_consumer[], filterText: string): DB.IDB_consumer[] => {
      return consumerList.filter(consumer => (consumer.code + " " + consumer.name).toLowerCase().includes(filterText.toLowerCase()));
    },
    optionSelected: async (event) => {
      let consumer: DB.IDB_consumer = event.option.value;
    }
  };

  constructor(public dialogRef: MatDialogRef<DestinationFormComponent>, private idbService: IdbService, private managerService: ManagerService) { }

  async ngOnInit() {
    if (this.destination) {
      this.consumer = await this.managerService.consumer_getFromId(this.destination.id_consumer_parent);
      //
      this.formGroupObj.code.setValue(this.destination.code);
      this.formGroupObj.name.setValue(this.destination.name);
      this.formGroupObj.address.setValue(this.destination.address);
      this.formGroupObj.city.setValue(this.destination.city);
      this.formGroupObj.zip.setValue(this.destination.zip);
      this.formGroupObj.province.setValue(this.destination.province);
      this.formGroupObj.nation.setValue(this.destination.nation);
      this.formGroupObj.trip_km.setValue(this.destination.trip_km);
      this.formGroupObj.trip_minutes.setValue(this.destination.trip_minutes);
    }
    //
    if (this.consumer) {
      this.formGroupObj.consumer.setValue(this.consumer);
      this.formGroupObj.consumer.disable();
    }
    //
    //TODO
    //this.formGroupObj.consumer.disable();
    //
    this.autocomplete_loadData();
  }

  autocomplete_loadData() {
    this.consumerAutocompleteObj.setDataList();
  }

  async save() {
    this.confirmClicked = true;
    //
    let consumerTypology = await this.managerService.consumerTypology_getFromCode(DB.CONSUMER_TYPOLOGY.DESTINATION);
    //
    this.managerService.consumer_inup({
      consumer: this.destination ?? null,
      consumer_parent: this.formGroupObj.consumer.value,
      consumer_typology: consumerTypology,
      code: this.formGroupObj.code.value,
      name: this.formGroupObj.name.value,
      address: this.formGroupObj.address.value,
      city: this.formGroupObj.city.value,
      zip: this.formGroupObj.zip.value,
      province: this.formGroupObj.province.value,
      nation: this.formGroupObj.nation.value,
      trip_km: this.formGroupObj.trip_km.value,
      trip_minutes: this.formGroupObj.trip_minutes.value,
    });
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Destinazione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.consumer_delete(this.destination);
        //
        this.dialogRef.close();
      }
    });
  }
}
