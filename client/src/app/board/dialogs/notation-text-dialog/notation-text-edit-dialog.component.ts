import {Component} from "@angular/core";
import {MatDialogRef} from "@angular/material";
import {BoardNotationService} from "../../services/board-notation-service";
import {XyPair} from "../../../../../../shared/types/encounter/board/xy-pair";
import {TextNotation} from "../../shared/notation/text-notation";

@Component({
    selector: 'text-edit-dialog',
    templateUrl: 'notation-text-edit-dialog.component.html',
    styleUrls: ['notation-text-edit-dialog.component.scss']
})

export class NotationTextEditDialogComponent {
    public textField: string;
    public fontSize: number;

    constructor(
        public dialogRef: MatDialogRef<NotationTextEditDialogComponent>,
        private boardNotationService: BoardNotationService
    ) {
        this.fontSize = 10;
    }

    public doAThing() {
        const textEl = new TextNotation();
        textEl.text = this.textField;
        textEl.anchor = new XyPair(0,0);
        textEl.fontSize = this.fontSize;

        this.boardNotationService.isAddingTextNotation = true;
        this.boardNotationService.currentTextNotationId = textEl._id;

        this.boardNotationService.getActiveNotation().addTextNotation(textEl);
        this.dialogRef.close();
    }

    public increaseFontSize() {
        this.fontSize = this.fontSize + 5;
    }

    public decreaseFontSize() {
        if (this.fontSize > 5) {
            this.fontSize = this.fontSize - 5;
        }
    }
}