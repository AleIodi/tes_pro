import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { AbstractControl, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { AuthService } from '../../../services/auth.service'
import { ManagerService } from '../../../services/manager.service'
import { ProductFormComponent } from '../../product/product-form/product-form.component';
import { DateService } from 'src/app/services/date.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { CustomValidator } from 'src/app/classes/custom-validator';
import { UserSettingService } from '../../../services/user-setting.service';

@Component({
  selector: 'app-service-task-product-ext-form',
  templateUrl: './service-task-product-ext-form.component.html',
  styleUrls: ['./service-task-product-ext-form.component.scss'],
  standalone: false
})

export class ServiceTaskProductExtFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ServiceTaskProductExtFormComponent"); event.stopPropagation(); } }

  @Input() serviceTaskProduct!: DB.IDB_service_task_product;
  @Input() serviceTask!: DB.IDB_service_task;
  @Input() dateStart;

  truck: DB.IDB_truck | null = null;

  truckStockQnt: number | null = null;
  truckStockAvailable: number | null = null;
  truckStockList: DB.IDB_truck_stock[] = [];

  //confirmClicked = false;

  formGroupObj = {
    dateStart: new UntypedFormControl("", [Validators.required]),
    product: new UntypedFormControl("", [Validators.required, CustomValidator.object]),
    value: new UntypedFormControl("", [Validators.required, CustomValidator.number]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  productAutocompleteObj = {
    dataList: new Observable<DB.IDB_product[]>(),
    setDataList: async () => {
      let productList = await this.managerService.product_getList();
      //
      // carica lo stock del furgone
      if (this.truck) {
        this.truckStockList = await this.managerService.truckStock_getList(this.truck);
        // da qui
        let currentProductId = this.serviceTaskProduct ? this.serviceTaskProduct.id_product : null;
        //
        // mantiene solo i prodotti che sono nel furgone
        productList = productList.filter(product => {
          let stockEntry = this.truckStockList.find(s => s.id_product === product.id);
          //
          // mostro il prodotto se è nel furgone E ha quantità > 0
          return (stockEntry && stockEntry.qnt > 0) || product.id === currentProductId;
        });
      }
      // a qui per mostrare solo prodotti dello stock del furgone
      this.productAutocompleteObj.dataList = this.formGroupObj.product.valueChanges
        .pipe(
          startWith(""),
          map(value => typeof value === "string" ? value : value.name),
          map(name => name ? this.productAutocompleteObj.filter(productList, name) : productList.slice())
        );
    },
    display: (product: DB.IDB_product): string => {
      return product && product.article ? product.article + " - " + product.name : "";
    },
    filter: (productList: DB.IDB_product[], filterText: string): DB.IDB_product[] => {
      var filter_arr = filterText.toLowerCase().split(" ");
      //
      //filtro articoli che contengono tutte le stringhe separate da spazio (come &&)
      return productList.filter(product => {
        var is_ok = true;
        filter_arr.forEach(function (filter) {
          if (!((product.article + " " + product.name).toLowerCase().includes(filter.toLowerCase()))) {
            is_ok = false;
          }
        });
        //
        return is_ok;
      });
    },
    optionSelected: async (event) => {
      let product: DB.IDB_product = event.option.value;
      //
      // Reset disponibile
      this.truckStockQnt = null;
      this.truckStockAvailable = null;
      //
      // se c'è un furgone, ricarica lo stock aggiornato e calcola il disponibile
      if (this.truck) {
        this.truckStockList = await this.managerService.truckStock_getList(this.truck);
        let stockEntry = this.truckStockList.find(s => s.id_product === product.id);
        if (stockEntry) {
          let available = await this.getAvailableQnt(stockEntry, this.serviceTaskProduct?.id);
          this.truckStockQnt = Number(stockEntry.qnt);
          this.truckStockAvailable = available;
        }
        else {
          this.truckStockQnt = 0;
          this.truckStockAvailable = 0;
        }
        //
        let maxAllowed = this.truckStockAvailable;
        if (this.serviceTaskProduct && this.serviceTaskProduct.id_product === product.id) {
          maxAllowed += Number(this.serviceTaskProduct.value);
        }
        this.formGroupObj.value.setValidators([Validators.required, CustomValidator.number, Validators.max(maxAllowed)]);
        this.formGroupObj.value.updateValueAndValidity();
      }
    },
    /*Rimosso x interfacciamento ReadySolutions
    buttonObj: {
      label: "Crea nuovo prodotto",
      click: () => { this.addProduct() },
      icon: "mdi mdi-plus",
    }
    */
  };

  constructor(
    public dialogRef: MatDialogRef<ServiceTaskProductExtFormComponent>,
    private authService: AuthService,
    private idbService: IdbService,
    private managerService: ManagerService,
    private matDialog: MatDialog,
    private dateService: DateService,
    private userSettingService: UserSettingService
  ) {
    let truckId = this.userSettingService.getLocalStorage("id_truck_current");
    if (truckId && truckId !== "") {
      this.managerService.truck_getFromId(parseInt(truckId)).then(truck => {
        this.truck = truck ?? null;
      });
    }
  }

  async ngOnInit() {
    let product: DB.IDB_product;

    if (this.serviceTaskProduct) {
      product = await this.managerService.product_getFromId(this.serviceTaskProduct.id_product);
      //
      this.formGroupObj.product.setValue(product);
      this.formGroupObj.value.setValue(this.serviceTaskProduct.value);
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate((this.serviceTaskProduct.date_start)));

      if (this.truck) {
        this.truckStockList = await this.managerService.truckStock_getList(this.truck);
        let stockEntry = this.truckStockList.find(s => s.id_product === product.id);
        let available = stockEntry ? await this.getAvailableQnt(stockEntry, this.serviceTaskProduct.id) : 0;

        this.truckStockQnt = stockEntry ? Number(stockEntry.qnt) : 0;
        this.truckStockAvailable = available;

        // max consentito = disponibile + quantità già impegnata da questo record
        let maxAllowed = available + Number(this.serviceTaskProduct.value);
        this.formGroupObj.value.setValidators([Validators.required, CustomValidator.number, Validators.max(maxAllowed)]);
        this.formGroupObj.value.updateValueAndValidity();
      }
    }
    else {
      let dateStart = this.dateStart ?? new Date();
      //
      this.formGroupObj.dateStart.setValue(this.dateService.date_getDate(dateStart));
    }

    this.autocomplete_loadData(product);
  }

  autocomplete_loadData(product: DB.IDB_product) {
    this.productAutocompleteObj.setDataList();
  }

  private async getAvailableQnt(stockEntry: DB.IDB_truck_stock, excludeServiceTaskProductId?: number): Promise<number> {
    // carica tutti i prodotti pending (usati ma non ancora sincronizzati)
    let prod = await this.idbService.idb.table<DB.IDB_service_task_product>("service_task_product").toArray();
    let usedQnt = prod
      .filter(stp =>
        stp.id_product === stockEntry.id_product &&
        stp.to_push === "1" &&
        parseInt(stp.enabled) === 1 &&
        stp.id !== excludeServiceTaskProductId
      )
      .reduce((acc, stp) => acc + Number(stp.value ?? 0), 0);
    //
    return Math.max(0, Number(stockEntry.qnt) - usedQnt);
  }

  addProduct() {
    let dialog = this.managerService.dialog_open(ProductFormComponent, "Aggiungi Prodotto", true, true, { width: "90%", height: "400px" });
    let component = dialog.componentInstance.componentInnerInstance as ProductFormComponent;
    //
    dialog.afterClosed().subscribe(async () => {
      await this.productAutocompleteObj.setDataList();
      //
      //TODO - Selezionare subito quello appena creato
      this.formGroupObj.product.setValue(component.product);
    });
  }

  /*
  private confirm(title: string, message: string): Promise<boolean> {
    return new Promise(resolve => {
      let dialog = this.managerService.dialog_open(ConfirmComponent, title, true, true, { width: environment.dialog_confirm_width_xl, height: environment.dialog_confirm_height_xl });
      let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
      component.message = message;
      dialog.afterClosed().subscribe(result => resolve(!!result));
    });
  }
  */

  async save() {
    let product: DB.IDB_product = this.formGroupObj.product.value;
    let qty: number = Number(this.formGroupObj.value.value);
    //
    let oldQty: number = this.serviceTaskProduct ? Number(this.serviceTaskProduct.value) : 0;
    let diffQty: number = qty - oldQty;
    //
    // se c'è un furgone, verifico stock
    if (this.truck) {
      let stockEntry = this.truckStockList.find(s => s.id_product === product.id);
      //
      // prodotto non presente nel furgone
      /*if (!stockEntry) {
        let ok = await this.confirm(
          "Prodotto non nel furgone",
          `Il prodotto "${product.article} - ${product.name}" non è presente nello stock del furgone.\nContinuare comunque?`
        );
        if (!ok) return;
      }
      // Delta positivo superiore al disponibile
      if (diffQty > 0 && this.truckStockAvailable != null && diffQty > this.truckStockAvailable) {
        let ok = await this.confirm(
          "Quantità insufficiente",
          `Disponibile nel furgone: ${this.truckStockAvailable}.\nSi sta inserendo ${qty}.\nContinuare comunque?`
        );
        if (!ok) return;
      }
      */
      //
      // aggiorna truck_stock con la differenza: positivo = scala, negativo = ripristina
      if (stockEntry && diffQty !== 0) {
        let newQnt = Math.max(0, stockEntry.qnt - diffQty);
        await this.idbService.inup<DB.IDB_truck_stock>("truck_stock", {
          id: stockEntry.id,
          qnt: newQnt,
          to_push: "1",
        }, ["id"]);
      }
    }
    //
    //this.confirmClicked = true;
    //
    this.managerService.serviceTaskProduct_inup(this.authService.getUserLogged(), {
      service_task_product: this.serviceTaskProduct ?? null,
      service_task: this.serviceTask,
      product: product,
      value: qty,
      date_start: this.dateService.date_getDate(new Date(this.formGroupObj.dateStart.value)) + " " + this.dateService.date_getHourFirstInDay(),
    });
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Prodotto", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        // ripristina la quantità nel furgone se il prodotto era in stock
        if (this.truck && this.serviceTaskProduct) {
          await this.managerService.truckStock_getList(this.truck).then(async stockList => {
            let stockEntry = stockList.find(s => s.id_product === this.serviceTaskProduct.id_product);
            if (stockEntry) {
              await this.idbService.inup<DB.IDB_truck_stock>("truck_stock", {
                id: stockEntry.id,
                qnt: stockEntry.qnt + Number(this.serviceTaskProduct.value),
                to_push: "1",
              }, ["id"]);
            }
          });
        }
        //
        this.managerService.serviceTaskProduct_delete(this.serviceTaskProduct);
        //
        this.dialogRef.close();
      }
    });
  }
}
