import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as moment from 'moment';

import { TimeOfDay } from '../../typings/time-of-day';

@Component({
  selector: 'app-timeofday',
  templateUrl: './timeofday.component.html',
  styleUrls: ['./timeofday.component.css']
})
export class TimeofdayComponent implements OnInit {

  @Input() value: TimeOfDay;
  @Input() disabled: boolean;
  @Output() valueChange = new EventEmitter<TimeOfDay>();

  selectedDate: Date;

  constructor() { }

  ngOnInit() {
    if (this.value) {
      var date = new Date();
      date.setMinutes(this.value.minutes);
      date.setHours(this.value.hours);
      this.selectedDate = date;
    }
  }

  handleChange(selectedDate: Date) {
    let changed = this.hasChanged(selectedDate);

    this.value.minutes = selectedDate.getMinutes();
    this.value.hours = selectedDate.getHours();
    this.value.displayValue = moment(selectedDate).format('h:mm a').toLowerCase();

    if (changed) {
      this.valueChange.emit(this.value);
    }
  }

  hasChanged(selectedDate: Date): boolean {
    if (!this.value && selectedDate) {
      return true;
    }
    if (this.value.minutes !== selectedDate.getMinutes()
      || this.value.hours !== selectedDate.getHours()) {
      return true;
    }
    return false;
  }

}
