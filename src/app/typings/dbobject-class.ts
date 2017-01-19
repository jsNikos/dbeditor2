import {DBObject} from './dbobject';

export class DBObjectClass {
    tableName: string;
    classType: string;
    childObjects: Array<DBObject>;
    displayName: string;
    managerClassName: string;

    // client side props
    _changed: boolean;
}
