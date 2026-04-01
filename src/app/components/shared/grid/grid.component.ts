import { Component, Input, AfterViewInit, ViewChild, OnInit, OnChanges, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { SelectionModel } from '@angular/cdk/collections';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from "@angular/material/dialog";
import { formatDate } from '@angular/common';
import { AuthService, USER_GROUP } from 'src/app/services/auth.service';

import { GridPaginationSettingsModel, GridColumnModel, GridToolbarItemModel } from './grid.component.model';
import { promise } from 'protractor';
import { ConstantPool } from '@angular/compiler';

@Component({
    selector: 'app-grid',
    templateUrl: './grid.component.html',
    styleUrls: ['./grid.component.scss'],
    standalone: false
})

export class GridComponent implements OnInit, AfterViewInit, OnChanges {
  isLoading = true;

  selectedRowIndex = -1;

  columnNameList: string[] = [];

  filterList: { [key: string]: UntypedFormControl } = {};
  filterValueList: { [key: string]: string } = {};

  @Input() dataSource!: Promise<object[]>;
  @Input() columnList!: Promise<GridColumnModel[]>;
  @Input() toolbarItemList!: Promise<GridToolbarItemModel[]>;
  @Input() enableCheckbox: boolean  = true;
  @Input() enablePagination: boolean  = true;
  @Input() allowMultiSelect: boolean  = true;
  @Input() gridPaginationSettings?: GridPaginationSettingsModel = <GridPaginationSettingsModel>{
    pageSize: 25,
    pageSizeOptions: [25, 50, 100, 250],
    showFirstLastButtons: true,
  };

  selection = new SelectionModel<{}>();
  matTableDataSource!: MatTableDataSource<{}>;

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  @Output() getSelectedRows = new EventEmitter();

  constructor(private changeDetectorRef: ChangeDetectorRef, private authService: AuthService, private dialog: MatDialog) { }

  ngOnInit() {
    this.columnList.then(async columnList => {
      let userGroupLogged = await this.authService.getUserGroupLogged();
      let button_right = 0;
      //
      let buttonCnt = columnList.map(column => column.type).filter(columnType => columnType === "button").length;
      buttonCnt--;
      //
      for (const column of columnList) {
        let isUserGroupValid = column.userGroupList ? column.userGroupList.includes(userGroupLogged.code) : true;
        //
        if ((column.hidden == undefined || column.hidden == false) && isUserGroupValid) {
          if (userGroupLogged.code == USER_GROUP.SUPER && column.userGroupList && column.userGroupList.length == 1) {
            column.isSuper = true;
          }
          //
          if(column.type == "button"){
            column.button_right = 30*buttonCnt;
            buttonCnt--;
          }
          else{
            column.button_right = 0;
          }
          //
          this.columnNameList.push(column.field);
          this.filterList[column.field] = new UntypedFormControl();
        }
      }
      //
      if (this.enableCheckbox) {
        this.columnNameList.splice(0, 0, "select");
        columnList.splice(0, 0, {
          field: "select",
          label: "#",
          width: "20px",
          type: "select",
        });
      }
    });
    this.selection = new SelectionModel<{}>(this.allowMultiSelect, []);
  }

  isSticky(column: string): boolean {
    return true;//column === 'col1' ? true : false;
  }

  ngAfterViewInit() {
    this.dataSource.then((dataSource) => {
      this.isLoading = false;
      //
      this.matTableDataSource = new MatTableDataSource(dataSource);
      //
      this.matTableDataSource.sort = this.sort;
      this.matTableDataSource.paginator = this.paginator;
      //
      this.matTableDataSource.filterPredicate = this.customFilterPredicate();
    });
  }

  ngOnChanges() {
    this.dataSource.then((dataSource) => {
      this.isLoading = false;
      //
      this.matTableDataSource = new MatTableDataSource(dataSource);
      //
      this.matTableDataSource.sort = this.sort;
      this.matTableDataSource.paginator = this.paginator;
      //
      this.matTableDataSource.filterPredicate = this.customFilterPredicate();
      //
      this.selection.clear();
      //
      this.applyFilter();
    });
  }

  ngAfterViewChecked() {
    this.changeDetectorRef.detectChanges();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.matTableDataSource.data.length;
    return numSelected === numRows;
  }

  masterToggle() {
    this.isAllSelected() ? this.selection.clear() : this.matTableDataSource.data.forEach(row => this.selection.select(row));
    this.getSelectedRows.emit(this.selection.selected);
  }

  rowSelect() {
    this.getSelectedRows.emit(this.selection.selected);
  }

  highlight(row: any) {
    this.selectedRowIndex = row.position;
  }

  getFilterNameArr() {
    return this.columnNameList.map(columnName => columnName.concat("_filter"));
  }

  clearFilterList() {
    this.matTableDataSource.filter = "";
    //
    for (let filterK in this.filterList) {
      let filterV = this.filterList[filterK];
      //
      filterV.setValue("");
    }
  }

  applyFilter() {
    this.columnList.then(columnList => {
      for (const column of columnList) {
        var filterValue = this.filterList[column.field] ? this.filterList[column.field].value : null;
        //
        if (filterValue != null && filterValue.trim() != "") {
          this.filterValueList[column.field] = filterValue;
        }
        else if (this.filterValueList[column.field]) {
          delete this.filterValueList[column.field];
        }
      }
      this.matTableDataSource.filter = JSON.stringify(this.filterValueList);
    });
  }

  customFilterPredicate() {
    const myFilterPredicate = function (dataObj: any, filterJson: string): boolean {
      let columnFilterList = JSON.parse(filterJson);
      let isFound = true;
      //
      for (let columnCode in columnFilterList) {
        if (columnFilterList[columnCode]) {
          //
          /******************************************/
          /* FUNZIONE COPIATA: getValueByColumnCode */
          /******************************************/
          if (columnCode.includes(".")) {
            var filterK_split_arr = columnCode.split(".");
            var value = dataObj;
            filterK_split_arr.forEach(function (field) {
              value = value && value[field] ? value[field] : null;
            });
          }
          else {
            value = dataObj[columnCode];
          }
          /******************************************/
          /******************************************/
          //
          let valueFilter = value;
          //
          isFound = isFound && valueFilter && valueFilter.toString().trim().toLowerCase().includes(columnFilterList[columnCode].trim().toLowerCase());
        }
      }
      //
      return isFound;
    };
    //
    return myFilterPredicate;
  }

  dataRendering(element, column) {
    let columnCode = column.field;
    //
    let elementValue = this.getValueByColumnCode(element, columnCode);
    //
    if (column.dataType == "time") {
      elementValue = formatDate(new Date(elementValue), "HH:mm", "en-EN");
    }
    else if (column.dataType == "datetime") {
      elementValue = formatDate(new Date(elementValue), "dd-MM-yyyy HH:mm", "en-EN");
    }
    else if (column.dataType == "date") {
      elementValue = formatDate(new Date(elementValue), "dd-MM-yyyy", "en-EN");
    }
    //
    return elementValue;
  }

  private getValueByColumnCode(dataObj: {}, columnCode: string): string {
    if (columnCode.includes(".")) {
      var filterK_split_arr = columnCode.split(".");
      var value = dataObj;
      filterK_split_arr.forEach(function (field) {
        value = value && value[field] ? value[field] : null;
      });
    }
    else {
      value = dataObj[columnCode];
    }
    //
    return <string>value;
  }

  onColumnButtonClick(column: GridColumnModel, element) {
    column.click(element);
  }

  isButtonDisabled(column: GridColumnModel, element) {
    let isButtonDisabled = false;
    //
    if (column.rowDisabledFunction) {
      isButtonDisabled = column.rowDisabledFunction(element);
    }
    //
    return isButtonDisabled;
  }

  onToolbarItemButtonClick(toolbarItem: GridToolbarItemModel) {
    // const dialogConfig = new MatDialogConfig();

    // dialogConfig.disableClose = true;
    // dialogConfig.autoFocus = true;

    // this.dialog.open(ConsumerListComponent, dialogConfig);

    toolbarItem.click();
  }

  isShowTooltip(fieldContainer) {
    return (fieldContainer.offsetWidth < fieldContainer.scrollWidth);
  }
}
