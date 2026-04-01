import { AbstractControl } from '@angular/forms';

export class CustomValidator {
  static object(control: AbstractControl) {
    let val = control.value;
    //
    if (val === null || val === '') return null;
    //
    if (typeof val !== 'object') return { 'invalidObject': true };
    //
    return null;
  }

  static number(control: AbstractControl) {
    let val = control.value;
    //
    if (val === null || val === '') return null;
    //
    if (!val.toString().match(/^[0-9]+(\.?[0-9]+)?$/)) return { 'invalidNumber': true };
    //
    return null;
  }

  static integer(control: AbstractControl) {
    let val = control.value;
    //
    if (val === null || val === '') return null;
    //
    if (!val.toString().match(/^\d+$/)) return { 'invalidInteger': true };
    //
    return null;
  }
}
