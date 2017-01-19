import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { DBObjectClass } from '../typings/dbobject-class';
import { DBObject } from '../typings/dbobject';

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css']
})
export class InstancesComponent implements OnInit {

  @Input() selectedType: DBObjectClass;
  @Input() selectedInstance: DBObject;
  @Input() modelInited: boolean;

  @Output() onSelectInstance: EventEmitter<DBObject>;

  constructor() {
    this.onSelectInstance = new EventEmitter();
  }

  ngOnInit() {
  }

  handleSelectInstance(instance: DBObject) {
    this.onSelectInstance.emit(instance);
  }

}
