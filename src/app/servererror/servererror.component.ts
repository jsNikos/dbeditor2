import { Component, OnInit, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ModalDirective } from 'ng2-bootstrap';
import * as jquery from 'jquery';

import { EditorService } from '../services/editor.service';
import { Error } from '../models/error';

@Component({
  selector: 'app-servererror',
  templateUrl: './servererror.component.html',
  styleUrls: ['./servererror.component.css']
})
export class ServererrorComponent implements OnInit {

  @ViewChild('errorModal') errorModal: ModalDirective;
  error: Error = new Error();

  constructor(private editorService: EditorService, private location: Location) { }

  ngOnInit() {
    this.editorService.subscribeToErrorEvent(error => this.handleError(error));
  }

  handleError(error: any) {
    this.editorService.hideLoading();
    console.log(error);
    switch (error.status) {
      case 400: this.handleValidationError(error);
        break;
      case 401:
        this.handleNotAuthenticated();
        break;
      case 403:
        this.handleNotAuthorized();
      default:
        this.handleInternalError();
        break;
    }
    this.errorModal.show();
  }

  handleValidationError(error: any) {
    this.error = {
      title: 'Validation Error',
      msg: JSON.parse(error._body).errors,
      resolve: () => {
        this.errorModal.hide();
      }
    };
  }

  handleNotAuthenticated() {
    this.error = {
      title: 'Your are not logged in',
      msg: 'Please press OK to log in.',
      resolve: () => {
        document.location.replace('/ws/dbeditor/login/?' + jQuery.param({
          targetURI: location.pathname + location.search
        }));
        this.errorModal.hide();
      }
    };
  }

  handleNotAuthorized() {
    this.error = {
      title: 'Not Authorized',
      msg: 'You have no permissions to see these data.',
      resolve: () => this.errorModal.hide()
    };
  }

  handleInternalError() {
    this.error = {
      title: 'Internal Software Error',
      msg: 'The system has encountered an unexpected error processing your last request.',
      resolve: () => this.errorModal.hide()
    };
  }

  handleOk() {
    this.errorModal.hide();
  }
}
