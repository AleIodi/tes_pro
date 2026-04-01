import { differenceInMinutes } from 'date-fns';
import Dexie from 'dexie';
import "reflect-metadata";
import { environment } from 'src/environments/environment';

import { IdbService } from '../services/idb.service'

export interface I_Join {
  field: string,
  table: string;
  table_field?: string;
  alias?: string,
  joinType?: null | "LEFT" | "INNER",
  joinList?: I_Join[],
}

export interface I_OrderBy {
  field: string,
  direction: "ASC" | "DESC";
}

export enum CONSUMER_TYPOLOGY {
  CUSTOMER = "CUSTOMER",
  MANUFACTURER = "MANUFACTURER",
  DESTINATION = "DESTINATION",
}

export enum SERVICE_TYPOLOGY {
  INTERNAL = "INTERNAL",
  ASSISTANCE = "ASSISTANCE",
  EXTERNAL = "EXTERNAL",
  TICKET = "TICKET",
}

export enum SERVICE_TASK_REPORT_STATUS {
  NEW = "NEW",
  SENT = "SENT",
  VIEWED = "VIEWED",
  SIGNED = "SIGNED",
}

export enum SERVICE_CALL_STATUS {
  NEW = "NEW",
  SCHEDULED = "SCHEDULED",
  COMPLETED = "COMPLETED",
}

export enum AUTODOP_VERBAL_STATUS {
  NEW = "NEW",
  COMPILED = "COMPILED",
  SENT = "SENT",
}

export enum AUTODOP_VERBAL_TYPOLOGY {
  TESTING = "TESTING",
  TRAINING = "TRAINING",
}

export class Schema {
  static tablePushList: { [key: string]: string[] } = {};
  static tableList: { [key: string]: string[] } = {};
  static relationList: { [key: string]: string[] } = {};
  static defaultObj: {} = {};

  static addField(className: string, field: string, def?: string) {
    let table = className.replace("DB_", "");
    //
    //tablePushList & defaultObj
    //
    if (!Schema.tablePushList[table]) {
      Schema.tablePushList[table] = [];
    }
    //
    if (!Schema.defaultObj[table]) {
      Schema.defaultObj[table] = {};
    }
    //
    if (field != "id" && field != "idr" && field[0] != "[") {
      Schema.tablePushList[table].push(field);
      //
      Schema.defaultObj[table][field] = def && def != "" ? def : null;
    }
    //
    //tableList
    //
    if (!Schema.tableList[table]) {
      Schema.tableList[table] = [];
    }
    //
    if (field == "id") {
      field = "++id";
    }
    else if (field == "idr") {
      field = "&idr";
    }
    //
    Schema.tableList[table].push(field);
  }

  static addRelation(className: string, relationArr: string[]) {
    let table = className.replace("DB_", "");
    //
    if (!Schema.relationList[table]) {
      Schema.relationList[table] = [];
    }
    //
    Schema.relationList[table][relationArr[0]] = relationArr[1];
  }
}

// #############################################################################################################################
// #############################################################################################################################
// #############################################################################################################################

export class DB_db_schema {
  id?: number;
  schema: string;
}
Schema.addField("DB_db_schema", "id");
Schema.addField("DB_db_schema", "schema");
export interface IDB_db_schema extends DB_db_schema { };

// #############################################################################################################################

export class DB_user_group {
  id?: number;
  idr?: number;
  code: string;
  label: string;
  enabled: string;
}
Schema.addField("DB_user_group", "id");
Schema.addField("DB_user_group", "idr");
Schema.addField("DB_user_group", "code");
Schema.addField("DB_user_group", "label");
Schema.addField("DB_user_group", "enabled");
Schema.addField("DB_user_group", "[id+enabled]");
export interface IDB_user_group extends DB_user_group { };

// #############################################################################################################################

export class DB_user {
  id?: number;
  idr?: number;
  username: string;
  password: string;
  id_user_group: number;
  ext_code: string;
  name_first: string;
  name_last: string;
  signature: string;
  enabled: string;
  to_push: string;
  static user_group = ["id_user_group", "user_group"];
}
Schema.addField("DB_user", "id");
Schema.addField("DB_user", "idr");
Schema.addField("DB_user", "username");
Schema.addField("DB_user", "password");
Schema.addField("DB_user", "id_user_group");
Schema.addField("DB_user", "ext_code");
Schema.addField("DB_user", "name_first");
Schema.addField("DB_user", "name_last");
Schema.addField("DB_user", "signature");
Schema.addField("DB_user", "enabled");
Schema.addField("DB_user", "to_push", "0");
Schema.addField("DB_user", "[id+enabled]");
Schema.addField("DB_user", "[username+enabled]");
Schema.addRelation("DB_user", ["id_user_group", "user_group"]);
export interface IDB_user extends DB_user { };

// #############################################################################################################################

export class DB_sync {
  id?: number;
  code: string;
  enabled: string;
}
Schema.addField("DB_sync", "id");
Schema.addField("DB_sync", "code");
Schema.addField("DB_sync", "enabled");
Schema.addField("DB_sync", "[code+enabled]");
export interface IDB_sync extends DB_sync { };

// #############################################################################################################################

export class DB_user_sync {
  id?: number;
  idr?: number;
  id_user: number;
  id_sync: number;
  last_update: string;
  enabled: string;
  static user = ["id_user", "user"];
  static sync = ["id_sync", "sync"];
}
Schema.addField("DB_user_sync", "id");
Schema.addField("DB_user_sync", "idr");
Schema.addField("DB_user_sync", "id_user");
Schema.addField("DB_user_sync", "id_sync");
Schema.addField("DB_user_sync", "last_update");
Schema.addField("DB_user_sync", "enabled");
Schema.addField("DB_user_sync", "[id+enabled]");
Schema.addField("DB_user_sync", "[id_user+id_sync]");
Schema.addField("DB_user_sync", "[id_user+id_sync+enabled]");
Schema.addRelation("DB_user_sync", ["id_user", "user"]);
Schema.addRelation("DB_user_sync", ["id_sync", "sync"]);
export interface IDB_user_sync extends DB_user_sync { };

// #############################################################################################################################

