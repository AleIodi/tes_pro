import { Component, OnInit, Input, ViewChild, HostListener, ElementRef, Optional } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { AuthService } from 'src/app/services/auth.service';
import { SyncService } from 'src/app/services/sync.service';
import { ManagerService } from '../../../services/manager.service'

import { formatDate } from '@angular/common';
import { getDay, differenceInMinutes } from 'date-fns'

import html2pdf from 'html2pdf.js';

import { VerbalAddestramentoDionisoFormComponent } from '../verbal-addestramento-dioniso-form/verbal-addestramento-dioniso-form.component';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { MatDialogRef } from '@angular/material/dialog';
import { VerbalMailDetailsComponent } from '../verbal-mail-details/verbal-mail-details.component';

@Component({
    selector: 'app-verbal-addestramento-dioniso-report',
    templateUrl: './verbal-addestramento-dioniso-report.component.html',
    styleUrls: ['./verbal-addestramento-dioniso-report.component.scss'],
    standalone: false
})
export class VerbalAddestramentoDionisoReportComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalAddestramentoDionisoReportComponent"); event.stopPropagation(); } }

  @Input() autodopVerbal!: DB.IDB_autodop_verbal;
  @Input() isPublic!: boolean;

  @ViewChild("report") report!: ElementRef;
  @ViewChild("preview") preview!: ElementRef;
  @ViewChild("page") page!: ElementRef;
  @ViewChild("header") header!: ElementRef;
  @ViewChild("body") body!: ElementRef;
  @ViewChild("footer") footer!: ElementRef;

  isSent: boolean = false;
  isSigned: boolean = false;

  autodopVerbalStatus!: DB.IDB_autodop_verbal_status;
  user!: DB.IDB_user;
  machine!: DB.IDB_machine;
  job!: DB.IDB_job;
  consumer!: DB.IDB_consumer;
  destination!: DB.IDB_consumer;

  autodopVerbalDate!: string;
  autodopVerbalDataObj = {};

  constructor(
    private managerService: ManagerService,
    @Optional() public dialogRef: MatDialogRef<VerbalAddestramentoDionisoReportComponent>
  ) { }

  async ngOnInit() {
    this.autodopVerbalStatus = await this.managerService.autodopVerbalStatus_getFromId(this.autodopVerbal.id_autodop_verbal_status);
    this.user = await this.managerService.user_getFromId(this.autodopVerbal.id_user);
    this.machine = await this.managerService.machine_getFromId(this.autodopVerbal.id_machine);
    this.job = await this.managerService.job_getFromId(this.autodopVerbal.id_job);
    this.consumer = await this.managerService.consumer_getFromId(this.job.id_consumer);
    this.destination = await this.managerService.destination_getFromId(this.autodopVerbal.id_destination);
    //
    this.autodopVerbalDate = formatDate(this.autodopVerbal.date_create, "dd/MM/yyyy", "en-EN");
    //
    this.autodopVerbalDataObj = this.autodopVerbal.json ? JSON.parse(this.autodopVerbal.json) : {};
  }

  getHtml2PdfConfig() {
    let optionsObj = {
      filename: "report",
      image: { type: "jpeg", quality: 1 },
      html2canvas:  {
        dpi: 300,
        scale: 1
      },
      /*
      html2canvas: {
        dpi: 192,
        scale: 4,
        letterRendering: true,
        useCORS: true
      },
      */
      jsPDF: { format: "A4", orientation: "portrait" },
    }
    //
    return optionsObj;
  }

  setPageView() {
    let debug = true;
    let headerRepeat = false;
    let footerRepeat = false; //Al momento non funziona in quanto il footer viene spostato e non clonato più volte (per mantenere la firma)
    //
    if (debug) console.log("[PDF]", "----------------------------------------------------------------------------");
    //
    //Mostra l'elemento page finora nascosto
    //
    this.page.nativeElement.className = this.page.nativeElement.className.replace(" f4ns-report-hidden", "");
    //
    //Memorizza le dimensioni di page, header e footer
    //
    let headerHeight = this.header.nativeElement.offsetHeight;
    let footerHeight = this.footer.nativeElement.offsetHeight;
    //
    if (debug) console.log("[PDF]", "Altezza header " + headerHeight);
    if (debug) console.log("[PDF]", "Altezza footer " + footerHeight);
    //
    //Ottiene tutte le row in un array, salva HTML, dimensioni in un array e le rimuove dal body (in modo da averlo vuoto)
    //
    let rowList: any[] = [];
    let rowElemList: any[] = this.body.nativeElement.querySelectorAll("div.f4ns-report-row");
    let rowHeightTot = 0;
    //
    for (let rowK = 0; rowK < rowElemList.length; rowK++) {
      let rowElem = rowElemList[rowK];
      //
      rowList.push({
        html: rowElem.outerHTML,
        height: rowElem.offsetHeight,
      });
      //
      rowHeightTot += rowElem.offsetHeight;
    }
    //
    if (debug) console.log("[PDF]", "Trovate " + rowList.length + " righe", rowList);
    if (debug) console.log("[PDF]", "Altezza righe " + rowHeightTot);
    //
    //Crea le pagine valutando se le righe ci stanno nel body (nel caso creando una nuova pagina)
    //
    let bodyElemLast = null;
    let bodyHeight = null;
    let bodyRowsHeightTot = 0;
    let rowHeightMissed = rowHeightTot;
    let isPageFirst = true;
    let footerLastAdded = false;
    let pag = 0;
    let rowK = 0;
    //
    while (true) {
      let isRowEnd = rowK >= rowList.length;
      if (footerLastAdded && isRowEnd) {
        break;
      }
      //
      let row = !isRowEnd ? rowList[rowK] : null;
      if (debug && !isRowEnd) console.log("[PDF]", "Riga " + rowK + " - Altezza: " + row.height);
      //
      let bodyFreeHeight = !isRowEnd ? bodyHeight - bodyRowsHeightTot : null;
      if ((isRowEnd && !footerLastAdded) || bodyFreeHeight < row.height) {
        if (!isPageFirst) {
          this.report.nativeElement.insertAdjacentHTML("beforeend", "<div class=\"page-break\" style=\"page-break-after: always\"></div>");
        }
        //
        if (debug) console.log("[PDF]", "----------------------------------------------------------------------------");
        pag++;
        this.report.nativeElement.insertAdjacentHTML("beforeend", this.page.nativeElement.outerHTML);
        let pageElemList = this.report.nativeElement.querySelectorAll("div.f4ns-report-page");
        let pageElemLast = pageElemList[pageElemList.length - 1];
        if (debug) console.log("[PDF]", "Creata pagina " + pag);
        //
        bodyHeight = pageElemLast.clientHeight - (isPageFirst || headerRepeat ? headerHeight : 0);
        bodyRowsHeightTot = 0;
        if (debug) console.log("[PDF]", "Altezza page " + pageElemLast.clientHeight);
        if (debug) console.log("[PDF]", "Altezza body senza footer " + bodyHeight);
        if (debug) console.log("[PDF]", "Altezza righe mancanti " + rowHeightMissed);
        //
        //Verifica se è l'ultima pagina
        let isPageLast = bodyHeight - (rowHeightMissed + footerHeight) >= 0 ? true : false;
        if (isPageLast || footerRepeat) {
          bodyHeight -= footerHeight
          //
          if (debug) console.log("[PDF]", "Altezza body con footer " + bodyHeight);
        }
        //
        if (isPageFirst || headerRepeat) pageElemLast.insertAdjacentHTML("beforeend", this.header.nativeElement.outerHTML);
        pageElemLast.insertAdjacentHTML("beforeend", this.body.nativeElement.cloneNode(false).outerHTML);
        if (isPageLast || footerRepeat) {
          // pageElemLast.insertAdjacentHTML("beforeend", this.footer.nativeElement.outerHTML);
          //let footerNode = this.footer.nativeElement.cloneNode(true);
          pageElemLast.appendChild(this.footer.nativeElement);
          //
          if (isPageLast) {
            footerLastAdded = true;
          }
        }
        //
        let bodyElemList = pageElemLast.querySelectorAll("div.f4ns-report-body");
        bodyElemLast = bodyElemList[bodyElemList.length - 1];
        //
        bodyElemLast.style.height = bodyHeight + "px";
        //
        isPageFirst = false;
      }
      //
      if (!isRowEnd) {
        bodyElemLast.insertAdjacentHTML("beforeend", row.html);
        bodyRowsHeightTot += row.height;
        rowHeightMissed -= row.height;
        //
        rowK++;
      }
    }
    //
    //Nasconde la preview
    this.preview.nativeElement.hidden = true;
  }

  setPreviewView() {
    //
    //Cancella le pagine create (tutte tranne la prima che viene reimpostata come nascosta)
    let pageElemList = this.report.nativeElement.querySelectorAll("div.f4ns-report-page");
    for (let pageElemK = 0; pageElemK < pageElemList.length; pageElemK++) {
      let pageElem = pageElemList[pageElemK];
      //
      if (pageElemK == 0) {
        //Ripristina il footer
        (this.page.nativeElement as HTMLElement).parentElement.insertBefore(this.footer.nativeElement, this.page.nativeElement);
        //
        this.page.nativeElement.className += " f4ns-report-hidden";
      }
      else {
        pageElem.remove();
      }
    }
    //
    //Cancella i page-break
    let pageBreakList = this.report.nativeElement.querySelectorAll("div.page-break");
    for (let pageBreakK = 0; pageBreakK < pageBreakList.length; pageBreakK++) {
      let pageBreak = pageBreakList[pageBreakK];
      //
      pageBreak.remove();
    }
    //
    //Ripristina la preview
    this.preview.nativeElement.removeAttribute("hidden");
  }

  async printPDF() {
    this.setPageView();
    //
    let optionsObj = this.getHtml2PdfConfig();
    let reportElem = document.getElementById("report");
    //
    await html2pdf().from(reportElem).set(optionsObj).output("dataurlnewwindow", { filename: "report" });
    //
    this.setPreviewView();
  }

  async exportPDF() {
    this.setPageView();
    //
    let optionsObj = this.getHtml2PdfConfig();
    let reportElem = document.getElementById("report");
    //
    await html2pdf().from(reportElem).set(optionsObj).save();
    //
    this.setPreviewView();
  }

  async editReport() {
    let dialog = this.managerService.dialog_open(VerbalAddestramentoDionisoFormComponent, "Modifica Verbale " + this.autodopVerbal.code, true, false, { width: "75%", height: "80%" });
    let component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoDionisoFormComponent;
    //
    component.autodopVerbal = this.autodopVerbal;
    //
    dialog.afterClosed().subscribe(async () => {
      this.autodopVerbal = component.autodopVerbal;
      //
      this.ngOnInit();
    });
  }

  async sendMail() {
    let dialog = this.managerService.dialog_open(VerbalMailDetailsComponent, "Invio Mail", true, true, { width: "70%", height: "250px" });
    let component = dialog.componentInstance.componentInnerInstance as VerbalMailDetailsComponent;
    //
    component.autodopVerbal = this.autodopVerbal;
    //
    //this.isSent = await this.managerService.serviceTaskReport_isSigned(this.autodopVerbal);
  }

  async deleteReport() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Il report verrà cancellatato.\nProcedere?";
    //
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        await this.managerService.autodopVerbal_delete(this.autodopVerbal);
        //
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
  }
}
