import { Component, OnInit, Output, EventEmitter } from '@angular/core';

import { DBObjectClass } from '../../../models/dbobject-class';
import { DBObject } from '../../../models/dbobject';

@Component({
  selector: 'app-list-table',
  templateUrl: './list-table.component.html',
  styleUrls: ['./list-table.component.css']
})
export class ListTableComponent implements OnInit {

  private listTable: DBObjectClass;
  private allowedValues: Array<AllowedValue>;
  selected = true;
  resolve : () => void;
  @Output() valueChange = new EventEmitter<void>();

  constructor() { }

  ngOnInit() {
  }

  initEditor(listTabe: DBObjectClass) : Promise<any> {
    this.listTable = listTabe;
    this.allowedValues = JSON.parse(JSON.stringify(this.listTable.allowedValues));
    this.allowedValues.forEach(v => {
      v.selected = !!this.listTable.childObjects.find(c => c.id === v.id);
    });
    return new Promise(resolve => {
      this.resolve = resolve;
    });
  }

  handleInstanceClicked(instance: AllowedValue){
    if(instance.selected){
      let idx = this.listTable.childObjects.findIndex(c => c.id === instance.id);
      this.listTable.childObjects.splice(idx, 1);
      instance.selected = false;

    } else {
      this.listTable.childObjects.push(instance);
      instance.selected = true;
    }
    this.valueChange.emit();
  }

  handleClose() {
    this.resolve();
  }
}

class AllowedValue extends DBObject {
  selected: boolean;
}
