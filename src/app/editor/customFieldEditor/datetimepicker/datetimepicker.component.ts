import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';

import * as moment from 'moment';

@Component({
  selector: 'app-datetimepicker',
  templateUrl: './datetimepicker.component.html',
  styleUrls: ['./datetimepicker.component.css']
})
export class DatetimepickerComponent implements OnInit {

  @Input() value: string;
  @Input() dateFormat: string;
  @Input() disabled: boolean;
  @Input() showTime: boolean;

  @Output() valueChange = new EventEmitter<string>();

  date: Date; // Date from datepicker
  time: Date; // Date from timepicker

  constructor() { }

  ngOnInit() {
    if (this.value) {
      this.date = moment(this.value, this.dateFormat).toDate();
    }
    if (this.value && this.showTime) {
      this.time = this.date;
    }
  }

  handleDateChange(date: Date) {
    if (this.showTime && this.time == undefined) {
      this.time = this.date;
    }
    this.updateModel();
  };

  updateModel() {
    let changed = this.hasChanged(this.date, this.time, this.dateFormat);

    if (this.date) {
      this.value = this.createValue(this.date, this.time, this.dateFormat);
    } else {
      this.value = undefined;
    }

    if (changed) {
      this.valueChange.emit(this.value);
    }
  }

  createValue(date: Date, time: Date, dateFormat: string): string {
    let mtime = moment(time);
    return moment(date)
      .set('hour', mtime.get('hour'))
      .set('minute', mtime.get('minute'))
      .set('second', mtime.get('second'))
      .format(dateFormat);
  }

  hasChanged(date: Date, time: Date, dateFormat: string): boolean {
    if (this.value && !date) {
      return true;
    }
    if (!this.value && date) {
      return true;
    }
    if (date) {
      return this.createValue(date, time, dateFormat) !== this.value;
    }
    return false;
  }

}
