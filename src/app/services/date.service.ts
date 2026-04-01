import { Injectable } from '@angular/core';
import { formatDate } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class DateService {
  constructor() { }


  date_getByFormat(date,format) {
    return formatDate(date, format, "en-EN");
  }

  date_getDate(date) {
    return formatDate(date, "yyyy-MM-dd", "en-EN");
  }

  date_getDateTime(date) {
    return formatDate(date, "yyyy-MM-dd HH:mm:ss", "en-EN");
  }

  date_getDateTimeMs(date) {
    return formatDate(date, "yyyy-MM-dd HH:mm:ss.SSS", "en-EN");
  }

  date_getTime(date) {
    return formatDate(date, "HH:mm:ss", "en-EN");
  }

  date_getTimeHourMinute(date) {
    return formatDate(date, "HH:mm", "en-EN");
  }

  date_getTimeMs(date) {
    return formatDate(date, "HH:mm:ss.SSS", "en-EN");
  }

  date_getHourFirstInDay() {
    return "00:00:00";
  }

  date_getHourLastInDay() {
    return "23:59:59";
  }

  date_getDayRange(date) {
    let date_dayRange = [null, null];
    //
    if (date) {
      let date_yyyyMMdd = this.date_getDate(new Date(date));
      date_dayRange = [date_yyyyMMdd + " " + this.date_getHourFirstInDay(), date_yyyyMMdd + " " + this.date_getHourLastInDay()];
    }
    //
    return date_dayRange;
  }
}
