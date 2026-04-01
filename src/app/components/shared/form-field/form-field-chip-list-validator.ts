import { AbstractControl, FormControl } from '@angular/forms';

export class CustomValidators {
  static chipList_Required(formControl: FormControl) {
    if (formControl.value.length === 0) {
      return { required: true };
    }
    else {
      return null;
    }
  }
}
