import Dexie from 'dexie';

import { Injectable } from '@angular/core';

import * as DB from '../idb/4service-pwa.idb';

@Injectable({
  providedIn: 'root'
})

export class IdbService {
  idb: DB.Idb

  constructor() { }

  async connect() {
    this.idb = new DB.Idb(this);
    //
    await this.upgrade();
    //
    for (let schemaObjK in this.idb.schemaObj) {
      this.idb[schemaObjK] = this.idb.table(schemaObjK);
    }
  }

  async upgrade() {
    let dbInstalled = await new Dexie(DB.Idb.DB_NAME).open().then((db) => { return db; }).catch(() => { return null; });
    let dbSchemaInstalled = null;
    let dbInstalledVersion = dbInstalled && dbInstalled.verno ? dbInstalled.verno : 0;
    let dbToInstallSchemaJson = JSON.stringify(this.idb.schemaObj);
    //
    let dbInstalledSchemaJson = "";
    if (dbInstalledVersion > 0) {
      dbSchemaInstalled = await dbInstalled.table("db_schema").get(1);
      //
      dbInstalled.close();
      dbInstalledSchemaJson = dbSchemaInstalled.schema;
      //
      this.idb.version(dbInstalledVersion).stores(JSON.parse(dbInstalledSchemaJson));
    }
    //
    if (dbToInstallSchemaJson != dbInstalledSchemaJson) {
      //
      //Installa la nuova versione
      this.idb.version(dbInstalledVersion + 1).stores(this.idb.schemaObj);
      //
      //Gestione dei valori di default
      let dbInstalledObj = this.getSchemaObjFromJson(dbInstalledSchemaJson);
      let dbToInstallObj = this.getSchemaObjFromJson(dbToInstallSchemaJson);
      //
      for (let [toInstall_table, to_install_fieldList] of Object.entries<string[]>(dbToInstallObj)) {
        for (let fieldK in to_install_fieldList) {
          let field = to_install_fieldList[fieldK];
          //
          if (!dbInstalledObj[toInstall_table] || !dbInstalledObj[toInstall_table].includes(field)) {
            //console.log("Nuovo campo: " + toInstall_table + "." + field);
            //
            let fieldValueDef = DB.Schema.defaultObj && DB.Schema.defaultObj[toInstall_table] && DB.Schema.defaultObj[toInstall_table][field] ? DB.Schema.defaultObj[toInstall_table][field] : null;
            //console.log("Default: " + fieldValueDef);
            //
            let rowList: any[] = await this.getItems(toInstall_table);
            for (let rowK in rowList) {
              let row = rowList[rowK];
              //
              let inupArr = {
                id: row.id
              }
              inupArr[field] = fieldValueDef;
              //
              await this.inup(toInstall_table, inupArr, ["id"]);
            }
          }
        }
      }
      //
      await this.inup<DB.IDB_db_schema>("db_schema", { id: 1, schema: dbToInstallSchemaJson }, ["id"]);
    }
  }

  getSchemaObjFromJson(dbSchemaJson) {
    let dbSchemaObj = {};
    //
    if (dbSchemaJson == null || dbSchemaJson.trim() == "") {
      return dbSchemaObj;
    }
    //
    for (let [table, schemaStr] of Object.entries<string>(JSON.parse(dbSchemaJson))) {
      dbSchemaObj[table] = [];
      //
      let schemaList: string[] = schemaStr.split(",");
      for (let schemaK = 0; schemaK < schemaList.length; schemaK++) {
        let schemaField = schemaList[schemaK].trim();
        //
        if (schemaField.indexOf("+") < 0 && schemaField.indexOf("&") < 0 && schemaField.indexOf("[") < 0) {
          dbSchemaObj[table].push(schemaField);
        }
      }
    }
    //
    return dbSchemaObj;
  }

  async join(rowList: any[], joinList: DB.I_Join[]) {
    //
    // OLD JOIN
    //
    // for (let rowK in rowList) {
    //   for (let joinK in joinList) {
    //     let joinV = joinList[joinK];
    //     if (!rowList[rowK][joinV.field]) {
    //       if (!joinV.joinType || joinV.joinType != "LEFT") {
    //         let error = `INNER JOIN - Value "${rowList[rowK][joinV.field]}" on table "${joinV.table}" not found`;
    //         console.error(error, rowList, joinList);
    //         throw new Error(error);
    //       }
    //     }
    //     else {
    //       rowList[rowK][joinV.alias ?? joinV.table] = await this.idb.table(joinV.table).get(rowList[rowK][joinV.field]).then(async rowRel => {
    //         if (joinV.joinList) {
    //           let rowRelList = await this.join([rowRel], joinV.joinList);
    //           return rowRelList[0] ?? null;
    //         }
    //         else {
    //           return rowRel;
    //         }
    //       });
    //     }
    //   }
    // }
    let tableDataObj = {};
    //
    let tableList = this.getTableListFromJoinList(joinList, 0);
    //
    for (let tableK in tableList) {
      let tableV = tableList[tableK];
      tableDataObj[tableV] = await this.getItems(tableV);
    }
    //
    return this.joinRowListWithJoinTableDataList(rowList, joinList, tableDataObj);
  }

  getTableListFromJoinList(joinList: DB.I_Join[], deep: number) {
    let tableList = [];
    //
    for (let joinK in joinList) {
      let joinV = joinList[joinK];
      //
      tableList.push(joinV["table"]);
      //
      if (joinV.joinList) {
        tableList = tableList.concat(this.getTableListFromJoinList(joinV.joinList, deep + 1));
      }
    }
    //
    if (deep == 0) {
      tableList = tableList.filter(function (v, k) {
        return tableList.indexOf(v) == k;
      })
    }
    //
    return tableList;
  }

