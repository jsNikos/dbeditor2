import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { Image } from '../../typings/image';
import { DBField } from '../../../typings/dbfield';

interface Item {
  id: string,
  text: string
}

@Component({
  selector: 'app-image-chooser',
  templateUrl: './image-chooser.component.html',
  styleUrls: ['./image-chooser.component.css']
})
export class ImageChooserComponent implements OnInit {

  @Input() value: Image;
  @Input() field: DBField<Image>;

  @Output() valueChange = new EventEmitter<Image>();

  items: Array<Item> = new Array();
  activeItem: Array<Item>;

  constructor() { }

  ngOnInit() {
    this.items = this.field.allowedValues.map(allowedValue => {
      return {
        id: allowedValue.id,
        text: `<img src="${allowedValue.path}" class="dbimage"/><span>${allowedValue.groupName} - ${allowedValue.name}</span>`
      };
    });

    if (this.value) {
      this.activeItem = [this.items.find(item => item.id === this.value.id)];
    }
  }

  handleSelect(item: Item) {
    this.value =
      this.field.allowedValues.find(image => {
        return image.id === item.id;
      });
    this.valueChange.emit(this.value);
  }

  handleRemove(item: Item) {
    this.value = undefined;
    this.valueChange.emit(this.value);
  }

}
