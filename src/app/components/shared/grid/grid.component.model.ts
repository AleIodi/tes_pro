export interface GridPaginationSettingsModel {
  pageSize: number;
  pageSizeOptions: number[];
  showFirstLastButtons: boolean;
}

export interface GridColumnModel {
  field: string;
  label: string;
  width?: string;
  hidden?: boolean;
  type?: GridColumnType;
  icon?: string;
  click?: Function;
  dataType?: GridColumnDataType,
  editable?: boolean;
  styleObj?: {};
  disableSorting?: boolean;
  iconObj?: {};
  isUserGroupValid?: boolean;
  userGroupList?: string[];
  isSuper?: boolean;
  button_right?: number;
  rowDisabledFunction?: Function;
}

export interface GridToolbarItemModel {
  code: string;
  label?: string;
  icon?: string;
  click?: Function;
  isUserGroupValid?: boolean;
  hidden?: boolean;
}

export type GridColumnType = "select" | "button" | "bool" | "icon";
export type GridColumnDataType = "text" | "number" | "decimal" | "date" | "time" | "checkbox";
