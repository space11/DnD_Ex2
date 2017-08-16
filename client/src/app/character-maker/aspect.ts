export enum AspectType {
    text
}

export class Aspect {
    label: string;
    aspectType: AspectType;
    required: boolean;

    constructor(label: string, aspectType: AspectType, required: boolean) {
        this.label = label;
        this.aspectType = aspectType;
        this.required = required;
    }
}