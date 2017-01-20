import { Injectable, EventEmitter } from '@angular/core';
import { Http, URLSearchParams } from '@angular/http';
import { Location } from '@angular/common';
import { Title } from '@angular/platform-browser';
import 'rxjs/add/operator/toPromise';

import { DBObject } from '../typings/dbobject';
import { DBObjectClass } from '../typings/dbobject-class';
import { MenuItem } from '../typings/menu-item';

@Injectable()
export class EditorService {
  // url-state properties
  readonly MANAGER_CLASS_NAME = 'managerClassName';
  readonly INSTANCE_ID = 'instanceId';

  private loadingEvent: EventEmitter<boolean>;
  private errorEvent: EventEmitter<any>;

  constructor(private http: Http, private location: Location, private title: Title) {
    this.loadingEvent = new EventEmitter();
    this.errorEvent = new EventEmitter();
  }

  updateTitle(menuItem: MenuItem) {
    let titleStrg = 'Editor';
    if (menuItem && menuItem.isTable) {
      titleStrg = menuItem.displayName + ' ' + titleStrg;
    }
    this.title.setTitle(titleStrg);
  }

  updateUrlState(name: string, value: string) {
    let url = new URL(location.toString());
    let searchParams = new URLSearchParams(url.search.replace('\?', ''));
    // URLSearchParams has a bug: it provokes to encode values twice
    searchParams.paramsMap.forEach((val, key) => {
      searchParams.set(key, decodeURIComponent(searchParams.get(key)));
    });
    searchParams.set(name, value);
    history.replaceState('', '', '?' + searchParams.toString());
  }

  findFromUrlState(name: string): string {
    let searchParams = new URLSearchParams(location.search.replace('\?', ''));
    return decodeURIComponent(searchParams.get(name));
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
