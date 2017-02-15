import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.css']
})
export class PriceComponent implements OnInit {

  @Input() value: number;
  @Input() disabled: boolean;
  price: string;

  @Output() valueChange = new EventEmitter<number>();

  constructor() { }

  ngOnInit() {
    this.price = this.value != null ? (this.value / 100).toString() : null;
  }

  handlePriceChange(formattedPrice = '') {
    this.value = 100 * Number.parseFloat(formattedPrice.replace('$', '').replace(',', ''));
    if (!Number.isNaN(this.value)) {
      this.value = Math.round(this.value);
    }
    this.valueChange.emit(this.value);
  }

}
