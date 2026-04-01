import { Component, OnInit, Inject, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatDialogRef } from '@angular/material/dialog';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { ManagerService } from '../../../services/manager.service'
import { AuthService } from 'src/app/services/auth.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-product-form',
    templateUrl: './product-form.component.html',
    styleUrls: ['./product-form.component.scss'],
    standalone: false
})

export class ProductFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ProductFormComponent"); event.stopPropagation(); } }

  @Input() product!: DB.IDB_product;

  confirmClicked = false;

  formGroupObj = {
    article: new UntypedFormControl("", [Validators.required]),
    name: new UntypedFormControl("", [Validators.required]),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  constructor(public dialogRef: MatDialogRef<ProductFormComponent>, private idbService: IdbService, private managerService: ManagerService, private authService: AuthService) { }

  async ngOnInit() {
    if (this.product) {
      this.formGroupObj.article.setValue(this.product.article);
      this.formGroupObj.name.setValue(this.product.name);
    }
    this.formGroupObj.article.disable();
  }

  async save() {
    this.confirmClicked = true;
    //
    this.product=await this.managerService.product_inup(this.authService.getUserLogged(), {
      product: this.product ?? null,
      article: this.formGroupObj.article.value,
      name: this.formGroupObj.name.value,
    });
    //
    //
    this.dialogRef.close();
  }

  delete() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Cancellare Prodotto", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Procedere?";
    //
    dialog.afterClosed().subscribe(result => {
      if (result) {
        this.managerService.product_delete(this.product);
        //
        this.dialogRef.close();
      }
    });
  }
}
