import { Component, OnInit } from '@angular/core';
import { Location, LocationStrategy, PathLocationStrategy } from '@angular/common';

import * as _ from 'lodash';
import { EditorService } from './services/editor.service';
import { MenuItem } from './models/menu-item';
import { DBObjectClass } from './models/dbobject-class';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  providers: [EditorService,
    Location, { provide: LocationStrategy, useClass: PathLocationStrategy }]
})
export class AppComponent implements OnInit {
  logo: string;
  selectedManagedTable: DBObjectClass;
  showEditor: boolean;
  showMenu: boolean;
  flattenedMenuItems: Array<MenuItem>;
  selectedMenuItem: MenuItem;
  loading: boolean;

  constructor(private editorService: EditorService) { }

  ngOnInit() {
    this.editorService.subscribeToLoadingEvent(loading => this.handleLoadingEvent(loading));

    this.editorService.showLoading();
    this.editorService.findLogo()
      .then(logo => {
        this.logo = logo;
      })
      .catch(err => this.editorService.handleError(err));

    this.editorService.findMenu()
      .then(menuItems => {
        this.selectedMenuItem = new MenuItem('tablemenu', menuItems);
        this.addParents([this.selectedMenuItem]);
        this.flattenedMenuItems = this.flattenMenu(this.selectedMenuItem.menuItems);
        this.showMenu = true;
        this.editorService.hideLoading();
      })
      .catch(err => this.editorService.handleError(err));
  }

  handleLoadingEvent(loading: boolean) {
    if (loading) {
      this.loading = true;
    } else {
      this.loading = false;
    }
  }

  handleMenuItemSelect(menuItem: MenuItem) {
    this.showEditor = false;
    this.selectedMenuItem = menuItem;
    if (menuItem.isTable) {
      this.handleTableSelect(menuItem);
      this.editorService.updateUrlState(this.editorService.MANAGER_CLASS_NAME, menuItem.managerClassName);
    } else {
      this.editorService.updateUrlState(this.editorService.MANAGER_CLASS_NAME, null);
      this.editorService.updateUrlState(this.editorService.INSTANCE_ID, null);
    }
    this.editorService.updateTitle(menuItem);
  }

  handleFlagWithChanged(managedTable: DBObjectClass) {
    let menuItem = this.findMenuItemByManagedClass(managedTable);
    while (menuItem != null) {
      menuItem._changed = true;
      menuItem = menuItem.parent;
    }
  }

  handleRefreshChangedFlags(managedTable: DBObjectClass) {
    var hasChanges = _.find(managedTable.childObjects, {
      _changed: true
    });
    if (hasChanges) {
      return;
    }
    managedTable._changed = false;
    this.refreshChangedFlags(this.findMenuItemByManagedClass(managedTable));
  }

  handleTableSelect(menuItem: MenuItem) {
    this.showEditor = false;
    new Promise((resolve, reject) => {
      if (!menuItem._managedTable) {
        this.addManagedTable(menuItem)
          .then(resolve, reject)
          .catch(err => this.editorService.handleError(err));
      } else {
        setTimeout(resolve, 0);
      }
    })
      .then(() => {
        this.selectedManagedTable = menuItem._managedTable;
        this.showEditor = true;
      })
      .catch(err => this.editorService.handleError(err));
  }

  refreshChangedFlags(menuItem: MenuItem) {
    var hasChanges = _.find(menuItem.menuItems, {
      _changed: true
    });
    if (hasChanges) {
      return;
    }
    menuItem._changed = false;
    if (menuItem.parent) {
      this.refreshChangedFlags(menuItem.parent);
    }
  }

  findMenuItemByManagedClass(managedTable: DBObjectClass): MenuItem {
    return _.find(this.flattenedMenuItems, {
      managerClassName: managedTable.managerClassName
    });
  }

  addManagedTable(menuItem: MenuItem): Promise<any> {
    return this.editorService
      .showLoading()
      .findDBObjectClass(menuItem.managerClassName)
      .then(resp => {
        menuItem._managedTable = resp;
      })
      .then(() => this.editorService.hideLoading());
  }

  addParents(menuItems: Array<MenuItem>) {
    menuItems.forEach(menuItem => {
      if (!menuItem.isTable) {
        menuItem.menuItems.forEach(child => {
          child.parent = menuItem;
        });
        this.addParents(menuItem.menuItems);
      }
    });
  }

  flattenMenu(menuItems: Array<MenuItem>): Array<MenuItem> {
    var tables: Array<MenuItem> = [];
    menuItems.forEach(menuItem => {
      if (menuItem.isTable && menuItem.enabled) {
        tables.push(menuItem);
      } else {
        Array.prototype.push.apply(tables, this.flattenMenu(menuItem.menuItems));
      }
    });
    return tables;
  }
}
