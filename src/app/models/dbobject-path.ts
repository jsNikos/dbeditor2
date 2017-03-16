import { DBObjectClass } from './dbobject-class';
import { DBObject } from './dbobject';

export class DBObjectPath {
    tableName: string;
    classType: string;
    instanceId: string;
    next: DBObjectPath;
}
