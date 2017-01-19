import { Injectable, EventEmitter } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/operator/toPromise';

import { DBObject } from '../typings/dbobject';
import { DBObjectClass } from '../typings/dbobject-class';
import { MenuItem } from '../typings/menu-item';

@Injectable()
export class EditorService {
  // url-state properties
  MANAGER_CLASS_NAME = 'managerClassName';
  INSTANCE_ID = 'instanceId';

  private loadingEvent: EventEmitter<boolean>;
  private errorEvent: EventEmitter<any>;

  constructor(private http: Http) {
    this.loadingEvent = new EventEmitter();
    this.errorEvent = new EventEmitter();
  }

  findLogo(): Promise<any> {
    return this.http.get('/ws/dbeditor/api/findLogo').toPromise()
      .then(resp => resp.json().logo);
  }

  findMenu(): Promise<Array<MenuItem>> {
    return this.http.get('/ws/dbeditor/api/menu').toPromise()
      .then(resp => resp.json());
  }

  handleError(error: any) {
    this.errorEvent.emit(error);
  }

  subscribeToErrorEvent(handler: (any) => void) {
    this.errorEvent.subscribe(handler);
  }

  subscribeToLoadingEvent(handleLoading: (boolean) => void) {
    this.loadingEvent.subscribe(handleLoading);
  }

  showLoading(): EditorService {
    this.loadingEvent.emit(true);
    return this;
  }

  hideLoading(): EditorService {
    this.loadingEvent.emit(false);
    return this;
  }

  // only for root-dbObjects
  updateInstance(instance: DBObject, classType: string): Promise<DBObject> {
    let params = new URLSearchParams();
    params.set('id', instance.id.toString());
    params.set('classType', classType);

    return this.http.put('/ws/dbeditor/api/', instance, { search: params })
      .toPromise().then(resp => resp.json());
  }

  // only for root-dbObjects
  insertInstance(instance: DBObject, classType: string): Promise<DBObject> {
    let params = new URLSearchParams();
    params.set('classType', classType);

    return this.http.post('/ws/dbeditor/api/', instance, { search: params })
      .toPromise().then(resp => resp.json());
  }

  // only for root-dbObjects
  deleteInstance(instance: DBObject, classType: string): Promise<any> {
    let params = new URLSearchParams();
    params.set('id', instance.id.toString());
    params.set('classType', classType);

    return this.http.delete('/ws/dbeditor/api/', { search: params })
      .toPromise();
  };

  fetchEmptyInstance(classType: string, managedClassType: string): Promise<DBObject> {
    let params = new URLSearchParams();
    params.set('managedClassType', managedClassType);
    params.set('classType', classType);

    return this.http.get('/ws/dbeditor/api/empty', { search: params }).toPromise()
      .then(resp => resp.json());
  }

  findDBObjectClass(managerClassName: string): Promise<DBObjectClass> {
    let params = new URLSearchParams();
    params.set('managerClassName', managerClassName);

    return this.http.get('/ws/dbeditor/api/findDBObjectClass', { search: params }).toPromise()
      .then(resp => resp.json());
  };

}
