export enum AspectType {
    TEXT = 'TEXT',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
    BOOLEAN_LIST = 'BOOLEAN_LIST',
    TEXT_LIST = 'TEXT_LIST',
    CATEGORICAL = 'CATEGORICAL',
    TOKEN = 'TOKEN',
    FUNCTION = 'FUNCTION'
}

export class Aspect {
    label: string;
    aspectType: AspectType;
    required: boolean;

    items: any[];
    ruleFunction: any;

    config: any;
    isNew: boolean = true;

    constructor(label: string, aspectType: AspectType, required: boolean) {
        this.label = label;
        this.aspectType = aspectType;
        this.required = required;

        this.config = this.defaultConfig();
    }

    private defaultConfig(): any {
        return { 'dragHandle': '.sub-component-header', 'col': 1, 'row': 1, 'sizex': 1, 'sizey': 1 };
    }
}