  joinRowListWithJoinTableDataList(rowList: any[], joinList: DB.I_Join[], tableDataObj: {}) {
    for (let rowK in rowList) {
      if (rowList[rowK]) {
        let row = rowList[rowK];
        //
        for (let joinK in joinList) {
          let joinV = joinList[joinK];
          //
          if (!row[joinV["field"]]) {
            if (!joinV.joinType || joinV.joinType != "LEFT") {
              let error = `INNER JOIN - Value "${rowList[rowK][joinV.field]}" on table "${joinV.table}" not found`;
              console.error(error, rowList, joinList);
              throw new Error(error);
            }
          }
          else {
            row[joinV["alias"] ?? joinV["table"]] = tableDataObj[joinV["table"]].find(
              table_dest_row => {
                return (joinV["table_field"] ? table_dest_row[joinV["table_field"]] : table_dest_row.id) === row[joinV["field"]];
              }
            );
          }
          //
          if (joinV.joinList) {
            this.joinRowListWithJoinTableDataList([row[joinV["alias"] ?? joinV["table"]]], joinV.joinList, tableDataObj);
          }
        }
      }
    }
    //
    return rowList;
  }

  async where(table: Dexie.Table<any, number>, whereObj: {}) {
    let tablePromise: Dexie.Promise<any[]>;
    //
    if (whereObj ?? null) {
      tablePromise = table.where(whereObj).toArray();
    }
    else {
      tablePromise = table.toArray();
    }
    //
    return tablePromise;
  }

  async getItems<T>(table: string, valueObj?, orderByObj?: DB.I_OrderBy[]): Promise<T[]> {
    let valueObjFixed = await this.fixValueObj(valueObj);
    let dexieTable = this.idb.table<T>(table);
    //
    //where
    let dexieCollection: Dexie.Collection<T, any> = null;
    if (valueObjFixed) {
      dexieCollection = dexieTable.where(valueObjFixed as {});
    }
    else {
      dexieCollection = dexieTable.toCollection();
    }
    //
    //order by
    let dexiePromise: Dexie.Promise<T[]> = null;
    if (orderByObj && orderByObj.length > 0) {
      for (let i = 0; i < orderByObj.length; i++) {
        dexiePromise = dexieCollection.sortBy(orderByObj[i].field);
        //
        if (orderByObj[i].direction == "DESC") {
          dexiePromise = dexiePromise.then(dataList => {
            return dataList.reverse();
          });
        }
      }
    }
    else {
      dexiePromise = dexieCollection.toArray();
    }
    //
    //return
    return dexiePromise;
  }

  async getItem<T>(table: string, valueObj): Promise<T> {
    let valueObjFixed = await this.fixValueObj(valueObj);
    //
    if (!valueObjFixed) {
      let error = `"valueObj" not found for table "${table}"`;
      console.error(error, valueObjFixed);
      throw new Error(error);
    }
    //
    return this.idb.table(table).where(valueObjFixed as {}).first();
  }

  async inup<T>(table: string, valueObj, keyList?: string[]): Promise<T> {
    let valueObjFixed = await this.fixValueObj(valueObj);
    //
    let searchObj = {};
    //
    for (let keyK in keyList) {
      let keyV = keyList[keyK];
      if (!valueObjFixed[keyV] || valueObjFixed[keyV] == "") {
        let error = `Value of key "${keyV}" missing or empty`;
        console.error(error);
        throw new Error(error);
      }
      searchObj[keyV] = valueObjFixed[keyV];
    }
    //
    return this.getItem<T>(table, searchObj)
      //update
      .then(row => {
        return this.idb.table<T>(table).update(row["id"], valueObjFixed).then(() => {
          return this.getItem<T>(table, { id: row["id"] });
        });
        //
      })
      //insert
      .catch(() => {
        valueObjFixed = this.addDefaultValues(table, valueObjFixed);
        //
        return this.idb.table<T>(table).put(valueObjFixed).then((id) => {
          return this.getItem<T>(table, { id: id });
        });
      })
  }

  async fixValueObj(valueObj?) {
    if (valueObj && Object.keys(valueObj).length > 0) {
      let valueObjFixed = {};
      //
      for (let key in valueObj) {
        let valueFixed = valueObj[key];
        //
        if (key == "id" || key == "idr" || key.includes("id_") || key.includes("idr_")) {
          valueFixed = parseInt(valueFixed);
        }
        //
        valueObjFixed[key] = valueFixed;
      }
      //
      return valueObjFixed;
    }
    //
    return valueObj ?? null;
  }

  addDefaultValues(table: string, valueObj: {}) {
    return valueObj;
    let defaultTableFieldList = DB.Schema.defaultObj[table];
    //
    for (let defaultTableFieldK in defaultTableFieldList) {
      let defaultTableField = defaultTableFieldList[defaultTableFieldK];
      //
      valueObj[defaultTableFieldK] = valueObj[defaultTableFieldK] ?? defaultTableField;
    }
    //
    return valueObj;
  }

  async delete(table: string, id: number) {
    this.idb.table(table).delete(id);
  }

  async clear(table: string) {
    await this.idb.table(table).clear();
  }


  getIndexFromList(indexList) {
    let indexStr = "[" + indexList.join("+") + "]";
    //
    return indexStr;
  }

  async deleteDatabase() {
    await this.idb.delete();
  }
}