export class DB_user_setting {
  id?: number;
  idr?: number;
  id_user: number;
  code: string;
  value: string
  enabled: string;
  to_push: string;
  static user = ["id_user", "user"];
}
Schema.addField("DB_user_setting", "id");
Schema.addField("DB_user_setting", "idr");
Schema.addField("DB_user_setting", "id_user");
Schema.addField("DB_user_setting", "code");
Schema.addField("DB_user_setting", "name");
Schema.addField("DB_user_setting", "enabled");
Schema.addField("DB_user_setting", "to_push", "0");
Schema.addField("DB_user_setting", "[code+id_user]");
Schema.addField("DB_user_setting", "[code+id_user+enabled]");
Schema.addRelation("DB_user_setting", ["id_user", "user"]);
export interface IDB_user_setting extends DB_user_setting { };

// #############################################################################################################################

export class DB_user_user_child {
  id?: number;
  idr?: number;
  id_user: number;
  id_user_child: number;
  enabled: string;
  static user = ["id_user", "user"];
  static user_child = ["id_user_child", "user"];
}
Schema.addField("DB_user_user_child", "id");
Schema.addField("DB_user_user_child", "idr");
Schema.addField("DB_user_user_child", "id_user");
Schema.addField("DB_user_user_child", "id_user_child");
Schema.addField("DB_user_user_child", "enabled");
Schema.addField("DB_user_user_child", "[id_user+enabled]");
Schema.addRelation("DB_user_user_child", ["id_user", "user"]);
Schema.addRelation("DB_user_user_child", ["id_user_child", "user"]);
export interface IDB_user_user_child extends DB_user_user_child { };

// #############################################################################################################################

export class DB_consumer_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  enabled: string;
}
Schema.addField("DB_consumer_typology", "id");
Schema.addField("DB_consumer_typology", "idr");
Schema.addField("DB_consumer_typology", "code");
Schema.addField("DB_consumer_typology", "name");
Schema.addField("DB_consumer_typology", "enabled");
Schema.addField("DB_consumer_typology", "[code+enabled]");
export interface IDB_consumer_typology extends DB_consumer_typology { };

// #############################################################################################################################

export class DB_consumer {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  id_consumer_typology: number;
  id_consumer_parent: number;
  address: string;
  city: string;
  zip: string;
  province: string;
  nation: string;
  vat: string;
  email: string;
  phone: string;
  trip_km: number;
  trip_minutes: number;
  enabled: string;
  to_push: string;
  static consumer_typology = ["id_consumer_typology", "consumer_typology"];
  static consumer_parent = ["id_consumer_parent", "consumer"];
}
Schema.addField("DB_consumer", "id");
Schema.addField("DB_consumer", "idr");
Schema.addField("DB_consumer", "code");
Schema.addField("DB_consumer", "name");
Schema.addField("DB_consumer", "id_consumer_typology");
Schema.addField("DB_consumer", "id_consumer_parent");
Schema.addField("DB_consumer", "address");
Schema.addField("DB_consumer", "city");
Schema.addField("DB_consumer", "zip");
Schema.addField("DB_consumer", "province");
Schema.addField("DB_consumer", "nation");
Schema.addField("DB_consumer", "vat");
Schema.addField("DB_consumer", "email");
Schema.addField("DB_consumer", "phone");
Schema.addField("DB_consumer", "trip_km");
Schema.addField("DB_consumer", "trip_minutes");
Schema.addField("DB_consumer", "enabled");
Schema.addField("DB_consumer", "to_push", "0");
Schema.addField("DB_consumer", "[id+enabled]");
Schema.addField("DB_consumer", "[enabled+id_consumer_typology]");
Schema.addField("DB_consumer", "[enabled+id_consumer_typology+id_consumer_parent]");
Schema.addRelation("DB_consumer", ["id_consumer_typology", "consumer_typology"]);
Schema.addRelation("DB_consumer", ["id_consumer_parent", "consumer"]);
export interface IDB_consumer extends DB_consumer { };

// #############################################################################################################################

export class DB_job_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  enabled: string;
}
Schema.addField("DB_job_typology", "id");
Schema.addField("DB_job_typology", "idr");
Schema.addField("DB_job_typology", "code");
Schema.addField("DB_job_typology", "name");
Schema.addField("DB_job_typology", "enabled");
export interface IDB_job_typology extends DB_job_typology { };

export class DB_job {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  id_consumer: number;
  id_job_typology: number;
  enabled: string;
  static consumer = ["id_consumer", "consumer"];
}
Schema.addField("DB_job", "id");
Schema.addField("DB_job", "idr");
Schema.addField("DB_job", "code");
Schema.addField("DB_job", "name");
Schema.addField("DB_job", "id_consumer");
Schema.addField("DB_job", "id_job_typology");
Schema.addField("DB_job", "enabled");
Schema.addField("DB_job", "[id+enabled]");
Schema.addField("DB_job", "[id_consumer+enabled]");
Schema.addField("DB_job", "[enabled+id_consumer]");
Schema.addRelation("DB_job", ["id_consumer", "consumer"]);
Schema.addRelation("DB_job", ["id_job_typology", "job_typology"]);
export interface IDB_job extends DB_job { };

// #############################################################################################################################

export class DB_job_details {
  id?: number;
  idr?: number;
  id_job: number;
  id_job_details_action: number;
  enabled: string;
  static job = ["id_job", "job"];
  static job_details_action = ["id_job_details_action", "job_details_action"];
}
Schema.addField("DB_job_details", "id");
Schema.addField("DB_job_details", "idr");
Schema.addField("DB_job_details", "id_job");
Schema.addField("DB_job_details", "id_job_details_action");
Schema.addField("DB_job_details", "enabled");
Schema.addField("DB_job_details", "[id+enabled]");
Schema.addField("DB_job_details", "[id_job+enabled]");
Schema.addRelation("DB_job_details", ["id_job", "job"]);
Schema.addRelation("DB_job_details", ["id_job_details_action", "job_details_action"]);
export interface IDB_job_details extends DB_job_details { };

// #############################################################################################################################

export class DB_job_details_action {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  enabled: string;
}
Schema.addField("DB_job_details_action", "id");
Schema.addField("DB_job_details_action", "idr");
Schema.addField("DB_job_details_action", "code");
Schema.addField("DB_job_details_action", "name");
Schema.addField("DB_job_details_action", "enabled");
Schema.addField("DB_job_details_action", "[id+enabled]");
export interface IDB_job_details_action extends DB_job_details_action { };

// #############################################################################################################################

export class DB_service_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  color?: string;
  priority: number;
  enabled: string;
}
Schema.addField("DB_service_typology", "id");
Schema.addField("DB_service_typology", "idr");
Schema.addField("DB_service_typology", "code");
Schema.addField("DB_service_typology", "name");
Schema.addField("DB_service_typology", "color");
Schema.addField("DB_service_typology", "priority");
Schema.addField("DB_service_typology", "enabled");
Schema.addField("DB_service_typology", "[id+enabled]");
Schema.addField("DB_service_typology", "[code+enabled]");
export interface IDB_service_typology extends DB_service_typology { };

