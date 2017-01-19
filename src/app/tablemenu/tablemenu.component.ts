import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';

import { MenuItem } from '../typings/menu-item';
import { TableMenuItem } from './typings/table-menu-item';

@Component({
  selector: 'app-tablemenu',
  templateUrl: './tablemenu.component.html',
  styleUrls: ['./tablemenu.component.css']
})
export class TablemenuComponent implements OnInit {

  breadcrump: Array<MenuItem> = [];
  showMenuItems: boolean = true;
  tableMenuItems: Array<TableMenuItem>; // flattenedMenuItems cannot be used in ng-select because of parent-ref
  selectedTable: Array<TableMenuItem>;
  showTableSelect: boolean;

  @Input() selectedMenuItem: MenuItem;
  @Input() flattenedMenuItems: Array<MenuItem>;

  @Output() onSelectMenuItem = new EventEmitter<MenuItem>();

  constructor() { }

  ngOnInit() {
    this.showTableSelect = true;
    this.breadcrump.push(this.selectedMenuItem);
    this.tableMenuItems = this.findTableMenuItems(this.flattenedMenuItems);
    // restoreStateFromUrl(); TODO
  }

  handleTableMenueItemSelect(tableMenuItem: TableMenuItem) {
    this.handleItemSelect(this.findMenuItem(tableMenuItem));
  }

  handleItemSelect(menuItem: MenuItem) {
    if (!menuItem || !menuItem.enabled) {
      return;
    }
    this.onSelectMenuItem.emit(menuItem);
    if (!menuItem.isTable) {
      this.breadcrump.push(menuItem);
    } else {
      this.selectedTable = undefined;
      this.rerenderTableSelect(); // ensure no selection to show

      this.updateBreadcrump(menuItem);
      this.showMenuItems = false;
    }
  }

  rerenderTableSelect() {
    this.showTableSelect = false;
    setTimeout(() => {
      this.showTableSelect = true;
    }, 0);
  }

  findMenuItem(selectedTable: TableMenuItem): MenuItem {
    return selectedTable && _.find(this.flattenedMenuItems, {
      managerClassName: selectedTable.id
    });
  }

  handleBreadCrumpSelect(index: number) {
    this.breadcrump.splice(index + 1, this.breadcrump.length - index - 1);
    this.onSelectMenuItem.emit(this.breadcrump[index]);
    this.showMenuItems = true;
  };

  //       function restoreStateFromUrl() {
  //   var managerClassName = editorService.findFromUrlState(editorService.MANAGER_CLASS_NAME);
  //   if (managerClassName) {
  //     var menuItem = _.find($scope.$ctrl.flattenedMenuItems, {
  //       managerClassName: managerClassName
  //     });
  //     menuItem && $scope.handleItemSelect(menuItem);
  //   }
  // } TODO

  updateBreadcrump(selectedMenuItem: MenuItem) {
    this.breadcrump.splice(0, this.breadcrump.length);
    Array.prototype.push.apply(this.breadcrump, this.findPathTo(selectedMenuItem));
  }

  findPathTo(menuItem: MenuItem): Array<MenuItem> {
    var item = menuItem;
    var path = [];
    while (item.parent) {
      item = item.parent;
      path.push(item);
    }
    return _.reverse(path);
  }

  findTableMenuItems(menuItems: Array<MenuItem>): Array<TableMenuItem> {
    return _.map(menuItems, item => {
      let mapped = new TableMenuItem();
      mapped.id = item.managerClassName;
      mapped.text = `<span>${item.displayName}</span>`
      return mapped;
    });
  }
}