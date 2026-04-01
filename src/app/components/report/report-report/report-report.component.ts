import { Component, OnInit, Input, ViewChild, HostListener, ElementRef, Optional } from '@angular/core';

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { AuthService } from 'src/app/services/auth.service';
import { SyncService } from 'src/app/services/sync.service';
import { ManagerService } from '../../../services/manager.service'

import { formatDate } from '@angular/common';
import { getDay, differenceInMinutes } from 'date-fns'

import html2pdf from 'html2pdf.js';

import { ReportSignatureComponent } from '../report-signature/report-signature.component';
import { SignatureComponent } from '../../shared/signature/signature.component';
import { ReportMailDetailsComponent } from '../report-mail-details/report-mail-details.component';
import { DateService } from 'src/app/services/date.service';
import { ConfirmComponent } from '../../shared/confirm/confirm.component';
import { environment } from 'src/environments/environment';
import { MatDialogRef } from '@angular/material/dialog';

export interface I_ReportServiceOperationInfo {
  serviceOperationList: DB.IDB_service_operation[],
  dateStart: string,
  dateStart_HourMinute: string,
  dateEnd: string,
  dateEnd_HourMinute: string,
  hours: number;
}

export interface I_ReportServiceTripInfo {
  serviceTripList: DB.IDB_service_trip[],
  dateStart: string,
  dateStart_HourMinute: string,
  dateEnd: string,
  dateEnd_HourMinute: string,
  hours: number;
  km_invoice: number,
}

export interface I_ReportDay {
  num: number;
  label: string,
  date: string,
  serviceOperationInfoList: I_ReportServiceOperationInfo[],
  serviceTripInfoList: I_ReportServiceTripInfo[],
}

@Component({
    selector: 'app-report-report',
    templateUrl: './report-report-autodop.component.html',
    styleUrls: ['./report-report-autodop.component.scss'],
    standalone: false
})

