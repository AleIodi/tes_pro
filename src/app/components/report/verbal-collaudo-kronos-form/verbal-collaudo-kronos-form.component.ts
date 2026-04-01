import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ManagerService } from '../../../services/manager.service'

import { IdbService } from '../../../services/idb.service';
import * as DB from '../../../idb/4service-pwa.idb';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';
import { AuthService } from '../../../services/auth.service'
import { CustomValidator } from 'src/app/classes/custom-validator';
import { userInfo } from 'os';

@Component({
    selector: 'app-verbal-collaudo-kronos-form',
    templateUrl: './verbal-collaudo-kronos-form.component.html',
    styleUrls: ['./verbal-collaudo-kronos-form.component.scss'],
    standalone: false
})

export class VerbalCollaudoKronosFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalCollaudoErgonFormComponent"); event.stopPropagation(); } }

  @Input() _title: string  = "";
  @Input() autodopVerbal!: DB.IDB_autodop_verbal;
  @Input() dateStart;
  @Input() dateEnd;

  isEditable = false;
  autodopVerbalIsEditable = true;
  checkListAnswerList = [
    {
      id:"P",
      name:"P",
    },
    {
      id:"N",
      name:"N",
    },
    {
      id:"S",
      name:"S",
    }
  ];

  //
  formGroupObj = {
    q0010: new UntypedFormControl("", []),
    q0020: new UntypedFormControl("", []),
    q0030: new UntypedFormControl("", []),
    q0040: new UntypedFormControl("", []),
    q0050: new UntypedFormControl("", []),
    q0060: new UntypedFormControl("", []),
    q0070: new UntypedFormControl("", []),
    q0080: new UntypedFormControl("", []),
    q0090: new UntypedFormControl("", []),
    q0100: new UntypedFormControl("", []),
    q0110: new UntypedFormControl("", []),
    q0120: new UntypedFormControl("", []),
    q0130: new UntypedFormControl("", []),
    q0140: new UntypedFormControl("", []),
    q0150: new UntypedFormControl("", []),
    q0160: new UntypedFormControl("", []),
    q0170: new UntypedFormControl("", []),
    q0180: new UntypedFormControl("", []),
    q0190: new UntypedFormControl("", []),
    q0200: new UntypedFormControl("", []),
    q0210: new UntypedFormControl("", []),
    q0220: new UntypedFormControl("", []),
    q0230: new UntypedFormControl("", []),
    q0240: new UntypedFormControl("", []),
    q0250: new UntypedFormControl("", []),
    q0260: new UntypedFormControl("", []),
    q0270: new UntypedFormControl("", []),
    q0280: new UntypedFormControl("", []),
    q0290: new UntypedFormControl("", []),
    q0300: new UntypedFormControl("", []),
    q0310: new UntypedFormControl("", []),
    q0320: new UntypedFormControl("", []),
    q0330: new UntypedFormControl("", []),
    q0340: new UntypedFormControl("", []),
    q0350: new UntypedFormControl("", []),
    q0360: new UntypedFormControl("", []),
    q0370: new UntypedFormControl("", []),
    q0380: new UntypedFormControl("", []),
    q0390: new UntypedFormControl("", []),
    //
    q1010_t: new UntypedFormControl("", []),
    q1010: new UntypedFormControl("", []),
    q1020_t: new UntypedFormControl("", []),
    q1020: new UntypedFormControl("", []),
    q1030_t: new UntypedFormControl("", []),
    q1030: new UntypedFormControl("", []),
    //
    esito: new UntypedFormControl("", []),
    note: new UntypedFormControl("", []),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  constructor(public dialogRef: MatDialogRef<VerbalCollaudoKronosFormComponent>, private idbService: IdbService, private managerService: ManagerService, private matDialog: MatDialog, private authService: AuthService) { }

  async ngOnInit() {
    if (this.autodopVerbal) {
      let autodopVerbalStatus = await this.managerService.autodopVerbalStatus_getFromId(this.autodopVerbal.id_autodop_verbal_status);
      //
      this.autodopVerbalIsEditable = autodopVerbalStatus.code == DB.AUTODOP_VERBAL_STATUS.NEW;
    }
    //
    if(this.autodopVerbal.json){
      let varbal_data_arr = JSON.parse(this.autodopVerbal.json);
      //
      this.formGroupObj["q0010"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0010));
      this.formGroupObj["q0020"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0020));
      this.formGroupObj["q0030"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0030));
      this.formGroupObj["q0040"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0040));
      this.formGroupObj["q0050"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0050));
      this.formGroupObj["q0060"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0060));
      this.formGroupObj["q0070"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0070));
      this.formGroupObj["q0080"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0080));
      this.formGroupObj["q0090"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0090));
      this.formGroupObj["q0100"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0100));
      this.formGroupObj["q0110"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0110));
      this.formGroupObj["q0120"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0120));
      this.formGroupObj["q0130"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0130));
      this.formGroupObj["q0140"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0140));
      this.formGroupObj["q0150"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0150));
      this.formGroupObj["q0160"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0160));
      this.formGroupObj["q0170"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0170));
      this.formGroupObj["q0180"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0180));
      this.formGroupObj["q0190"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0190));
      this.formGroupObj["q0200"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0200));
      this.formGroupObj["q0210"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0210));
      this.formGroupObj["q0220"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0220));
      this.formGroupObj["q0230"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0230));
      this.formGroupObj["q0240"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0240));
      this.formGroupObj["q0250"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0250));
      this.formGroupObj["q0260"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0260));
      this.formGroupObj["q0270"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0270));
      this.formGroupObj["q0280"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0280));
      this.formGroupObj["q0290"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0290));
      this.formGroupObj["q0300"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0300));
      this.formGroupObj["q0310"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0310));
      this.formGroupObj["q0320"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0320));
      this.formGroupObj["q0330"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0330));
      this.formGroupObj["q0340"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0340));
      this.formGroupObj["q0350"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0350));
      this.formGroupObj["q0360"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0360));
      this.formGroupObj["q0370"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0370));
      this.formGroupObj["q0380"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0380));
      this.formGroupObj["q0390"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q0390));
      this.formGroupObj["q1010_t"].setValue(varbal_data_arr.q1010_t??"");
      this.formGroupObj["q1010"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q1010));
      this.formGroupObj["q1020_t"].setValue(varbal_data_arr.q1020_t??"");
      this.formGroupObj["q1020"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q1020));
      this.formGroupObj["q1030_t"].setValue(varbal_data_arr.q1030_t??"");
      this.formGroupObj["q1030"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q1030));
      //
      this.formGroupObj.note.setValue(varbal_data_arr.note);
      this.formGroupObj.esito.setValue(varbal_data_arr.esito);
    }
    //
    this.autocomplete_loadData();
  }

  autocomplete_loadData() {
  }

  async autodopVerbal_setEditable(formGroupObj: {}, isEditable: boolean) {
    this.isEditable = isEditable;
    //
    if (this.isEditable) {
      for (let [k, formControl] of Object.entries(formGroupObj)) {
        (formControl as UntypedFormControl).enable();
      }
    }
    else {
      for (let [k, formControl] of Object.entries(formGroupObj)) {
        (formControl as UntypedFormControl).disable();
      }
    }
  }

  async autodopVerbal_save() {
    let machine = await this.managerService.machine_getFromId(this.autodopVerbal.id_machine);
    let autodopVerbalStatusCompiled = await this.managerService.autodopVerbalStatus_getFromCode(DB.AUTODOP_VERBAL_STATUS.COMPILED);
    //
    let verbal_data_obj = {
      note: this.formGroupObj.note.value,
      esito: this.formGroupObj.esito.value,
    };
    //
    if(this.formGroupObj.q0010.value) verbal_data_obj["q0010"] = this.formGroupObj.q0010.value.name;
    if(this.formGroupObj.q0020.value) verbal_data_obj["q0020"] = this.formGroupObj.q0020.value.name;
    if(this.formGroupObj.q0030.value) verbal_data_obj["q0030"] = this.formGroupObj.q0030.value.name;
    if(this.formGroupObj.q0040.value) verbal_data_obj["q0040"] = this.formGroupObj.q0040.value.name;
    if(this.formGroupObj.q0050.value) verbal_data_obj["q0050"] = this.formGroupObj.q0050.value.name;
    if(this.formGroupObj.q0060.value) verbal_data_obj["q0060"] = this.formGroupObj.q0060.value.name;
    if(this.formGroupObj.q0070.value) verbal_data_obj["q0070"] = this.formGroupObj.q0070.value.name;
    if(this.formGroupObj.q0080.value) verbal_data_obj["q0080"] = this.formGroupObj.q0080.value.name;
    if(this.formGroupObj.q0090.value) verbal_data_obj["q0090"] = this.formGroupObj.q0090.value.name;
    if(this.formGroupObj.q0100.value) verbal_data_obj["q0100"] = this.formGroupObj.q0100.value.name;
    if(this.formGroupObj.q0110.value) verbal_data_obj["q0110"] = this.formGroupObj.q0110.value.name;
    if(this.formGroupObj.q0120.value) verbal_data_obj["q0120"] = this.formGroupObj.q0120.value.name;
    if(this.formGroupObj.q0130.value) verbal_data_obj["q0130"] = this.formGroupObj.q0130.value.name;
    if(this.formGroupObj.q0140.value) verbal_data_obj["q0140"] = this.formGroupObj.q0140.value.name;
    if(this.formGroupObj.q0150.value) verbal_data_obj["q0150"] = this.formGroupObj.q0150.value.name;
    if(this.formGroupObj.q0160.value) verbal_data_obj["q0160"] = this.formGroupObj.q0160.value.name;
    if(this.formGroupObj.q0170.value) verbal_data_obj["q0170"] = this.formGroupObj.q0170.value.name;
    if(this.formGroupObj.q0180.value) verbal_data_obj["q0180"] = this.formGroupObj.q0180.value.name;
    if(this.formGroupObj.q0190.value) verbal_data_obj["q0190"] = this.formGroupObj.q0190.value.name;
    if(this.formGroupObj.q0200.value) verbal_data_obj["q0200"] = this.formGroupObj.q0200.value.name;
    if(this.formGroupObj.q0210.value) verbal_data_obj["q0210"] = this.formGroupObj.q0210.value.name;
    if(this.formGroupObj.q0220.value) verbal_data_obj["q0220"] = this.formGroupObj.q0220.value.name;
    if(this.formGroupObj.q0230.value) verbal_data_obj["q0230"] = this.formGroupObj.q0230.value.name;
    if(this.formGroupObj.q0240.value) verbal_data_obj["q0240"] = this.formGroupObj.q0240.value.name;
    if(this.formGroupObj.q0250.value) verbal_data_obj["q0250"] = this.formGroupObj.q0250.value.name;
    if(this.formGroupObj.q0260.value) verbal_data_obj["q0260"] = this.formGroupObj.q0260.value.name;
    if(this.formGroupObj.q0270.value) verbal_data_obj["q0270"] = this.formGroupObj.q0270.value.name;
    if(this.formGroupObj.q0280.value) verbal_data_obj["q0280"] = this.formGroupObj.q0280.value.name;
    if(this.formGroupObj.q0290.value) verbal_data_obj["q0290"] = this.formGroupObj.q0290.value.name;
    if(this.formGroupObj.q0300.value) verbal_data_obj["q0300"] = this.formGroupObj.q0300.value.name;
    if(this.formGroupObj.q0310.value) verbal_data_obj["q0310"] = this.formGroupObj.q0310.value.name;
    if(this.formGroupObj.q0320.value) verbal_data_obj["q0320"] = this.formGroupObj.q0320.value.name;
    if(this.formGroupObj.q0330.value) verbal_data_obj["q0330"] = this.formGroupObj.q0330.value.name;
    if(this.formGroupObj.q0340.value) verbal_data_obj["q0340"] = this.formGroupObj.q0340.value.name;
    if(this.formGroupObj.q0350.value) verbal_data_obj["q0350"] = this.formGroupObj.q0350.value.name;
    if(this.formGroupObj.q0360.value) verbal_data_obj["q0360"] = this.formGroupObj.q0360.value.name;
    if(this.formGroupObj.q0370.value) verbal_data_obj["q0370"] = this.formGroupObj.q0370.value.name;
    if(this.formGroupObj.q0380.value) verbal_data_obj["q0380"] = this.formGroupObj.q0380.value.name;
    if(this.formGroupObj.q0390.value) verbal_data_obj["q0390"] = this.formGroupObj.q0390.value.name;
    if(this.formGroupObj.q1010_t.value){
      verbal_data_obj["q1010_t"] = this.formGroupObj.q1010_t.value;
      verbal_data_obj["q1010"] = this.formGroupObj.q1010.value.name;
    }
    if(this.formGroupObj.q1020_t.value){
      verbal_data_obj["q1020_t"] = this.formGroupObj.q1020_t.value;
      verbal_data_obj["q1020"] = this.formGroupObj.q1020.value.name;
    }
    if(this.formGroupObj.q1030_t.value){
      verbal_data_obj["q1030_t"] = this.formGroupObj.q1030_t.value;
      verbal_data_obj["q1030"] = this.formGroupObj.q1030.value.name;
    }
    //
    let autodopVerbalArr = {
      id: this.autodopVerbal.id,
      json: JSON.stringify(verbal_data_obj),
      id_autodop_verbal_status: autodopVerbalStatusCompiled.id,
      to_push: "1",
    };
    this.autodopVerbal = await this.idbService.inup<DB.IDB_autodop_verbal>("autodop_verbal", autodopVerbalArr, ["id"]);
    //
    this.dialogRef.close();
  }
}
