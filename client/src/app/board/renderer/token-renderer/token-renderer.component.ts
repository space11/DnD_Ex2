import {BoardService} from '../../services/board.service';
import {BoardStateService} from '../../services/board-state.service';
import {BoardCanvasService} from '../../services/board-canvas-service';
import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {XyPair} from '../../geometry/xy-pair';
import {EncounterDevService} from '../../../encounter/encounter-dev.service';

@Component({
    selector: 'token-renderer',
    templateUrl: 'token-renderer.component.html'
})

export class TokenRendererComponent implements OnInit {
    @ViewChild('tokenRenderCanvas') tokenRenderCanvas: ElementRef;
    private ctx: CanvasRenderingContext2D;

    constructor(
        private boardService: BoardService,
        private boardStateService: BoardStateService,
        private boardCanvasService: BoardCanvasService,
        private encounterService: EncounterDevService
    ) {}

    ngOnInit(): void {
        this.ctx = this.tokenRenderCanvas.nativeElement.getContext('2d');
        this.render();
    }

    render = () => {
        this.boardCanvasService.clear_canvas(this.ctx);
        this.boardCanvasService.updateTransform(this.ctx);

        // do stuff here
        for (const player of this.encounterService.players) {
            if (player.isSelected) {
                this.boardCanvasService.draw_fill_all(this.ctx, player.loc, 'rgba(0, 0, 180, 0.2)');
                const near_cells = this.boardService.calcCellsWithinRangeOfCell(player.loc, player.speed);
                const far_cells = this.boardService.calcCellsWithinRangeOfCell(player.loc, player.speed * 2);

                for (const cell of near_cells) {
                    this.boardCanvasService.draw_fill_all(this.ctx, cell, 'rgba(0, 0, 180, 0.1)');
                }
                for (const cell of far_cells) {
                    this.boardCanvasService.draw_fill_all(this.ctx, cell, 'rgba(0, 0, 180, 0.1)');
                }
            }

            this.boardCanvasService.draw_img(this.ctx, new XyPair(player.loc.x * this.boardStateService.cell_res, player.loc.y * this.boardStateService.cell_res), player.token_img)
            if (this.boardStateService.show_health) {
                this.boardCanvasService.draw_health(this.ctx, player.loc, player.hp/player.maxHp);
            }
        }

        requestAnimationFrame(this.render);
    }
}
