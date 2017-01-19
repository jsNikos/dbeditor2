import { DBObjectClass } from './dbobject-class';

export class MenuItem {
    displayName: string;
    enabled: boolean;
    canNewDelete: boolean;
    isTable: boolean;
    managerClassName: string;
    menuItems: Array<MenuItem>;

    // client-side props
    parent: MenuItem;
    _managedTable: DBObjectClass;
    _changed: boolean;

    constructor(displayName: string, menuItems: Array<MenuItem>) {
        this.displayName = displayName;
        this.menuItems = menuItems;
    }
}
