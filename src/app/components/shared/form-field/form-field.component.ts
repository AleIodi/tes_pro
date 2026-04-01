import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { Observable } from 'rxjs';

import { COMMA, ENTER } from '@angular/cdk/keycodes';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  standalone: false
})
export class FormFieldComponent implements OnInit {
  @Input() type!: 'text' | 'textarea' | 'number' | 'password' | 'autocomplete' | 'date' | 'time' | 'radiogroup_horizontal' | 'radiogroup_vertical';
  @Input() label!: string;
  @Input() name!: string;
  @Input() formField!: UntypedFormControl;

  @Input() autocompleteObj?: {
    dataList: Observable<any[]>;
    setDataList: () => void;
    display: (value: any) => string;
    filter: any;
    optionSelected?: (event: any) => void;
    buttonObj?: {
      label: string;
      click: () => void;
      icon: string;
    };
    chipsObj?: {
      enabled: boolean;
      removable: boolean;
      dataList: any[];
      required: boolean;
    };
  };

  @Input() radioButtonList: any[] = [];

  @Output() change = new EventEmitter<any>();
  @Output() focusOut = new EventEmitter<any>();
  @Output() keyEnter = new EventEmitter<any>();

  @ViewChild('chipList') chipList: any;
  @ViewChild('chipsInput') chipsInput?: ElementRef<HTMLInputElement>;

  chipList_separatorKeysCodeList: number[] = [ENTER, COMMA];

  constructor() {}

  ngOnInit(): void {}

  changeEmit(): void {
    this.change.emit();
  }

  focusOutEmit(): void {
    this.focusOut.emit();
  }

  keyEnterEmit(): void {
    this.keyEnter.emit();
  }

  autocomplete_optionSelected(event: any): void {
    if (this.autocompleteObj?.optionSelected) {
      this.autocompleteObj.optionSelected(event);
    }

    if (this.autocomplete_isChipEnabled() && this.autocompleteObj?.chipsObj) {
      this.autocompleteObj.chipsObj.dataList.push(event.option.value);

      if (this.chipsInput?.nativeElement) {
        this.chipsInput.nativeElement.value = '';
        this.chipsInput.nativeElement.blur();
      }

      this.formField.setValue('');
    }
  }

  autocomplete_isChipEnabled(): boolean {
    return !!this.autocompleteObj?.chipsObj?.enabled;
  }

  autocomplete_isChipRemovable(): boolean {
    return !!this.autocompleteObj?.chipsObj?.removable;
  }

  chipList_removeElement(index: number): void {
    if (!this.autocompleteObj?.chipsObj) {
      return;
    }

    this.autocompleteObj.chipsObj.dataList.splice(index, 1);
    this.autocompleteObj.setDataList();
  }
}