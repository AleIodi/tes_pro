import { Component, OnInit, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ManagerService } from '../../../services/manager.service';
import { SyncService } from '../../../services/sync.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { UserSettingService } from 'src/app/services/user-setting.service';
import { DateService } from 'src/app/services/date.service';

@Component({
  selector: 'app-truck-form',
  templateUrl: './truck-form.component.html',
  styleUrls: ['./truck-form.component.scss'],
  standalone: false
})
export class TruckFormComponent implements OnInit {
  @HostListener('click', ['$event']) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert('TruckFormComponent'); event.stopPropagation(); } }

  @Input() currentTruck: DB.IDB_truck | null = null;

  hasPending: boolean = false;
  confirmClicked = false;

  formGroupObj = {
    truck: new UntypedFormControl("", [Validators.required]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  truckAutocompleteObj = {
    dataList: new Observable<DB.IDB_truck[]>(),
    setDataList: () => {
      this.managerService.truck_getList().then(truckList => {
        this.truckAutocompleteObj.dataList = this.formGroupObj.truck.valueChanges.pipe(
          startWith(''),
          map(value => typeof value === 'string' ? value : value.name),
          map(name => name ? this.truckAutocompleteObj.filter(truckList, name) : truckList.slice())
        );
      });
    },
    display: (truck: DB.IDB_truck): string => {
      return truck && truck.code ? truck.code + ' - ' + truck.name : '';
    },
    filter: (truckList: DB.IDB_truck[], filterText: string): DB.IDB_truck[] => {
      return truckList.filter(t => (t.code + ' ' + t.name).toLowerCase().includes(filterText.toLowerCase()));
    }
  };

  constructor(
    public dialogRef: MatDialogRef<TruckFormComponent>,
    private idbService: IdbService,
    private managerService: ManagerService,
    public snackBar: MatSnackBar,
    private userSettingService: UserSettingService,
    private syncService: SyncService,
    private dateService: DateService
  ) { }

  async ngOnInit() {
    // prodotti non sincronizzati
    let serviceTaskProductList = await this.idbService.idb.table<DB.IDB_service_task_product>("service_task_product").toArray();
    let hasPendingProducts = serviceTaskProductList.some(stp => stp.to_push === "1" && parseInt(stp.enabled) == 1);
    //
    // task senza report o con report in stato NEW
    let serviceTaskList = await this.managerService.serviceTask_getList(null);
    let serviceTaskReportStatusNew = await this.managerService.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.NEW);
    //
    let hasPendingTasks = serviceTaskList.some(st => {
      let report = st["service_task_report"];
      return !report || (serviceTaskReportStatusNew && report.id_service_task_report_status === serviceTaskReportStatusNew.id);
    });
    //
    this.hasPending = hasPendingProducts || hasPendingTasks;
    //
    if (this.currentTruck) {
      this.formGroupObj.truck.setValue(this.currentTruck);
    }
    //
    if (this.hasPending) {
      this.formGroupObj.truck.disable();
    }
    //
    this.truckAutocompleteObj.setDataList();
  }

  async save() {
    this.confirmClicked = true;
    //
    const selectedTruck: DB.IDB_truck = this.formGroupObj.truck.value;
    //
    let success = await this.managerService.truckStock_clear().then(() => {
      return this.syncService.pullFromServer(["truck_stock"], true, false, { "idr_truck": selectedTruck["idr"] }, true);
    });
    //
    this.snackBar.openFromComponent(NotificationComponent, {
      duration: 3000,
      data: {
        text: success ? "Giacenze aggiornate" : "Errore aggiornamento giacenze"
      },
    }).afterOpened().subscribe(() => {
      if (success) {
        const currentTruckDate = this.dateService.date_getDateTime(new Date());
        this.userSettingService.setLocalStorage("id_truck_current", selectedTruck.id.toString());
        this.userSettingService.setLocalStorage("date_truck_current", currentTruckDate);
        //
        this.dialogRef.close();
      }
      else {
        this.confirmClicked = false;
      }
    });
  }

  remove() {
    this.managerService.truckStock_clear().then(() => {
      this.userSettingService.setLocalStorage("id_truck_current", null);
      this.userSettingService.setLocalStorage("date_truck_current", null);
      //
      this.dialogRef.close();
    });
  }
}