// #############################################################################################################################

export class DB_service_call_status {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  color: string;
  priority: number;
  enabled: string;
}
Schema.addField("DB_service_call_status", "id");
Schema.addField("DB_service_call_status", "idr");
Schema.addField("DB_service_call_status", "code");
Schema.addField("DB_service_call_status", "name");
Schema.addField("DB_service_call_status", "color");
Schema.addField("DB_service_call_status", "priority");
Schema.addField("DB_service_call_status", "enabled");
Schema.addField("DB_service_call_status", "[id+enabled]");
Schema.addField("DB_service_call_status", "[code+enabled]");
export interface IDB_service_call_status extends DB_service_call_status { };

// #############################################################################################################################

export class DB_service_call {
  id?: number;
  idr?: number;
  code?: string;
  id_service_call_status: number;
  id_consumer: number;
  id_contact?: number;
  id_destination?: number;
  id_job?: number;
  id_job_details?: number;
  description: string;
  date_create?: string;
  date_start?: string;
  date_end?: string;
  notes?: string;
  id_user_creator: number;
  enabled: string;
  to_push: string;
  static service_call_status = ["id_service_call_status", "service_call_status"];
  static consumer = ["id_consumer", "consumer"];
  static destination = ["id_destination", "destination"];
  static contact = ["id_contact", "contact"];
  static job = ["id_job", "job"];
  static job_details = ["id_job_details", "job_details"];
  static user_creator = ["id_user_creator", "user"];
}
Schema.addField("DB_service_call", "id");
Schema.addField("DB_service_call", "idr");
Schema.addField("DB_service_call", "code");
Schema.addField("DB_service_call", "id_service_call_status");
Schema.addField("DB_service_call", "id_consumer");
Schema.addField("DB_service_call", "id_destination");
Schema.addField("DB_service_call", "id_job");
Schema.addField("DB_service_call", "id_job_details");
Schema.addField("DB_service_call", "description");
Schema.addField("DB_service_call", "date_create");
Schema.addField("DB_service_call", "date_start");
Schema.addField("DB_service_call", "date_end");
Schema.addField("DB_service_call", "id_contact");
Schema.addField("DB_service_call", "notes");
Schema.addField("DB_service_call", "id_user_creator");
Schema.addField("DB_service_call", "enabled");
Schema.addField("DB_service_call", "to_push", "0");
Schema.addField("DB_service_call", "[id_user+enabled]");
Schema.addField("DB_service_call", "[id_user+enabled+date_start]");
Schema.addRelation("DB_service_call", ["id_service_call_status", "service_call_status"]);
Schema.addRelation("DB_service_call", ["id_consumer", "consumer"]);
Schema.addRelation("DB_service_call", ["id_contact", "contact"]);
Schema.addRelation("DB_service_call", ["id_destination", "consumer"]);
Schema.addRelation("DB_service_call", ["id_job", "job"]);
Schema.addRelation("DB_service_call", ["id_job_details", "job_details"]);
Schema.addRelation("DB_service_call", ["id_user_creator", "user"]);
export interface IDB_service_call extends DB_service_call { };

// #############################################################################################################################

export class DB_service_call_user {
  id?: number;
  idr?: number;
  id_service_call: number;
  id_user: number;
  enabled: string;
  to_push: string;
  static service_call = ["id_service_call", "service_call"];
  static user = ["id_user", "user"];
}
Schema.addField("DB_service_call_user", "id");
Schema.addField("DB_service_call_user", "idr");
Schema.addField("DB_service_call_user", "id_service_call");
Schema.addField("DB_service_call_user", "id_user");
Schema.addField("DB_service_call_user", "enabled");
Schema.addField("DB_service_call_user", "to_push", "0");
Schema.addField("DB_service_call_user", "[id_service_call+enabled]");
Schema.addField("DB_service_call_user", "[id_service_call+id_user]");
Schema.addRelation("DB_service_call_user", ["id_service_call", "service_call"]);
Schema.addRelation("DB_service_call_user", ["id_user", "user"]);
export interface IDB_service_call_user extends DB_service_call_user { };

// #############################################################################################################################

export class DB_service_call_machine {
  id?: number;
  idr?: number;
  id_service_call: number;
  id_machine: number;
  enabled: string;
  to_push: string;
  static service_call = ["id_service_call", "service_call"];
  static job_details = ["id_machine", "machine"];
}
Schema.addField("DB_service_call_machine", "id");
Schema.addField("DB_service_call_machine", "idr");
Schema.addField("DB_service_call_machine", "id_service_call");
Schema.addField("DB_service_call_machine", "id_machine");
Schema.addField("DB_service_call_machine", "enabled");
Schema.addField("DB_service_call_machine", "to_push", "0");
Schema.addField("DB_service_call_machine", "[id+enabled]");
Schema.addField("DB_service_call_machine", "[id_service_call+id_machine]");
Schema.addRelation("DB_service_call_machine", ["id_service_call", "service_call"]);
Schema.addRelation("DB_service_call_machine", ["id_machine", "machine"]);
export interface IDB_service_call_machine extends DB_service_call_machine { };

// #############################################################################################################################

export class DB_service_task {
  id?: number;
  idr?: number;
  code?: string;
  id_service_call?: number;
  id_job_details?: number;
  id_destination?: number;
  id_user_creator?: number;
  description?: string;
  date_start: string;
  date_end: string;
  id_contact: number;
  notes: string;
  notes_internal: string;
  is_finished?: string;
  id_truck?: number;
  enabled: string;
  to_push: string;
  static service_call = ["id_service_call", "service_call"];
  static job_details = ["id_job_details", "job_details"];
  static destination = ["id_destination", "consumer"];
  static user_creator = ["id_user_creator", "user"];
  static contact = ["id_contact", "contact"];
  static truck = ["id_truck", "truck"];
}
Schema.addField("DB_service_task", "id");
Schema.addField("DB_service_task", "idr");
Schema.addField("DB_service_task", "code");
Schema.addField("DB_service_task", "id_service_call");
Schema.addField("DB_service_task", "id_job_details");
Schema.addField("DB_service_task", "id_destination");
Schema.addField("DB_service_task", "id_user_creator");
Schema.addField("DB_service_task", "description");
Schema.addField("DB_service_task", "date_start");
Schema.addField("DB_service_task", "date_end");
Schema.addField("DB_service_task", "id_contact");
Schema.addField("DB_service_task", "notes");
Schema.addField("DB_service_task", "notes_internal");
Schema.addField("DB_service_task", "is_finished");
Schema.addField("DB_service_task", "id_truck");
Schema.addField("DB_service_task", "enabled");
Schema.addField("DB_service_task", "to_push", "0");
Schema.addField("DB_service_task", "[id+enabled]");
Schema.addField("DB_service_task", "[enabled]");
Schema.addField("DB_service_task", "[enabled+date_start]");
Schema.addRelation("DB_service_task", ["id_service_call", "service_call"]);
Schema.addRelation("DB_service_task", ["id_job_details", "job_details"]);
Schema.addRelation("DB_service_task", ["id_destination", "consumer"]);
Schema.addRelation("DB_service_task", ["id_user_creator", "user"]);
Schema.addRelation("DB_service_task", ["id_contact", "contact"]);
Schema.addRelation("DB_service_task", ["id_truck", "truck"]);
export interface IDB_service_task extends DB_service_task { };

