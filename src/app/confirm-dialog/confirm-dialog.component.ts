import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { ModalDirective } from 'ng2-bootstrap';

import { ConfirmDialogProperties } from '../models/confirm-dialog-properties';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {

  @ViewChild('confirmDialog') confirmDialog: ModalDirective;

  @Input() title: string;
  @Input() body: string;
  @Input() confirmLabel: string;
  private resolve: () => void;

  constructor() { }

  ngOnInit() {
  }

  setProperties(props: ConfirmDialogProperties): ConfirmDialogComponent {
    this.title = props.title;
    this.body = props.body;
    this.confirmLabel = props.confirmLabel;
    return this;
  }

  show(): Promise<any> {
    this.confirmDialog.show();
    return new Promise<any>(resolve => {
      this.resolve = resolve;
    });
  }

  handleConfirm() {
    this.resolve();
    this.confirmDialog.hide();
  }

  handleCancel() {
    this.confirmDialog.hide();
  }

}
