import {DBObject} from './dbobject';

export class DBObjectClass {
    tableName: string;
    classType: string;
    childObjects: Array<DBObject>;
    allowedValues: Array<DBObject>;
    dbListTable: boolean;
    oneToOneTable: boolean;
    displayName: string;
    managerClassName: string;

    // client side props
    _changed: boolean;
}