// #############################################################################################################################

export class DB_service_operation_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  color?: string;
  priority: number;
  is_external: string;
  id_service_typology: number;
  enabled: string;
  static service_typology = ["id_service_typology", "service_typology"];
}
Schema.addField("DB_service_operation_typology", "id");
Schema.addField("DB_service_operation_typology", "idr");
Schema.addField("DB_service_operation_typology", "code");
Schema.addField("DB_service_operation_typology", "name");
Schema.addField("DB_service_operation_typology", "color");
Schema.addField("DB_service_operation_typology", "priority");
Schema.addField("DB_service_operation_typology", "is_external");
Schema.addField("DB_service_operation_typology", "id_service_typology");
Schema.addField("DB_service_operation_typology", "enabled");
Schema.addField("DB_service_operation_typology", "[id+enabled]");
Schema.addField("DB_service_operation_typology", "[code+enabled]");
Schema.addField("DB_service_operation_typology", "[enabled+is_external]");
Schema.addRelation("DB_service_operation_typology", ["id_service_typology", "service_typology"]);
export interface IDB_service_operation_typology extends DB_service_operation_typology { };

// #############################################################################################################################

export class DB_service_operation {
  id?: number;
  idr?: number;
  code?: string;
  id_service_task?: number;
  id_job_details: number;
  description: string;
  date_start: string;
  date_end: string;
  id_user: number;
  id_service_operation_typology: number;
  id_service_typology: number;
  is_external: string;
  enabled: string;
  to_push: string;
  static service_task = ["id_service_task", "service_task"];
  static job_details = ["id_job_details", "job_details"];
  static user = ["id_user", "user"];
  static service_operation_typology = ["id_service_operation_typology", "service_operation_typology"];
  static service_typology = ["id_service_typology", "service_typology"];
}
Schema.addField("DB_service_operation", "id");
Schema.addField("DB_service_operation", "idr");
Schema.addField("DB_service_operation", "code");
Schema.addField("DB_service_operation", "id_service_task");
Schema.addField("DB_service_operation", "id_job_details");
Schema.addField("DB_service_operation", "description");
Schema.addField("DB_service_operation", "date_start");
Schema.addField("DB_service_operation", "date_end");
Schema.addField("DB_service_operation", "id_user");
Schema.addField("DB_service_operation", "id_service_operation_typology");
Schema.addField("DB_service_operation", "id_service_typology");
Schema.addField("DB_service_operation", "is_external");
Schema.addField("DB_service_operation", "enabled");
Schema.addField("DB_service_operation", "to_push", "0");
Schema.addField("DB_service_operation", "[id+enabled]");
Schema.addField("DB_service_operation", "[id_user+enabled]");
Schema.addField("DB_service_operation", "[id_service_task+enabled]");
Schema.addField("DB_service_operation", "[id_user+enabled+date_start]");
Schema.addField("DB_service_operation", "[id_user+enabled+id_service_task+date_start]");
Schema.addField("DB_service_operation", "[id_user+enabled+is_external]");
Schema.addField("DB_service_operation", "[id_user+enabled+is_external+date_start]");
Schema.addField("DB_service_operation", "[id_user+enabled+id_service_task+is_external]");
Schema.addField("DB_service_operation", "[id_user+enabled+id_service_task]");
Schema.addField("DB_service_operation", "[id_user+enabled+id_service_task+is_external+date_start]");
Schema.addRelation("DB_service_operation", ["id_service_task", "service_task"]);
Schema.addRelation("DB_service_operation", ["id_job_details", "job_details"]);
Schema.addRelation("DB_service_operation", ["id_user", "user"]);
Schema.addRelation("DB_service_operation", ["id_service_operation_typology", "service_operation_typology"]);
Schema.addRelation("DB_service_operation", ["id_service_typology", "service_typology"]);
export interface IDB_service_operation extends DB_service_operation { };

// #############################################################################################################################

export class DB_service_operation_machine {
  id?: number;
  idr?: number;
  id_service_operation: number;
  id_machine: number;
  enabled: string;
  to_push: string;
  static service_operation = ["id_service_operation", "service_operation"];
  static job_details = ["id_machine", "machine"];
}
Schema.addField("DB_service_operation_machine", "id");
Schema.addField("DB_service_operation_machine", "idr");
Schema.addField("DB_service_operation_machine", "id_service_operation");
Schema.addField("DB_service_operation_machine", "id_machine");
Schema.addField("DB_service_operation_machine", "enabled");
Schema.addField("DB_service_operation_machine", "to_push", "0");
Schema.addField("DB_service_operation_machine", "[id+enabled]");
Schema.addField("DB_service_operation_machine", "[id_service_operation+id_machine]");
Schema.addRelation("DB_service_operation_machine", ["id_service_operation", "service_operation"]);
Schema.addRelation("DB_service_operation_machine", ["id_machine", "machine"]);
export interface IDB_service_operation_machine extends DB_service_operation_machine { };

// #############################################################################################################################

export class DB_service_extra_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  color?: string;
  priority: number;
  is_refund: string;
  enabled: string;
}
Schema.addField("DB_service_extra_typology", "id");
Schema.addField("DB_service_extra_typology", "idr");
Schema.addField("DB_service_extra_typology", "code");
Schema.addField("DB_service_extra_typology", "name");
Schema.addField("DB_service_extra_typology", "color");
Schema.addField("DB_service_extra_typology", "priority");
Schema.addField("DB_service_extra_typology", "is_refund");
Schema.addField("DB_service_extra_typology", "enabled");
Schema.addField("DB_service_extra_typology", "[id+enabled]");
Schema.addField("DB_service_extra_typology", "[code+enabled]");
Schema.addField("DB_service_extra_typology", "[enabled+is_refund]");
export interface IDB_service_extra_typology extends DB_service_extra_typology { };

