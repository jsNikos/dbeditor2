import {DBField} from './dbfield';
import {DBObjectClass} from './dbobject-class';

export class DBObject {
    id: string;
    fields: Array<DBField<any>>;
    subTables: Array<DBObjectClass>;
    displayValue: string;

    // client-side props
    _changed: boolean;
    _oldInstance: DBObject;
}
