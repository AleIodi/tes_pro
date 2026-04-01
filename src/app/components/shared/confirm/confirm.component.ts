import { Component, HostListener, Inject, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
    selector: 'app-confirm',
    templateUrl: './confirm.component.html',
    styleUrls: ['./confirm.component.scss'],
    standalone: false
})

export class ConfirmComponent {
  @HostListener("click", ["$event"]) onClick(event: MouseEvent) { if (event.ctrlKey && event.shiftKey && event.altKey) { alert("ConfirmComponent"); event.stopPropagation(); } }

  @Input() _title = "";
  @Input() message = "Procedere?";

  constructor(public dialogRef: MatDialogRef<ConfirmComponent>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  getMessageLineList(){
    return this.message.split("\n");
  }
}