// #############################################################################################################################

export class DB_service_extra {
  id?: number;
  idr?: number;
  code?: string;
  id_service_task?: number;
  id_job?: number;
  value: string;
  date_start: string;
  date_end: string;
  id_user: number;
  id_service_extra_typology: number;
  id_service_typology: number;
  notes: string;
  is_external: string;
  enabled: string;
  to_push: string;
  static service_task = ["id_service_task", "service_task"];
  static job = ["id_job", "job"];
  static user = ["id_user", "user"];
  static service_extra_typology = ["id_service_extra_typology", "service_extra_typology"];
  static service_typology = ["id_service_typology", "service_typology"];
}
Schema.addField("DB_service_extra", "id");
Schema.addField("DB_service_extra", "idr");
Schema.addField("DB_service_extra", "code");
Schema.addField("DB_service_extra", "id_service_task");
Schema.addField("DB_service_extra", "id_job");
Schema.addField("DB_service_extra", "value");
Schema.addField("DB_service_extra", "date_start");
Schema.addField("DB_service_extra", "date_end");
Schema.addField("DB_service_extra", "id_user");
Schema.addField("DB_service_extra", "id_service_extra_typology");
Schema.addField("DB_service_extra", "id_service_typology");
Schema.addField("DB_service_extra", "notes");
Schema.addField("DB_service_extra", "is_external");
Schema.addField("DB_service_extra", "enabled");
Schema.addField("DB_service_extra", "to_push", "0");
Schema.addField("DB_service_extra", "[id+enabled]");
Schema.addField("DB_service_extra", "[id_user+enabled]");
Schema.addField("DB_service_extra", "[id_user+enabled+date_start]");
Schema.addField("DB_service_extra", "[id_user+enabled+is_refund]");
Schema.addField("DB_service_extra", "[id_user+enabled+id_service_task]");
Schema.addField("DB_service_extra", "[id_user+enabled+is_refund+date_start]");
Schema.addField("DB_service_extra", "[id_user+enabled+id_service_task+date_start]");
Schema.addField("DB_service_extra", "[id_service_extra_typology+id_user+enabled]");
Schema.addField("DB_service_extra", "[id_user+enabled+is_external]");
Schema.addField("DB_service_extra", "[id_user+enabled+is_external+date_start]");
Schema.addField("DB_service_extra", "[id_user+enabled+id_service_task+is_external+date_start]");
Schema.addField("DB_service_extra", "[id_user+enabled+id_service_task+is_external]");
Schema.addRelation("DB_service_extra", ["id_service_task", "service_task"]);
Schema.addRelation("DB_service_extra", ["id_job", "job"]);
Schema.addRelation("DB_service_extra", ["id_user", "user"]);
Schema.addRelation("DB_service_extra", ["id_service_extra_typology", "service_extra_typology"]);
Schema.addRelation("DB_service_extra", ["id_service_typology", "service_typology"]);
export interface IDB_service_extra extends DB_service_extra { };

// #############################################################################################################################

export class DB_service_task_user {
  id?: number;
  idr?: number;
  id_service_task: number;
  id_user: number;
  enabled: string;
  to_push: string;
  static service_task = ["id_service_task", "service_task"];
  static user = ["id_user", "user"];
}
Schema.addField("DB_service_task_user", "id");
Schema.addField("DB_service_task_user", "idr");
Schema.addField("DB_service_task_user", "id_service_task");
Schema.addField("DB_service_task_user", "id_user");
Schema.addField("DB_service_task_user", "enabled");
Schema.addField("DB_service_task_user", "to_push", "0");
Schema.addField("DB_service_task_user", "[id_service_task+enabled]");
Schema.addField("DB_service_task_user", "[id_service_task+id_user]");
Schema.addRelation("DB_service_task_user", ["id_service_task", "service_task"]);
Schema.addRelation("DB_service_task_user", ["id_user", "user"]);
export interface IDB_service_task_user extends DB_service_task_user { };

// #############################################################################################################################

export class DB_service_trip {
  id?: number;
  idr?: number;
  code?: string;
  id_service_task: number;
  date_start: string;
  date_end: string;
  id_user: number;
  km_invoice: number;
  km_real: number;
  id_destination: number;
  enabled: string;
  to_push: string;
  static service_task = ["id_service_task", "service_task"];
  static user = ["id_user", "user"];
  static destination = ["id_destination", "consumer"];
}
Schema.addField("DB_service_trip", "id");
Schema.addField("DB_service_trip", "idr");
Schema.addField("DB_service_trip", "code");
Schema.addField("DB_service_trip", "id_service_task");
Schema.addField("DB_service_trip", "date_start");
Schema.addField("DB_service_trip", "date_end");
Schema.addField("DB_service_trip", "id_user");
Schema.addField("DB_service_trip", "km_invoice");
Schema.addField("DB_service_trip", "km_real");
Schema.addField("DB_service_trip", "id_destination");
Schema.addField("DB_service_trip", "enabled");
Schema.addField("DB_service_trip", "to_push", "0");
Schema.addField("DB_service_trip", "[id+enabled]");
Schema.addField("DB_service_trip", "[id_user+enabled]");
Schema.addField("DB_service_trip", "[id_user+enabled+id_service_task]");
Schema.addField("DB_service_trip", "[id_user+enabled+date_start]");
Schema.addField("DB_service_trip", "[id_user+enabled+id_service_task+date_start]");
Schema.addRelation("DB_service_trip", ["id_service_task", "service_task"]);
Schema.addRelation("DB_service_trip", ["id_user", "user"]);
Schema.addRelation("DB_service_trip", ["id_destination", "consumer"]);
export interface IDB_service_trip extends DB_service_trip { };

// #############################################################################################################################

export class DB_contact {
  id?: number;
  idr?: number;
  name_first: string;
  name_last: string;
  phone: string;
  email: string;
  id_consumer: number;
  enabled: string;
  to_push: string;
  static consumer = ["id_consumer", "consumer"];
}
Schema.addField("DB_contact", "id");
Schema.addField("DB_contact", "idr");
Schema.addField("DB_contact", "name_first");
Schema.addField("DB_contact", "name_last");
Schema.addField("DB_contact", "phone");
Schema.addField("DB_contact", "email");
Schema.addField("DB_contact", "id_consumer");
Schema.addField("DB_contact", "enabled");
Schema.addField("DB_contact", "to_push", "0");
Schema.addField("DB_contact", "[id+enabled]");
Schema.addField("DB_contact", "[enabled+id_consumer]");
Schema.addRelation("DB_contact", ["id_consumer", "consumer"]);
export interface IDB_contact extends DB_contact { };

