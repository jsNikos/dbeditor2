import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import * as _ from 'lodash';

import { DBObjectClass } from '../models/dbobject-class';
import { DBObject } from '../models/dbobject';
import { DBField } from '../models/dbfield';
import { EditStatus } from '../models/edit-status.enum';
import { BreadcrumpNode } from '../models/breadcrump-node';
import { MenuItem } from '../models/menu-item';
import { EditorService } from '../services/editor.service';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ListTableComponent } from './customFieldEditor/list-table/list-table.component';
import { InstancesComponent } from '../instances/instances.component';


@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit {
  @ViewChild('confirmDelete') confirmDelete: ConfirmDialogComponent;
  @ViewChild(ListTableComponent) listTableComponent: ListTableComponent;
  @ViewChild(InstancesComponent) instancesComponent: InstancesComponent;

  @Input() selectedManagedTable: DBObjectClass;
  @Input() menuItem: MenuItem;

  @Output() onFlagWithChanged: EventEmitter<DBObjectClass>;
  @Output() onRefreshChangedFlags: EventEmitter<DBObjectClass>;

  editStatusEnum = EditStatus;
  selectedType: DBObjectClass;
  selectedInstance: DBObject;
  editStatus: EditStatus;
  breadcrumpNodes: Array<BreadcrumpNode> = [];
  modelInited: boolean;
  showListTableEditor: boolean;
  showInstances = true;
  showFieldEditors = true;
  showButtons = true;
  showNewButton = true;

  constructor(private editorService: EditorService) {
    this.onFlagWithChanged = new EventEmitter();
    this.onRefreshChangedFlags = new EventEmitter();
  }

  ngOnInit() {
    this.selectedType = this.selectedManagedTable;
    _.forEach(this.selectedType.childObjects, (childObject) => this.ensureOldInstanceProperty(childObject));
    this.breadcrumpNodes.push({
      type: this.selectedManagedTable,
      instance: null
    });
    this.modelInited = true;
    setTimeout(() => this.restoreStateFromUrl(), 0);
  }

  handleFieldValueChange(field: DBField<any>) {
    let dependentFields = this.selectedInstance.fields.filter(f => f.parentFieldName === field.name);
    Promise.resolve()
      .then(() => {
        if (dependentFields.length > 0) {
          this.editorService.showLoading();
          return this.updateAllowedValues(dependentFields)
            .then(() => this.editorService.hideLoading());
        }
      })
      .then(() => {
        this.selectedInstance._changed = true;
        this.flagParentsWithChanged(this.selectedInstance);
        this.editStatus = EditStatus.changed;
      })
      .catch(err => this.editorService.handleError(err));
  }

  updateAllowedValues(dependentFields: Array<DBField<any>>): Promise<void> {
    return this.editorService.refreshAllowedValues(this.breadcrumpNodes[0].instance, this.selectedManagedTable.classType)
      .then(resp => {
        let targetInstance = this.findInstanceByPath(this.breadcrumpNodes, resp);
        if (!targetInstance) {
          console.error('Cannot find selected instance in response');
          return;
        }

        dependentFields.forEach(dependentField => {
          let targetField = targetInstance.fields.find(f => f.name === dependentField.name);
          if (!targetField) {
            console.error(`Cannot find field ${dependentField.name} in responded instance`);
            return;
          }
          dependentField.value = null;
          dependentField.allowedValues = targetField.allowedValues;
        });
      });
  }

  findInstanceByPath(path: Array<BreadcrumpNode>, search: DBObject): DBObject {
    let targetInstance = search;
    path.forEach((node, idx) => {
      if (idx > 0) {
        let subtable = targetInstance.subTables.find(s => s.tableName === node.type.tableName);
        targetInstance = subtable.childObjects.find(i => i.id === node.instance.id);
      }
    });
    return targetInstance;
  }

  // sends the instance's root-dbObject for update/insert
  // note: the server response with a root-dbOject
  // sets this root-object into the editor as selectedInstance
  handleSave(breadcrumpRoot: BreadcrumpNode): void {
    this.save(breadcrumpRoot)
      .then(() => this.rerenderInstances())
      .catch(err => this.editorService.handleError(err));
  }

  save(breadcrumpRoot: BreadcrumpNode): Promise<DBObject> {
    let promise: Promise<DBObject>;
    let currId = breadcrumpRoot.instance.id;
    let isNew = (currId == undefined);
    this.editorService.showLoading();

    if (isNew) {
      promise = this.editorService.insertInstance(breadcrumpRoot.instance, this.selectedManagedTable.classType);
    } else {
      promise = this.editorService.updateInstance(breadcrumpRoot.instance, this.selectedManagedTable.classType);
    }

    promise
      .then((resp) => {
        this.editStatus = this.editStatusEnum.saved;

        this.breadcrumpNodes.splice(1, this.breadcrumpNodes.length - 1);
        if (isNew) {
          _.remove(this.selectedManagedTable.childObjects, breadcrumpRoot.instance);
          this.selectedManagedTable.childObjects.push(resp);
        } else {
          let instanceIdx =
            _.findIndex(this.selectedManagedTable.childObjects, {
              id: currId
            });
          this.selectedManagedTable.childObjects[instanceIdx] = resp;
        }

        this.selectedType = this.selectedManagedTable;
        this.selectedInstance = resp;

        breadcrumpRoot.instance = resp;
        this.ensureOldInstanceProperty(breadcrumpRoot.instance);
        breadcrumpRoot.type._changed = false;
        this.onRefreshChangedFlags.emit(this.selectedManagedTable);
      })
      .then(() => this.editorService.hideLoading());

    return promise;
  }

  handleCancel() {
    let leaf = _.last(this.breadcrumpNodes);
    let instance = leaf.instance;

    let isNew = instance.id == undefined;
    if (isNew) {
      _.remove(leaf.type.childObjects, instance);
      leaf.instance = undefined;
      this.selectedInstance = undefined;

    } else {
      let oldInstance = JSON.parse(JSON.stringify(instance._oldInstance));
      _.assign(instance, oldInstance);
      this.ensureOldInstanceProperty(instance);
    }

    instance._changed = false;
    this.refreshChangedFlags(leaf);
    this.editStatus = this.editStatusEnum.canceled;

    this.rerenderInstances();
  }

  rerenderInstances(): Promise<any> {
    this.showInstances = false;
    return this.timeout().then(() => this.showInstances = true);
  }

  handleDelete(instance: DBObject) {
    this.confirmDelete.show()
      .then(() => this.deleteInstance(instance))
      .then(() => this.rerenderInstances())
      .catch(err => this.editorService.handleError(err));
  }

  // requests empty-instance, adds to type.childObjects and sets this
  // into editor as selectedInstance.
  handleNew(selectedType: DBObjectClass) {
    this.editorService
      .showLoading()
      .fetchEmptyInstance(selectedType.classType, this.selectedManagedTable.classType)
      .then((resp) => {
        this.selectedInstance = resp;
        this.selectedInstance._changed = true;
        let isSubTable = this.breadcrumpNodes.length > 1;
        let leaf = _.last(this.breadcrumpNodes);
        leaf.type.childObjects.push(this.selectedInstance);

        leaf.instance = this.selectedInstance;
        this.flagParentsWithChanged(this.selectedInstance);
      })
      .then(() => this.editorService.hideLoading())
      .catch(err => this.editorService.handleError(err));
  }

  handleSelectSubtable(subTable: DBObjectClass) {
    if (subTable.dbListTable) {
      // no type-switch, only allow to pick values allowed-values
      this.showListTableEditor = true;
      this.showFieldEditors = false;
      this.showInstances = false;
      this.showButtons = false;

      this.timeout()
        .then(() => {
          return this.listTableComponent.initEditor(subTable);
        })
        .then(() => {
          this.showListTableEditor = false;
          this.showFieldEditors = true;
          this.showInstances = true;
          this.showButtons = true;
        });

    } else {
      this.showInstances = false; // ensure re-create of instances-component

      this.timeout()
        .then(() => {
          this.showInstances = true;
          this.selectedType = subTable;
          this.selectedInstance = undefined;
          this.editStatus = undefined;
          this.breadcrumpNodes.push({
            type: subTable,
            instance: undefined
          });
        });
    }

    this.controlNewButtonForSubtable(subTable);
  }

  controlNewButtonForSubtable(subTable: DBObjectClass) {
    if (subTable.oneToOneTable && subTable.childObjects.length > 0) {
      this.showNewButton = false;
    } else {
      this.showNewButton = true;
    }
  }

  timeout(): Promise<any> {
    return new Promise(resolve => {
      setTimeout(resolve);
    });
  }

  handleSelectInstance(instance: DBObject) {
    this.selectedInstance = instance;
    let leaf = _.last(this.breadcrumpNodes);
    leaf.instance = instance;
    let isRootInstance = (this.breadcrumpNodes.length === 1);
    if (isRootInstance) {
      this.editorService.updateUrlState(this.editorService.INSTANCE_ID, instance.id);
    }
  }

  handleBreadcrumb($event: any, breadcrumpNode: BreadcrumpNode) {
    let nodeIdx = _.indexOf(this.breadcrumpNodes, breadcrumpNode);
    _.remove(this.breadcrumpNodes, (node, idx) => {
      return idx > nodeIdx;
    });
    this.selectedType = breadcrumpNode.type;
    this.selectedInstance = breadcrumpNode.instance;
    this.rerenderInstances();
    $event.preventDefault();
  }

  // for subtable deletions, triggers an update on the root-dbObject.
  // for root-dbObjects calls the delete server-endpoint.
  deleteInstance(instance: DBObject): Promise<any> {
    let isSubTable = this.breadcrumpNodes.length > 1;
    let leaf = _.last(this.breadcrumpNodes);
    let promise: Promise<any>;

    if (isSubTable) {
      let instanceIdx = _.findIndex(leaf.type.childObjects, {
        id: instance.id
      });
      leaf.type.childObjects.splice(instanceIdx, 1);
      promise = this.save(this.breadcrumpNodes[0])
        .then(() => this.controlNewButtonForSubtable(leaf.type))
        .catch(err => this.editorService.handleError(err));

    } else {
      this.editorService.showLoading();
      promise = this.editorService.deleteInstance(instance, this.selectedManagedTable.classType)
        .then((resp) => {
          _.remove(this.selectedManagedTable.childObjects, {
            id: instance.id
          });
          leaf.instance = undefined;
          this.selectedInstance = undefined;
        })
        .then(() => this.editorService.hideLoading())
        .catch(err => this.editorService.handleError(err));
    }

    return promise;
  }

  refreshChangedFlags(breadcrumpNode: BreadcrumpNode) {
    let hasChanges = _.find(breadcrumpNode.type.childObjects, {
      _changed: true
    });
    if (hasChanges) {
      return;
    }

    breadcrumpNode.type._changed = false;
    let nodeIdx = _.indexOf(this.breadcrumpNodes, breadcrumpNode);
    if (nodeIdx > 0) {
      this.breadcrumpNodes[nodeIdx - 1].instance._changed = false;
      this.refreshChangedFlags(this.breadcrumpNodes[nodeIdx - 1]);
    } else {
      this.onRefreshChangedFlags.emit(this.selectedManagedTable);
    }
  }

  restoreStateFromUrl() {
    let id = this.editorService.findFromUrlState(this.editorService.INSTANCE_ID);
    if (id) {
      let instance = _.find(this.selectedType.childObjects, {
        id: id
      });
      instance && this.handleSelectInstance(instance);
    }
  }

  ensureOldInstanceProperty(instance: DBObject) {
    if (!instance._oldInstance) {
      instance._oldInstance = JSON.parse(JSON.stringify(instance));
    }
    instance.subTables.forEach((dbObjectClassDTO) => {
      dbObjectClassDTO.childObjects.forEach((childObject) => this.ensureOldInstanceProperty(childObject));
    });
  }

  flagParentsWithChanged(instance: DBObject) {
    _.forEach(this.breadcrumpNodes, (breadcrumpNode) => {
      breadcrumpNode.type._changed = true;
      breadcrumpNode.instance._changed = true;
    });
    this.onFlagWithChanged.emit(this.breadcrumpNodes[0].type);
  }

}
