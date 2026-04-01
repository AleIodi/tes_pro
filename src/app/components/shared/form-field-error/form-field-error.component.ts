import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';

@Component({
    selector: 'app-form-field-error',
    templateUrl: './form-field-error.component.html',
    styleUrls: ['./form-field-error.component.scss'],
    standalone: false
})

export class FormFieldErrorComponent implements OnInit {
  @Input() formField!: UntypedFormControl;
  @Input() type!: string;
  @Input() dataList!: any[];

  constructor() { }

  ngOnInit(): void { }
}