// #############################################################################################################################

export class DB_machine_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  enabled: string;
}
Schema.addField("DB_machine_typology", "id");
Schema.addField("DB_machine_typology", "idr");
Schema.addField("DB_machine_typology", "code");
Schema.addField("DB_machine_typology", "name");
Schema.addField("DB_machine_typology", "enabled");
Schema.addField("DB_machine_typology", "[code+enabled]");
export interface IDB_machine_typology extends DB_machine_typology { };

// #############################################################################################################################

export class DB_machine {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  ext_code: string;
  id_machine_typology: number;
  id_consumer: number;
  id_destination: number;
  enabled: string;
  to_push: string;
  static machine_typology = ["id_machine_typology", "machine_typology"];
  static consumer = ["id_consumer", "consumer"];
}
Schema.addField("DB_machine", "id");
Schema.addField("DB_machine", "idr");
Schema.addField("DB_machine", "code");
Schema.addField("DB_machine", "name");
Schema.addField("DB_machine", "ext_code");
Schema.addField("DB_machine", "id_machine_typology");
Schema.addField("DB_machine", "id_consumer");
Schema.addField("DB_machine", "id_destination");
Schema.addField("DB_machine", "enabled");
Schema.addField("DB_machine", "to_push", "0");
Schema.addField("DB_machine", "[id+enabled]");
Schema.addField("DB_machine", "[enabled+id_consumer]");
Schema.addField("DB_machine", "[enabled+id_consumer+id_destination]");
Schema.addRelation("DB_machine", ["id_machine_typology", "machine_typology"]);
Schema.addRelation("DB_machine", ["id_consumer", "consumer"]);
Schema.addRelation("DB_machine", ["id_destination", "consumer"]);
export interface IDB_machine extends DB_machine { };

// #############################################################################################################################

export class DB_product {
  id?: number;
  idr?: number;
  article: string;
  name: string;
  um?: string;
  enabled: string;
  to_push: string;
}
Schema.addField("DB_product", "id");
Schema.addField("DB_product", "idr");
Schema.addField("DB_product", "article");
Schema.addField("DB_product", "name");
Schema.addField("DB_product", "um");
Schema.addField("DB_product", "enabled");
Schema.addField("DB_product", "to_push", "0");
Schema.addField("DB_product", "[id+enabled]");
export interface IDB_product extends DB_product { };

// #############################################################################################################################

export class DB_service_task_product {
  id?: number;
  idr?: number;
  code?: string;
  id_service_task: number;
  id_product: number;
  value: number;
  id_user: number;
  date_start: string;
  enabled: string;
  to_push: string;
  static service_task = ["id_service_task", "service_task"];
  static product = ["id_product", "product"];
  static user = ["id_user", "user"];
}
Schema.addField("DB_service_task_product", "id");
Schema.addField("DB_service_task_product", "idr");
Schema.addField("DB_service_task_product", "code");
Schema.addField("DB_service_task_product", "id_service_task");
Schema.addField("DB_service_task_product", "id_product");
Schema.addField("DB_service_task_product", "value");
Schema.addField("DB_service_task_product", "id_user");
Schema.addField("DB_service_task_product", "date_start");
Schema.addField("DB_service_task_product", "enabled");
Schema.addField("DB_service_task_product", "to_push", "0");
Schema.addField("DB_service_task_product", "[id+enabled]");
Schema.addField("DB_service_task_product", "[id_user+enabled]");
Schema.addField("DB_service_task_product", "[id_user+enabled+id_service_task]");
Schema.addField("DB_service_task_product", "[id_user+enabled+id_service_task+date_start]");
Schema.addRelation("DB_service_task_product", ["id_service_task", "service_task"]);
Schema.addRelation("DB_service_task_product", ["id_product", "product"]);
Schema.addRelation("DB_service_task_product", ["id_user", "user"]);
export interface IDB_service_task_product extends DB_service_task_product { };

// #############################################################################################################################

export class DB_service_task_report_status {
  id?: number;
  idr?: number;
  code: string;
  label: string;
  color: string;
  priority: number;
  enabled: string;
}
Schema.addField("DB_service_task_report_status", "id");
Schema.addField("DB_service_task_report_status", "idr");
Schema.addField("DB_service_task_report_status", "code");
Schema.addField("DB_service_task_report_status", "label");
Schema.addField("DB_service_task_report_status", "color");
Schema.addField("DB_service_task_report_status", "priority");
Schema.addField("DB_service_task_report_status", "enabled");
Schema.addField("DB_service_task_report_status", "[id+enabled]");
Schema.addField("DB_service_task_report_status", "[code+enabled]");
export interface IDB_service_task_report_status extends DB_service_task_report_status { };

// #############################################################################################################################

export class DB_service_task_report {
  id?: number;
  idr?: number;
  code: string;
  id_user: number;
  id_service_task: number;
  id_service_task_report_status: number;
  signature?: string;
  json: string;
  date_create: string;
  date_sent: string;
  date_signed: string;
  html: string;
  enabled: string;
  to_push: string;
  static user = ["id_user", "user"];
  static service_task = ["id_service_task", "service_task"];
  static service_task_report_status = ["id_service_task_report_status", "service_task_report_status"];
}
Schema.addField("DB_service_task_report", "id");
Schema.addField("DB_service_task_report", "idr");
Schema.addField("DB_service_task_report", "code");
Schema.addField("DB_service_task_report", "id_user");
Schema.addField("DB_service_task_report", "id_service_task");
Schema.addField("DB_service_task_report", "id_service_task_report_status");
Schema.addField("DB_service_task_report", "signature");
Schema.addField("DB_service_task_report", "json");
Schema.addField("DB_service_task_report", "date_create");
Schema.addField("DB_service_task_report", "date_sent");
Schema.addField("DB_service_task_report", "date_signed");
Schema.addField("DB_service_task_report", "html");
Schema.addField("DB_service_task_report", "enabled");
Schema.addField("DB_service_task_report", "to_push", "0");
Schema.addField("DB_service_task_report", "[id+enabled]");
Schema.addField("DB_service_task_report", "[idr+enabled]");
Schema.addField("DB_service_task_report", "[id_service_task+enabled]");
Schema.addRelation("DB_service_task_report", ["id_user", "user"]);
Schema.addRelation("DB_service_task_report", ["id_service_task", "service_task"]);
Schema.addRelation("DB_service_task_report", ["id_service_task_report_status", "service_task_report_status"]);
export interface IDB_service_task_report extends DB_service_task_report { };

