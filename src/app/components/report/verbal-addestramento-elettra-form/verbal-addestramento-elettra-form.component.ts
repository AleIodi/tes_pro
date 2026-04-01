import { Component, OnInit, Inject, Optional, Input, HostListener } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
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
    selector: 'app-verbal-addestramento-elettra-form',
    templateUrl: './verbal-addestramento-elettra-form.component.html',
    styleUrls: ['./verbal-addestramento-elettra-form.component.scss'],
    standalone: false
})

export class VerbalAddestramentoElettraFormComponent implements OnInit {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("VerbalAddestramentoErgonFormComponent"); event.stopPropagation(); } }

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
    //
    q1010_t: new UntypedFormControl("", []),
    q1010: new UntypedFormControl("", []),
    q1020_t: new UntypedFormControl("", []),
    q1020: new UntypedFormControl("", []),
    q1030_t: new UntypedFormControl("", []),
    q1030: new UntypedFormControl("", []),
    //
    p0010_1: new UntypedFormControl("", []),
    p0010_2: new UntypedFormControl("", []),
    p0010_3: new UntypedFormControl("", []),
    p0020_1: new UntypedFormControl("", []),
    p0020_2: new UntypedFormControl("", []),
    p0020_3: new UntypedFormControl("", []),
    p0030_1: new UntypedFormControl("", []),
    p0030_2: new UntypedFormControl("", []),
    p0030_3: new UntypedFormControl("", []),
    p0040_1: new UntypedFormControl("", []),
    p0040_2: new UntypedFormControl("", []),
    p0040_3: new UntypedFormControl("", []),
    p0050_1: new UntypedFormControl("", []),
    p0050_2: new UntypedFormControl("", []),
    p0050_3: new UntypedFormControl("", []),
    p0060_1: new UntypedFormControl("", []),
    p0060_2: new UntypedFormControl("", []),
    p0060_3: new UntypedFormControl("", []),
    //
    magazzino: new UntypedFormControl("", [Validators.required]),
    note: new UntypedFormControl("", []),
  };
  formGroup = new UntypedFormGroup(this.formGroupObj);

  constructor(public dialogRef: MatDialogRef<VerbalAddestramentoElettraFormComponent>, private idbService: IdbService, private managerService: ManagerService, private matDialog: MatDialog, private authService: AuthService) { }

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
      this.formGroupObj["q1010_t"].setValue(varbal_data_arr.q1010_t??"");
      this.formGroupObj["q1010"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q1010));
      this.formGroupObj["q1020_t"].setValue(varbal_data_arr.q1020_t??"");
      this.formGroupObj["q1020"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q1020));
      this.formGroupObj["q1030_t"].setValue(varbal_data_arr.q1030_t??"");
      this.formGroupObj["q1030"].setValue(this.checkListAnswerList.find(answer => answer.name == varbal_data_arr.q1030));
      //
      this.formGroupObj["p0010_1"].setValue(varbal_data_arr.p0010_1??"");
      this.formGroupObj["p0010_2"].setValue(varbal_data_arr.p0010_2??"");
      this.formGroupObj["p0010_3"].setValue(varbal_data_arr.p0010_3??"");
      this.formGroupObj["p0020_1"].setValue(varbal_data_arr.p0020_1??"");
      this.formGroupObj["p0020_2"].setValue(varbal_data_arr.p0020_2??"");
      this.formGroupObj["p0020_3"].setValue(varbal_data_arr.p0020_3??"");
      this.formGroupObj["p0030_1"].setValue(varbal_data_arr.p0030_1??"");
      this.formGroupObj["p0030_2"].setValue(varbal_data_arr.p0030_2??"");
      this.formGroupObj["p0030_3"].setValue(varbal_data_arr.p0030_3??"");
      this.formGroupObj["p0040_1"].setValue(varbal_data_arr.p0040_1??"");
      this.formGroupObj["p0040_2"].setValue(varbal_data_arr.p0040_2??"");
      this.formGroupObj["p0040_3"].setValue(varbal_data_arr.p0040_3??"");
      this.formGroupObj["p0050_1"].setValue(varbal_data_arr.p0050_1??"");
      this.formGroupObj["p0050_2"].setValue(varbal_data_arr.p0050_2??"");
      this.formGroupObj["p0050_3"].setValue(varbal_data_arr.p0050_3??"");
      this.formGroupObj["p0060_1"].setValue(varbal_data_arr.p0060_1??"");
      this.formGroupObj["p0060_2"].setValue(varbal_data_arr.p0060_2??"");
      this.formGroupObj["p0060_3"].setValue(varbal_data_arr.p0060_3??"");
      //
      this.formGroupObj.magazzino.setValue(varbal_data_arr.magazzino);
      this.formGroupObj.note.setValue(varbal_data_arr.note);
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
      magazzino: this.formGroupObj.magazzino.value,
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
    verbal_data_obj["p0010_1"] = this.formGroupObj.p0010_1.value;
    verbal_data_obj["p0010_2"] = this.formGroupObj.p0010_2.value;
    verbal_data_obj["p0010_3"] = this.formGroupObj.p0010_3.value;
    verbal_data_obj["p0020_1"] = this.formGroupObj.p0020_1.value;
    verbal_data_obj["p0020_2"] = this.formGroupObj.p0020_2.value;
    verbal_data_obj["p0020_3"] = this.formGroupObj.p0020_3.value;
    verbal_data_obj["p0030_1"] = this.formGroupObj.p0030_1.value;
    verbal_data_obj["p0030_2"] = this.formGroupObj.p0030_2.value;
    verbal_data_obj["p0030_3"] = this.formGroupObj.p0030_3.value;
    verbal_data_obj["p0040_1"] = this.formGroupObj.p0040_1.value;
    verbal_data_obj["p0040_2"] = this.formGroupObj.p0040_2.value;
    verbal_data_obj["p0040_3"] = this.formGroupObj.p0040_3.value;
    verbal_data_obj["p0050_1"] = this.formGroupObj.p0050_1.value;
    verbal_data_obj["p0050_2"] = this.formGroupObj.p0050_2.value;
    verbal_data_obj["p0050_3"] = this.formGroupObj.p0050_3.value;
    verbal_data_obj["p0060_1"] = this.formGroupObj.p0060_1.value;
    verbal_data_obj["p0060_2"] = this.formGroupObj.p0060_2.value;
    verbal_data_obj["p0060_3"] = this.formGroupObj.p0060_3.value;
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
