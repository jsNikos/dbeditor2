export class DBField<T> {
    name: string;
    value: any;
    type: string;
    allowedValues: Array<T>;
    displayName: string;
    help: string;
    editor: string;
    readonly: boolean;
    required: boolean;
}