// #############################################################################################################################

export class DB_service_task_report_mail {
  id?: number;
  idr?: number;
  id_service_task_report: number;
  id_contact: number;
  date_sent: string;
  id_user: number;
  enabled: string;
  to_push: string;
  static user = ["id_user", "user"];
  static contact = ["id_contact", "contact"];
  static service_task_report_report = ["id_service_task_report", "service_task_report"];
}
Schema.addField("DB_service_task_report_mail", "id");
Schema.addField("DB_service_task_report_mail", "idr");
Schema.addField("DB_service_task_report_mail", "id_service_task_report");
Schema.addField("DB_service_task_report_mail", "id_contact");
Schema.addField("DB_service_task_report_mail", "date_sent");
Schema.addField("DB_service_task_report_mail", "id_user");
Schema.addField("DB_service_task_report_mail", "enabled");
Schema.addField("DB_service_task_report_mail", "to_push", "0");
Schema.addField("DB_service_task_report_mail", "[id+enabled]");
Schema.addField("DB_service_task_report_mail", "[idr+enabled]");
Schema.addField("DB_service_task_report_mail", "[id_service_task_report+enabled]");
Schema.addRelation("DB_service_task_report_mail", ["id_service_task_report", "service_task_report"]);
Schema.addRelation("DB_service_task_report_mail", ["id_contact", "contact"]);
Schema.addRelation("DB_service_task_report_mail", ["id_user", "user"]);
export interface IDB_service_task_report_mail extends DB_service_task_report_mail { };

// #############################################################################################################################

export class DB_autodop_verbal_typology {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  color?: string;
  priority: number;
  enabled: string;
}
Schema.addField("DB_autodop_verbal_typology", "id");
Schema.addField("DB_autodop_verbal_typology", "idr");
Schema.addField("DB_autodop_verbal_typology", "code");
Schema.addField("DB_autodop_verbal_typology", "name");
Schema.addField("DB_autodop_verbal_typology", "color");
Schema.addField("DB_autodop_verbal_typology", "priority");
Schema.addField("DB_autodop_verbal_typology", "enabled");
Schema.addField("DB_autodop_verbal_typology", "[id+enabled]");
Schema.addField("DB_autodop_verbal_typology", "[code+enabled]");
export interface IDB_autodop_verbal_typology extends DB_autodop_verbal_typology { };

// #############################################################################################################################

export class DB_autodop_verbal_status {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  color: string;
  priority: number;
  enabled: string;
}
Schema.addField("DB_autodop_verbal_status", "id");
Schema.addField("DB_autodop_verbal_status", "idr");
Schema.addField("DB_autodop_verbal_status", "code");
Schema.addField("DB_autodop_verbal_status", "name");
Schema.addField("DB_autodop_verbal_status", "color");
Schema.addField("DB_autodop_verbal_status", "priority");
Schema.addField("DB_autodop_verbal_status", "enabled");
Schema.addField("DB_autodop_verbal_status", "[id+enabled]");
Schema.addField("DB_autodop_verbal_status", "[code+enabled]");
export interface IDB_autodop_verbal_status extends DB_autodop_verbal_status { };

// #############################################################################################################################

export class DB_autodop_verbal {
  id?: number;
  idr?: number;
  code: string;
  id_user: number;
  id_autodop_verbal_typology: number;
  id_autodop_verbal_status: number;
  id_destination: number;
  id_job: number;
  id_machine: number;
  json: string;
  date_create: string;
  date_sent: string;
  enabled: string;
  to_push: string;
  static user = ["id_user", "user"];
  static autodop_verbal_typology = ["id_autodop_verbal_typology", "autodop_verbal_typology"];
  static autodop_verbal_status = ["id_autodop_verbal_status", "autodop_verbal_status"];
  static destination = ["id_destination", "consumer"];
  static job = ["id_job", "job"];
  static machine = ["id_machine", "machine"];
}
Schema.addField("DB_autodop_verbal", "id");
Schema.addField("DB_autodop_verbal", "idr");
Schema.addField("DB_autodop_verbal", "code");
Schema.addField("DB_autodop_verbal", "id_user");
Schema.addField("DB_autodop_verbal", "id_autodop_verbal_typology");
Schema.addField("DB_autodop_verbal", "id_autodop_verbal_status");
Schema.addField("DB_autodop_verbal", "id_destination");
Schema.addField("DB_autodop_verbal", "id_job");
Schema.addField("DB_autodop_verbal", "id_machine");
Schema.addField("DB_autodop_verbal", "json");
Schema.addField("DB_autodop_verbal", "date_create");
Schema.addField("DB_autodop_verbal", "date_sent");
Schema.addField("DB_autodop_verbal", "enabled");
Schema.addField("DB_autodop_verbal", "to_push", "0");
Schema.addField("DB_autodop_verbal", "[id+enabled]");
Schema.addField("DB_autodop_verbal", "[idr+enabled]");
Schema.addRelation("DB_autodop_verbal", ["id_user", "user"]);
Schema.addRelation("DB_autodop_verbal", ["id_autodop_verbal_typology", "autodop_verbal_typology"]);
Schema.addRelation("DB_autodop_verbal", ["id_autodop_verbal_status", "autodop_verbal_status"]);
Schema.addRelation("DB_autodop_verbal", ["id_destination", "consumer"]);
Schema.addRelation("DB_autodop_verbal", ["id_job", "job"]);
Schema.addRelation("DB_autodop_verbal", ["id_machine", "machine"]);
export interface IDB_autodop_verbal extends DB_autodop_verbal { };

// #############################################################################################################################

