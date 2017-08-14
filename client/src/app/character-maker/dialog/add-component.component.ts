import { Component } from '@angular/core';
import { MdDialogRef } from '@angular/material';
import { Aspect, AspectType } from '../aspect';
import { AddComponentService } from '../add-component.service';


@Component({
    templateUrl: 'add-component.component.html',
    styleUrls: ['../character-maker.component.css']
})
export class AddComponentComponent {
    private aspectTypes: any[];

    private label: string;
    private aspectType: AspectType;
    private required: boolean = false;

    constructor(private dialogRef: MdDialogRef<AddComponentComponent>,
                private addComponentService: AddComponentService) {
        this.aspectTypes = [
            {
                type: AspectType.text,
                label: 'Text'
            }
        ]
    }

    public addComponent(): void {
        console.log('calling add component')
        console.log(this.label)
        console.log(this.aspectType)
        if (this.label && this.aspectType !== undefined) {
            console.log('in the if');
            let aspect = new Aspect(this.label, this.aspectType, this.required);
            this.addComponentService.emit(aspect);
            this.dialogRef.close();
        }
    }
}