export class ReportReportComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ReportReportComponent"); event.stopPropagation(); } }

  @Input() serviceTaskReport!: DB.IDB_service_task_report;
  @Input() isPublic!: boolean;

  @ViewChild("report") report!: ElementRef;
  @ViewChild("preview") preview!: ElementRef;
  @ViewChild("page") page!: ElementRef;
  @ViewChild("header") header!: ElementRef;
  @ViewChild("body") body!: ElementRef;
  @ViewChild("footer") footer!: ElementRef;
  @ViewChild(SignatureComponent) signatureComponent!: SignatureComponent;

  isSent: boolean = false;
  isSigned: boolean = false;

  serviceTask!: DB.IDB_service_task;
  serviceTaskReportStatus!: DB.IDB_service_task_report_status;
  user!: DB.IDB_user;
  jobDetails!: DB.IDB_job_details;
  job!: DB.IDB_job;
  consumer!: DB.IDB_consumer;
  destination!: DB.IDB_consumer;
  contact!: DB.IDB_contact;
  machineList: DB.IDB_machine[] = [];
  machineStr: string;
  serviceTypology: null;

  userList: DB.IDB_user[] = [];
  userListStr: string = "";
  serviceOperationTypologyList: DB.IDB_service_operation_typology[] = [];
  serviceOperationTypologyListStr: string = "";

  json_machine_type: string = "";
  json_machine_serial: string = "";

  serviceTaskReportDate!: string;
  workHoursTot = 0;
  tripHoursTot = 0;
  tripKmInvoiceTot = 0;
  serviceTaskProductList: DB.IDB_service_task_product[] = [];

  dayFirstK = null;
  dayList: I_ReportDay[] = [
    {
      num: 1,
      label: "LU",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
    {
      num: 2,
      label: "MA",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
    {
      num: 3,
      label: "ME",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
    {
      num: 4,
      label: "GI",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
    {
      num: 5,
      label: "VE",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
    {
      num: 6,
      label: "SA",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
    {
      num: 7,
      label: "DO",
      date: "",
      serviceOperationInfoList: [],
      serviceTripInfoList: [],
    },
  ];

  constructor(
    private authService: AuthService,
    private idbService: IdbService,
    private syncService: SyncService,
    private managerService: ManagerService,
    private dateService: DateService,
    @Optional() public dialogRef: MatDialogRef<ReportReportComponent>
  ) { }

  async ngOnInit() {
    this.serviceTaskReportStatus = await this.managerService.serviceTaskReportStatus_getFromId(this.serviceTaskReport.id_service_task_report_status);
    //
    let isSigned = await this.managerService.serviceTaskReport_isSigned(this.serviceTaskReport);
    /*
    if (isSigned) {
      let reportElem = document.getElementById("report");
      let reportElemParent = reportElem.parentElement;
      //
      reportElem.remove();
      reportElemParent.insertAdjacentHTML("beforeend", this.serviceTaskReport.html);
    }
    else {
    */
    this.isSent = this.serviceTaskReportStatus.code === DB.SERVICE_TASK_REPORT_STATUS.SENT;
    this.isSigned = await this.managerService.serviceTaskReport_isSigned(this.serviceTaskReport);
    //
    this.serviceTask = await this.managerService.serviceTask_getFromId(this.serviceTaskReport.id_service_task);
    this.user = await this.managerService.user_getFromId(this.serviceTaskReport.id_user);
    //
    this.destination = null;
    if(this.serviceTask.id_destination){
      this.destination = await this.managerService.destination_getFromId(this.serviceTask.id_destination);
    }
    //
    this.serviceTaskReportDate = formatDate(this.serviceTask.date_start, "dd/MM/yyyy", "en-EN");
    //
    let serviceTaskList = await this.idbService.join([this.serviceTask], [
      {
        field: "id_job_details", table: "job_details", joinType: "LEFT", joinList: [
          {
            field: "id_job", table: "job", joinList: [{
              field: "id_consumer", table: "consumer"
            }]
          },
          { field: "id_job_details_action", table: "job_details_action" }
        ]
      },
      { field: "id_contact", table: "contact", joinType: "LEFT" }
    ]);
    //
    this.serviceTask = serviceTaskList[0];
    this.jobDetails = this.serviceTask["job_details"] ?? null;
    this.job = this.jobDetails["job"] ?? null;
    this.consumer = this.job["consumer"] ?? null;
    this.contact = this.serviceTask["contact"] ?? null;
    //
    this.serviceTypology = await this.getJsonField_serviceTypology();
    //
    //SERVICE_OPERATION
    //
    let serviceOperationList = await this.managerService.serviceOperation_getList(null, this.serviceTask, DB.SERVICE_TYPOLOGY.EXTERNAL)
    serviceOperationList = await this.idbService.join(serviceOperationList, [
      { field: "id_user", table: "user" },
      { field: "id_service_operation_typology", table: "service_operation_typology" },
    ]);
    //
    this.userList = serviceOperationList.map(function (serviceOperation) { return serviceOperation["user"]; }).filter((value, index, self) => self.indexOf(value) === index);
    for (let userK in this.userList) {
      let user = this.userList[userK];
      //
      this.userListStr += (user.name_first ?? "") + " " + (user.name_last ?? "");
      if (parseInt(userK) < this.userList.length - 1) {
        this.userListStr += ", ";
      }
    }
    //
    this.serviceOperationTypologyList = serviceOperationList.map(function (serviceOperation) { return serviceOperation["service_operation_typology"]; }).filter((value, index, self) => self.indexOf(value) === index);
    for (let serviceOperationTypologyK in this.serviceOperationTypologyList) {
      let serviceOperationTypology = this.serviceOperationTypologyList[serviceOperationTypologyK];
      //
      this.serviceOperationTypologyListStr += serviceOperationTypology.name;
      if(parseInt(serviceOperationTypologyK) < this.serviceOperationTypologyList.length - 1) {
        this.serviceOperationTypologyListStr += ", ";
      }
    }
    //
    for (let serviceOperationK in serviceOperationList.reverse()) {
      let serviceOperation = serviceOperationList[serviceOperationK];
      //
      //service operation machine list
      let serviceOperation_machineList = await this.managerService.serviceOperation_getMachineList(serviceOperation);
      serviceOperation_machineList = await this.idbService.join(serviceOperation_machineList, [
        { field: "id_machine_typology", table: "machine_typology" },
      ]);
      //
      for (let serviceOperation_machineK in serviceOperation_machineList) {
        let serviceOperation_machine = serviceOperation_machineList[serviceOperation_machineK];
        //
        if (!this.machineList.find(machine => machine.id === serviceOperation_machine.id)) {
          this.machineList.push(serviceOperation_machine);
        }
      }
      //
      serviceOperation["machineStr"] = "";
      if (serviceOperation_machineList.length > 0) {
        serviceOperation["machineStr"] = serviceOperation_machineList.map(machine => machine.name).join(", ") + "\n";
      }
      //
      let dayK = (getDay(new Date(serviceOperation.date_start)) + 6) % 7;
      this.dayList[dayK].date = formatDate(serviceOperation.date_start, "dd-MM-yyyy", "en-EN");
      //
      if (this.dayFirstK == null) {
        this.dayFirstK = dayK;
      }
      //
      let serviceOperationWorkHours = this.managerService.serviceOperation_getWorkHours(serviceOperation);
      //
      serviceOperation["userStr"] = serviceOperation["user"].name_first + " " + serviceOperation["user"].name_last;
      serviceOperation["hourStr"] = serviceOperationWorkHours + " h";
      //
      if (this.dayList[dayK].serviceOperationInfoList.length == 0) {
        this.dayList[dayK].serviceOperationInfoList.push({
          serviceOperationList: [],
          dateStart: null,
          dateStart_HourMinute: null,
          dateEnd: null,
          dateEnd_HourMinute: null,
          hours: 0,
        });
        //
        this.dayList[dayK].serviceOperationInfoList.push({
          serviceOperationList: [],
          dateStart: null,
          dateStart_HourMinute: null,
          dateEnd: null,
          dateEnd_HourMinute: null,
          hours: 0,
        });
      }
      //
      //se l'operazione è iniziata dopo le 13, la inserisco nel pomeriggio
      let serviceOperationInfoK = 0;
      if (parseInt(this.dateService.date_getByFormat(serviceOperation.date_start, "HH")) >= 13) {
        serviceOperationInfoK = 1;
      }
      //
      let serviceOperationInfo_dateStart = !this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateStart || differenceInMinutes(new Date(this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateStart), new Date(serviceOperation.date_start)) > 0 ? serviceOperation.date_start : this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateStart;
      let serviceOperationInfo_dateEnd = !this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateEnd || differenceInMinutes(new Date(serviceOperation.date_end), new Date(this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateEnd)) > 0 ? serviceOperation.date_end : this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateEnd;
      //
      this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].serviceOperationList.push(serviceOperation);
      this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].hours += serviceOperationWorkHours;
      this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateStart = serviceOperationInfo_dateStart;
      this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateStart_HourMinute = this.dateService.date_getTimeHourMinute(serviceOperationInfo_dateStart);
      this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateEnd = serviceOperationInfo_dateEnd;
      this.dayList[dayK].serviceOperationInfoList[serviceOperationInfoK].dateEnd_HourMinute = this.dateService.date_getTimeHourMinute(serviceOperationInfo_dateEnd);
      //
      this.workHoursTot += serviceOperationWorkHours;
    }
    //
    this.machineStr = "";
    if (this.machineList.length > 0) {
      this.machineStr = this.machineList.map(machine => machine.name).join(", ");
    }
    //
    //SERVICE_TRIP
    //
    let serviceTripList = await this.managerService.serviceTrip_getList(null, this.serviceTask, true);
    //
    for (let serviceTripK in serviceTripList) {
      let serviceTrip = serviceTripList[serviceTripK];
      //
      let dayK = (getDay(new Date(serviceTrip.date_start)) + 6) % 7;
      this.dayList[dayK].date = formatDate(serviceTrip.date_start, "dd-MM-yyyy", "en-EN");
      //
      if (this.dayFirstK == null) {
        this.dayFirstK = dayK;
      }
      //
      let serviceTripHours = this.managerService.serviceTrip_getHours(serviceTrip);
      //
      if (this.dayList[dayK].serviceTripInfoList.length == 0) {
        this.dayList[dayK].serviceTripInfoList.push({
          serviceTripList: [],
          dateStart: null,
          dateStart_HourMinute: null,
          dateEnd: null,
          dateEnd_HourMinute: null,
          hours: 0,
          km_invoice: 0,
        });
        //
        this.dayList[dayK].serviceTripInfoList.push({
          serviceTripList: [],
          dateStart: null,
          dateStart_HourMinute: null,
          dateEnd: null,
          dateEnd_HourMinute: null,
          hours: 0,
          km_invoice: 0,
        });
      }
      //
      //se il viaggio è il secondo per utente, la inserisco come ritorno
      let serviceTripInfoK = 0;
      //
      let serviceTripInfo_idUserList = this.dayList[dayK].serviceTripInfoList[0].serviceTripList.map(serviceTrip => {
        return serviceTrip.id_user
      });
      //
      if(serviceTripInfo_idUserList.includes(serviceTrip.id_user)){
        serviceTripInfoK = 1;
      }
      //
      let serviceTripInfo_dateStart = !this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateStart || differenceInMinutes(new Date(this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateStart), new Date(serviceTrip.date_start)) > 0 ? serviceTrip.date_start : this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateStart;
      let serviceTripInfo_dateEnd = !this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateEnd || differenceInMinutes(new Date(serviceTrip.date_end), new Date(this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateEnd)) > 0 ? serviceTrip.date_end : this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateEnd;
      //
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].serviceTripList.push(serviceTrip);
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].hours += serviceTripHours;
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].km_invoice = Number(serviceTrip.km_invoice);
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateStart = serviceTripInfo_dateStart;
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateStart_HourMinute = this.dateService.date_getTimeHourMinute(serviceTripInfo_dateStart);
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateEnd = serviceTripInfo_dateEnd;
      this.dayList[dayK].serviceTripInfoList[serviceTripInfoK].dateEnd_HourMinute = this.dateService.date_getTimeHourMinute(serviceTripInfo_dateEnd);
      //
      this.workHoursTot += serviceTripHours;
    }
    //
    //SERVICE_PRODUCT
    //
    this.serviceTaskProductList = await this.managerService.serviceTaskProduct_getList(null, this.serviceTask);
    this.serviceTaskProductList = await this.idbService.join(this.serviceTaskProductList, [
      { field: "id_product", table: "product" }
    ]);
    /*
    }
    */
  }

  async getJsonField_serviceTypology() {
    let serviceTypology = await this.managerService.serviceTaskReport_getJsonField(this.serviceTaskReport, "service_typology");
    //
    return serviceTypology;
  }

  async setJsonField_serviceTypology(checked, value) {
    this.managerService.serviceTaskReport_setJsonField(this.serviceTaskReport, "service_typology", checked ? value : null);
  }

  changeJsonField(event) {
    console.log("CHANGED", event.srcElement.innerText);
  }

  getHtml2PdfConfig() {
    let optionsObj = {
      filename: "report",
      image: { type: 'jpeg', quality: 1 },
      html2canvas: {
        dpi: 192,
        scale: 4,
        letterRendering: true,
        useCORS: true
      },
      jsPDF: { format: "A4", orientation: "portrait" },
    }
    //
    return optionsObj;
  }

  signatureCustomer() {
    let dialog = this.managerService.dialog_open(ReportSignatureComponent, "Firma", true, true);
    let component = dialog.componentInstance.componentInnerInstance as ReportSignatureComponent;
    //
    component._saveCallback = async (serviceTaskReport) => {
      this.serviceTaskReport = serviceTaskReport;
      this.isSigned = await this.managerService.serviceTaskReport_isSigned(serviceTaskReport);
      this.serviceTaskReportStatus = await this.managerService.serviceTaskReportStatus_getFromId(this.serviceTaskReport.id_service_task_report_status);
      this.isSent = this.serviceTaskReportStatus.code === DB.SERVICE_TASK_REPORT_STATUS.SENT;
      //
      dialog.close();
    };
    //
    component.serviceTaskReport = this.serviceTaskReport;
    //
    dialog.afterClosed().subscribe(async () => {
      await this.signatureComponent.refresh();
      //
      if(this.isPublic){
        await this.syncService.pushToServer(["service_task_report"], false);
      }
    });
  }

  async removeSignatureCustomer() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "La firma del cliente verrà cancellata.\nProcedere?";
    //
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        this.serviceTaskReport = await this.managerService.serviceTaskReport_removeSignature(this.serviceTaskReport);
        //
        this.serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", {
          id: this.serviceTaskReport.id,
          id_service_task_report_status: (await this.managerService.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SENT)).id,
          to_push: "1",
        }, ["id"]);
        //
        this.isSigned = await this.managerService.serviceTaskReport_isSigned(this.serviceTaskReport);
        this.serviceTaskReportStatus = await this.managerService.serviceTaskReportStatus_getFromId(this.serviceTaskReport.id_service_task_report_status);
        this.isSent = this.serviceTaskReportStatus.code === DB.SERVICE_TASK_REPORT_STATUS.SENT;
        //
        this.signatureComponent.refresh();
      }
    });
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
    let optionsObj = await this.getHtml2PdfConfig();
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

  // async getPDFBase64() {
  //   this.setPageView();
  //   //
  //   let optionsObj = this.getHtml2PdfConfig();
  //   let reportElem = document.getElementById("report");
  //   //
  //   let pdf = await html2pdf().from(reportElem).set(optionsObj).outputPdf();
  //   console.log(btoa(pdf));
  //   //
  //   this.setPreviewView();
  // }

  // test() {
  //   let reportElem = document.getElementsByTagName("app-report-report")[0] as HTMLElement;
  //   let reportElemHtml = reportElem.outerHTML;
  //   //
  //   document.body.hidden = true;

  //   let node = reportElem.cloneNode(true);
  //   document.documentElement.appendChild(node);

  //   window.print();

  //   document.body.hidden = false;
  //   document.documentElement.removeChild(node);

  //   // let w = window.open();
  //   // //
  //   // w.document.documentElement.innerHTML = document.documentElement.innerHTML;
  //   // w.print();

  //   // let reportElem = document.getElementsByTagName("app-report-report")[0].outerHTML;
  //   // //
  //   // let w = window.open();
  //   // w.document.body.insertAdjacentHTML("beforeend", reportElem);
  //   // w.print();
  // }

  async setStatusSent() {
    let serviceTaskReportStatusSent = await this.managerService.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.SENT);
    //
    this.serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", {
      id: this.serviceTaskReport.id,
      id_service_task_report_status: serviceTaskReportStatusSent.id,
      date_sent: this.dateService.date_getDateTime(new Date()),
      to_push: "1",
    }, ["id"]);
    //
    this.serviceTaskReportStatus = serviceTaskReportStatusSent;
    this.isSent = true;
  }

  /*
  async removeStatusSent() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Lo stato Inviato verrà rimosso.\nProcedere?";
    //
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        let serviceTaskReportStatusNew = await this.managerService.serviceTaskReportStatus_getFromCode(DB.SERVICE_TASK_REPORT_STATUS.NEW);
        //
        this.serviceTaskReport = await this.idbService.inup<DB.IDB_service_task_report>("service_task_report", {
          id: this.serviceTaskReport.id,
          id_service_task_report_status: serviceTaskReportStatusNew.id,
          to_push: "1",
        }, ["id"]);
        //
        this.serviceTaskReportStatus = serviceTaskReportStatusNew;
        this.isSent = false;
      }
    });
  }
  */

  async sendMail() {
    let dialog = this.managerService.dialog_open(ReportMailDetailsComponent, "Invio Mail", true, true, { width: "70%", height: "250px" });
    let component = dialog.componentInstance.componentInnerInstance as ReportMailDetailsComponent;
    //
    component.serviceTaskReport = this.serviceTaskReport;
    component.consumer = this.consumer;
    //
    this.isSent = await this.managerService.serviceTaskReport_isSigned(this.serviceTaskReport);
  }

  async deleteReport() {
    let dialog = this.managerService.dialog_open(ConfirmComponent, "Attenzione", true, true, { width: environment.dialog_confirm_width, height: environment.dialog_confirm_height });
    let component = dialog.componentInstance.componentInnerInstance as ConfirmComponent;
    //
    component.message = "Il report verrà cancellatato.\nProcedere?";
    //
    dialog.afterClosed().subscribe(async result => {
      if (result) {
        await this.managerService.serviceTaskReport_delete(this.serviceTaskReport);
        //
        if (this.dialogRef) {
          this.dialogRef.close();
        }
      }
    });
  }
}
