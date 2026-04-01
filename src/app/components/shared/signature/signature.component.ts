import { Component, OnInit, ViewChild, Input, Output, EventEmitter, HostListener } from '@angular/core';

import { SignaturePadComponent, NgSignaturePadOptions } from '@almothafar/angular-signature-pad';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

@Component({
    selector: 'app-signature',
    templateUrl: './signature.component.html',
    styleUrls: ['./signature.component.scss'],
    standalone: false
})

export class SignatureComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("SignatureComponent"); event.stopPropagation(); } }

  @ViewChild('signatureCanvas', { static: true }) signaturePad!: SignaturePadComponent;

  @Input() data: string  = null;
  @Input() width: number  = 1000;
  @Input() height: number  = 250;
  @Input() readOnly: boolean  = false;
  @Input() showBorderBottom: boolean  = false;

  signaturePadOptions!: NgSignaturePadOptions | null;

  constructor(private idbService: IdbService) { }

  ngOnInit() {
    this.signaturePadOptions = {
      minWidth: 2,
      canvasWidth: this.width,
      canvasHeight: this.height,
    };
  }

  ngAfterViewInit() {
    this.clear();
    //
    if (this.data) {
      this.setData(this.data);
    }
    //
    if (this.readOnly) {
      this.signaturePad.off();
    }
  }

  drawStart() { }

  drawComplete() { }

  getData() {
    let data = this.signaturePad.toDataURL();
    //
    return data;
  }

  setData(data) {
    this.signaturePad.fromDataURL(data.replace(/\s/g, "+"));
  }

  clear() {
    this.signaturePad.clear();
  }

  async refresh() {
    this.ngAfterViewInit();
  }
}
