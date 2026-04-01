import { Component, HostListener, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { GridColumnModel, GridToolbarItemModel } from '../../shared/grid/grid.component.model';

import { AuthService, USER_GROUP } from 'src/app/services/auth.service';
import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';
import { ManagerService } from 'src/app/services/manager.service';
import { VerbalFormComponent } from '../verbal-form/verbal-form.component';
import { VerbalCollaudoErgonReportComponent } from '../verbal-collaudo-ergon-report/verbal-collaudo-ergon-report.component';
import { VerbalCollaudoErgonFormComponent } from '../verbal-collaudo-ergon-form/verbal-collaudo-ergon-form.component';
import { VerbalAddestramentoErgonReportComponent } from '../verbal-addestramento-ergon-report/verbal-addestramento-ergon-report.component';
import { VerbalCollaudoDionisoReportComponent } from '../verbal-collaudo-dioniso-report/verbal-collaudo-dioniso-report.component';
import { VerbalCollaudoKronosReportComponent } from '../verbal-collaudo-kronos-report/verbal-collaudo-kronos-report.component';
import { VerbalCollaudoElettraReportComponent } from '../verbal-collaudo-elettra-report/verbal-collaudo-elettra-report.component';
import { VerbalCollaudoMaiaReportComponent } from '../verbal-collaudo-maia-report/verbal-collaudo-maia-report.component';
import { VerbalCollaudoAlcioneReportComponent } from '../verbal-collaudo-alcione-report/verbal-collaudo-alcione-report.component';
import { VerbalAddestramentoAlcioneReportComponent } from '../verbal-addestramento-alcione-report/verbal-addestramento-alcione-report.component';
import { VerbalAddestramentoMaiaReportComponent } from '../verbal-addestramento-maia-report/verbal-addestramento-maia-report.component';
import { VerbalAddestramentoElettraReportComponent } from '../verbal-addestramento-elettra-report/verbal-addestramento-elettra-report.component';
import { VerbalAddestramentoKronosReportComponent } from '../verbal-addestramento-kronos-report/verbal-addestramento-kronos-report.component';
import { VerbalAddestramentoDionisoReportComponent } from '../verbal-addestramento-dioniso-report/verbal-addestramento-dioniso-report.component';

@Component({
    selector: 'app-verbal-list',
    templateUrl: './verbal-list.component.html',
    styleUrls: ['./verbal-list.component.scss'],
    standalone: false
})
export class VerbalListComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalListComponent"); event.stopPropagation(); } }

  dataSource: Promise<object[]>;
  columnList: Promise<GridColumnModel[]>;
  toolbarItemList: Promise<GridToolbarItemModel[]>;

  constructor(private authService: AuthService, private idbService: IdbService, private managerService: ManagerService) { }

  ngOnInit() {
    this.dataSource = this.getDataSource();
    this.columnList = this.getColumnList();
    this.toolbarItemList = this.getToolbarItemList();
  }

  async getDataSource() {
    let autodopVerbalList = await this.managerService.autodopVerbal_getList(this.managerService.getUserList());
    //
    let data = this.idbService.join(autodopVerbalList, [
      { field: "id_autodop_verbal_typology", table: "autodop_verbal_typology" },
      { field: "id_autodop_verbal_status", table: "autodop_verbal_status" },
      { field: "id_destination", table: "consumer", alias: "destination" },
      {
        field: "id_job", table: "job", joinList: [{
          field: "id_consumer", table: "consumer"
        }]
      },
      { field: "id_machine", table: "machine" },
    ]);
    //
    return data;
  }

  async getColumnList(): Promise<GridColumnModel[]> {
    return [
      {
        field: "id",
        label: "ID",
        width: "30px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "idr",
        label: "IDR",
        width: "30px",
        userGroupList: [USER_GROUP.SUPER],
      },
      {
        field: "autodop_verbal_typology.name",
        label: "Tipologia",
        width: "120px",
      },
      {
        field: "machine.name",
        label: "Macchina",
        width: "250px",
      },
      {
        field: "job.consumer.name",
        label: "Cliente",
        width: "250px",
      },
      {
        field: "job.code",
        label: "Commessa",
        width: "150px",
      },
      {
        field: "date_create",
        label: "Data",
        width: "100px",
        dataType: "date",
      },
      {
        field: "code",
        label: "Codice",
        width: "100%",
      },
      /*
      {
        field: "autodop_verbal_status.name",
        label: "Stato",
        width: "100px",
      },
      */
      {
        field: "to_push",
        label: "Stato",
        width: "35px",
        //
        type: "icon",
        iconObj: {
          "0": {
            "label": "Inviato",
            "icon": "mdi mdi-check-circle",
          },
          "1": {
            "label": "Da inviare",
            "icon": "mdi mdi-clock-time-four-outline",
          },
          "default": {
            "label": "Inviato",
            "icon": "mdi mdi-check-circle",
          },
        }
      },
      {
        field: "show",
        label: "Mostra",
        //
        type: "button",
        icon: "mdi mdi-file-search-outline",
        click: this.showClick,
      },
    ];
  }

  async getToolbarItemList(): Promise<GridToolbarItemModel[]> {
    return [
      {
        code: "add",
        label: "Aggiungi",
        icon: "mdi mdi-plus",
        click: this.openForm,
        hidden: false,
      },
    ];
  }

  public openForm = (autodopVerbal?: DB.IDB_autodop_verbal) => {
    let dialog = this.managerService.dialog_open(VerbalFormComponent, autodopVerbal ? "Modifica Verbale" : "Crea Verbale", true, true, { width: "50%", height: "500px" });
    let component = dialog.componentInstance.componentInnerInstance as VerbalFormComponent;
    //
    component.autodopVerbal = autodopVerbal;
    //
    dialog.afterClosed().subscribe((a) => {
      this.refresh();
    });
  }

  refresh() {
    this.dataSource = this.getDataSource();
  }

  public showClick = (autodopVerbal: DB.IDB_autodop_verbal) => {
    let dialog;
    let component;
    //
    if (autodopVerbal["autodop_verbal_typology"]["code"] == DB.AUTODOP_VERBAL_TYPOLOGY.TRAINING) {
      if(autodopVerbal["machine"]["name"].toUpperCase().includes("ERGON")){
        dialog = this.managerService.dialog_open(VerbalAddestramentoErgonReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoErgonReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("DIONISO")){
        dialog = this.managerService.dialog_open(VerbalAddestramentoDionisoReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoDionisoReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("KRONOS")){
        dialog = this.managerService.dialog_open(VerbalAddestramentoKronosReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoKronosReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("ELETTRA")){
        dialog = this.managerService.dialog_open(VerbalAddestramentoElettraReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoElettraReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("MAIA")){
        dialog = this.managerService.dialog_open(VerbalAddestramentoMaiaReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoMaiaReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("ALCIONE")){
        dialog = this.managerService.dialog_open(VerbalAddestramentoAlcioneReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalAddestramentoAlcioneReportComponent;
      }
    }
    else if(autodopVerbal["autodop_verbal_typology"]["code"] == DB.AUTODOP_VERBAL_TYPOLOGY.TESTING) {
      if(autodopVerbal["machine"]["name"].toUpperCase().includes("ERGON")){
        dialog = this.managerService.dialog_open(VerbalCollaudoErgonReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalCollaudoErgonReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("DIONISO")){
        dialog = this.managerService.dialog_open(VerbalCollaudoDionisoReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalCollaudoDionisoReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("KRONOS")){
        dialog = this.managerService.dialog_open(VerbalCollaudoKronosReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalCollaudoKronosReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("ELETTRA")){
        dialog = this.managerService.dialog_open(VerbalCollaudoElettraReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalCollaudoElettraReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("MAIA")){
        dialog = this.managerService.dialog_open(VerbalCollaudoMaiaReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalCollaudoMaiaReportComponent;
      }
      else if(autodopVerbal["machine"]["name"].toUpperCase().includes("ALCIONE")){
        dialog = this.managerService.dialog_open(VerbalCollaudoAlcioneReportComponent, "Verbale " + autodopVerbal.code, true, false, { width: "95%", height: "95%" });
        component = dialog.componentInstance.componentInnerInstance as VerbalCollaudoAlcioneReportComponent;
      }
    }
    else{
      alert("Tipologia Verbale non riconosciuta");
      return;
    }
    //
    component.autodopVerbal = autodopVerbal;
    //
    dialog.afterClosed().subscribe(() => {
      this.refresh();
    });
  }
}
