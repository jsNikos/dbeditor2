import {
  Component, OnInit, Input, Output, EventEmitter, AfterViewInit, ElementRef, ViewChild
} from '@angular/core';

import { DBObjectClass } from '../models/dbobject-class';
import { DBObject } from '../models/dbobject';

declare var $: any;
(window as any).$ = $;
import 'datatables.net';
import 'datatables.net-bs';

@Component({
  selector: 'app-instances',
  templateUrl: './instances.component.html',
  styleUrls: ['./instances.component.css']
})
export class InstancesComponent implements OnInit, AfterViewInit {

  @Input() selectedType: DBObjectClass;
  @Input() selectedInstance: DBObject;
  @Input() modelInited: boolean;

  @Output() onSelectInstance: EventEmitter<DBObject>;

  @ViewChild('instanceTable') instanceTableEl: ElementRef;

  constructor() {
    this.onSelectInstance = new EventEmitter();
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    if (!this.instanceTableEl) {
      return;
    }

    $(this.instanceTableEl.nativeElement).DataTable({
      fixedHeader: true,
      scrollY: 600,
      paging: false,
      info: false,
      search: {
        caseInsensitive: true
      }
    });
  }

  handleSelectInstance(instance: DBObject) {
    this.onSelectInstance.emit(instance);
  }

}