export class DB_autodop_verbal_mail {
  id?: number;
  idr?: number;
  id_autodop_verbal: number;
  id_contact: number;
  date_sent: string;
  id_user: number;
  enabled: string;
  to_push: string;
  static user = ["id_user", "user"];
  static contact = ["id_contact", "contact"];
  static autodop_verbal = ["id_autodop_verbal", "autodop_verbal"];
}
Schema.addField("DB_autodop_verbal_mail", "id");
Schema.addField("DB_autodop_verbal_mail", "idr");
Schema.addField("DB_autodop_verbal_mail", "id_autodop_verbal");
Schema.addField("DB_autodop_verbal_mail", "id_contact");
Schema.addField("DB_autodop_verbal_mail", "date_sent");
Schema.addField("DB_autodop_verbal_mail", "id_user");
Schema.addField("DB_autodop_verbal_mail", "enabled");
Schema.addField("DB_autodop_verbal_mail", "to_push", "0");
Schema.addField("DB_autodop_verbal_mail", "[id+enabled]");
Schema.addField("DB_autodop_verbal_mail", "[idr+enabled]");
Schema.addField("DB_autodop_verbal_mail", "[id_autodop_verbal+enabled]");
Schema.addRelation("DB_autodop_verbal_mail", ["id_autodop_verbal", "autodop_verbal"]);
Schema.addRelation("DB_autodop_verbal_mail", ["id_contact", "contact"]);
Schema.addRelation("DB_autodop_verbal_mail", ["id_user", "user"]);
export interface IDB_autodop_verbal_mail extends DB_autodop_verbal_mail { };

// #############################################################################################################################

export class DB_truck {
  id?: number;
  idr?: number;
  code: string;
  name: string;
  date_update: string;
  enabled: string;
  to_push: string;
}
Schema.addField("DB_truck", "id");
Schema.addField("DB_truck", "idr");
Schema.addField("DB_truck", "code");
Schema.addField("DB_truck", "name");
Schema.addField("DB_truck", "date_update");
Schema.addField("DB_truck", "enabled");
Schema.addField("DB_truck", "to_push", "0");
Schema.addField("DB_truck", "[id+enabled]");
Schema.addField("DB_truck", "[id+code]");
export interface IDB_truck extends DB_truck { };

// #############################################################################################################################

export class DB_truck_stock {
  id?: number;
  idr?: number;
  id_truck: number;
  id_product: number;
  qnt: number;
  enabled: string;
  to_push: string;
  static truck = ["id_truck", "truck"];
  static product =["id_product", "product"];
}
Schema.addField("DB_truck_stock", "id");
Schema.addField("DB_truck_stock", "idr");
Schema.addField("DB_truck_stock", "id_truck");
Schema.addField("DB_truck_stock", "id_product");
Schema.addField("DB_truck_stock", "qnt");
Schema.addField("DB_truck_stock", "enabled");
Schema.addField("DB_truck_stock", "to_push", "0");
Schema.addField("DB_truck_stock", "[id+enabled]");
Schema.addField("DB_truck_stock", "[id_truck+id_product]");
Schema.addRelation("DB_truck_stock", ["id_truck", "truck"]);
Schema.addRelation("DB_truck_stock", ["id_product", "product"]);
export interface IDB_truck_stock extends DB_truck_stock { };

// #############################################################################################################################
// #############################################################################################################################
// #############################################################################################################################

export class Idb extends Dexie {
  db_schema: Dexie.Table<DB_db_schema, number>;
  user_group: Dexie.Table<IDB_user_group, number>;
  user: Dexie.Table<IDB_user, number>;
  sync: Dexie.Table<IDB_sync, number>;
  user_sync: Dexie.Table<IDB_user_sync, number>;
  user_setting: Dexie.Table<IDB_user_setting, number>;
  consumer_typology: Dexie.Table<IDB_consumer_typology, number>;
  consumer: Dexie.Table<IDB_consumer, number>;
  job: Dexie.Table<IDB_job, number>;
  job_typology: Dexie.Table<IDB_job_typology, number>;
  job_details: Dexie.Table<IDB_job_details, number>;
  job_details_action: Dexie.Table<IDB_job_details_action, number>;
  service_typology: Dexie.Table<IDB_service_typology, number>;
  service_call: Dexie.Table<IDB_service_call, number>;
  service_call_status: Dexie.Table<IDB_service_call_status, number>;
  service_call_machine: Dexie.Table<IDB_service_call_machine, number>;
  service_call_user: Dexie.Table<IDB_service_call_user, number>;
  service_task: Dexie.Table<IDB_service_task, number>;
  service_operation_typology: Dexie.Table<IDB_service_operation_typology, number>;
  service_operation: Dexie.Table<IDB_service_operation, number>;
  service_operation_machine: Dexie.Table<IDB_service_operation_machine, number>;
  service_extra_typology: Dexie.Table<IDB_service_extra_typology, number>;
  service_extra: Dexie.Table<IDB_service_extra, number>;
  service_task_user: Dexie.Table<IDB_service_task_user, number>;
  service_trip: Dexie.Table<IDB_service_trip, number>;
  contact: Dexie.Table<IDB_contact, number>;
  machine_typology: Dexie.Table<IDB_machine_typology, number>;
  machine: Dexie.Table<IDB_machine, number>;
  product: Dexie.Table<IDB_product, number>;
  service_task_product: Dexie.Table<IDB_service_task_product, number>;
  service_task_report_status: Dexie.Table<IDB_service_task_report_status, number>;
  service_task_report: Dexie.Table<IDB_service_task_report, number>;
  service_task_report_mail: Dexie.Table<IDB_service_task_report_mail, number>;
  autodop_verbal_typology: Dexie.Table<IDB_autodop_verbal_typology, number>;
  autodop_verbal_status: Dexie.Table<IDB_autodop_verbal_status, number>;
  autodop_verbal: Dexie.Table<IDB_autodop_verbal, number>;
  autodop_verbal_mail: Dexie.Table<IDB_autodop_verbal_mail, number>;
  truck: Dexie.Table<IDB_truck, number>;
  truck_stock: Dexie.Table<IDB_truck_stock, number>;

  schemaObj: { [key: string]: string } = {};

  static DB_NAME = environment.database_name;

  constructor(idbService: IdbService) {
    super(Idb.DB_NAME);

    for (let table of Object.keys(Schema.tableList)) {
      this.schemaObj[table] = Schema.tableList[table].join(", ");
    }
    // console.log("");
    // console.warn("TABLES");
    // console.warn(this.schemaObj);
    // console.log("");
    // console.warn("RELATIONS");
    // console.warn(Schema.relationList);
    // console.log("");
    //
    //where
    this.Table.prototype.where = Dexie.override(this.Table.prototype.where, function (originalWhere) {
      return function () {
        var returnValue = null
        //
        if (arguments && arguments.length > 0 && arguments[0]) {
          returnValue = originalWhere.apply(this, arguments);
        }
        else {
          returnValue = this;
        }
        //
        return returnValue;
      }
    });
  }
}
