import {Component, ViewChild, ElementRef, OnInit, HostListener, AfterViewInit, AfterViewChecked} from '@angular/core';
import {BoardCanvasService} from "../services/board-canvas.service";
import {BoardStateService} from "../services/board-state.service";
import {BoardWallService} from "../services/board-wall.service";
import {BoardTileService} from "../services/board-tile.service";
import {XyPair} from '../geometry/xy-pair';
import {BoardTransformService} from '../services/board-transform.service';
import {EncounterService} from '../../encounter/encounter.service';
import {isNullOrUndefined} from "util";
import {BoardMode} from '../shared/board-mode';
import {CellZone} from '../shared/cell-zone';
import {ViewMode} from '../shared/view-mode';
import {LightSource} from '../map-objects/light-source';
import {CellTarget} from '../shared/cell-target';
import {BoardLightService} from '../services/board-light.service';


@Component({
    selector: 'board-map',
    templateUrl: 'board-map.component.html',
    styleUrls: ['board-map.component.scss']
})


export class BoardMapComponent implements OnInit, AfterViewChecked {
    @ViewChild('inputCanvas') inputCanvas: ElementRef;
    @ViewChild('mapContainer') mapContainer: ElementRef;

    private ctx: CanvasRenderingContext2D;

    ngOnInit(): void {
        this.ctx = this.inputCanvas.nativeElement.getContext('2d');
        this.boardCanvasService.cvs_height = this.mapContainer.nativeElement.clientHeight;
        this.boardCanvasService.cvs_width = this.mapContainer.nativeElement.clientWidth;
        this.boardStateService.mapOffsetTop = this.mapContainer.nativeElement.offsetTop;
        this.boardStateService.mapOffsetLeft = this.mapContainer.nativeElement.offsetLeft;
    }

    constructor(
        private boardCanvasService: BoardCanvasService,
        private boardStateService: BoardStateService,
        private boardTransformService: BoardTransformService,
        private encounterService: EncounterService,
        private boardWallService: BoardWallService,
        private boardTileService: BoardTileService,
        private boardLightService: BoardLightService
    ) {
    }

    ngAfterViewChecked(): void {
        this.boardCanvasService.canvasNativeElement = this.mapContainer.nativeElement;
    }

    getCanvasHeight(): number {
        return this.boardCanvasService.cvs_height;
    }

    getCanvasWidth(): number {
        return this.boardCanvasService.cvs_width;
    }

    clickResponse(): void {
    }

    mouseMove(event): void {
        // this.boardService.handleMouseMove(event);
        const mouse_screen = new XyPair(event.clientX, event.clientY);

        if (this.boardStateService.mouseLeftDown) {
            if ((window.performance.now() - this.boardStateService.mouseLeftDownStartTime) > 90) {
                this.boardStateService.mouseDrag = true;
                const trans_coor = this.boardTransformService.screen_to_map(event);

                const deltaX = this.boardStateService.mouse_loc_map.x - trans_coor.x;
                const deltaY = this.boardStateService.mouse_loc_map.y - trans_coor.y;

                this.boardStateService.x_offset -= (deltaX * this.boardStateService.scale);
                this.boardStateService.y_offset -= (deltaY * this.boardStateService.scale);
            }
        }

        this.updateMouseLocation(mouse_screen);


        this.encounterService.checkForPops(
            new XyPair(this.boardStateService.mouse_loc_cell.x, this.boardStateService.mouse_loc_cell.y),
            this.boardTransformService.map_to_screen(new XyPair((this.boardStateService.mouse_loc_cell.x + 1) * this.boardStateService.cell_res, ((this.boardStateService.mouse_loc_cell.y) * this.boardStateService.cell_res)))
        );
    }

    handleMouseUp(event) {
        switch (event.which) {
            case 1:
                // left click
                this.doMouseLeftUp(event);
                break;
            case 2:
                // middle click
                break;
            case 3:
                // right click
                break;
        }
    }

    handleMouseDown(event) {
        switch (event.which) {
            case 1:
                // left click
                this.boardStateService.mouseLeftDown = true;
                this.boardStateService.mouseLeftDownStartTime = window.performance.now();
                break;
            case 2:
                // middle click
                break;
            case 3:
                // right click
                break;
        }
    }

    handleMouseWheel(event) {
        // this.boardService.handleMouseScroll(event.deltaY);
        const scroll_scale_delta = 0.10;
        const max_scale = 2.50;
        const min_scale = 0.35;

        const start_scale = this.boardStateService.scale;

        const preferred_scale_delta = (-event.deltaY / 100) * scroll_scale_delta;
        const preferred_new_scale = start_scale + preferred_scale_delta;

        let new_scale_delta;

        if (preferred_new_scale >= max_scale) {
            new_scale_delta = start_scale - max_scale;
        } else if (preferred_new_scale <= min_scale) {
            new_scale_delta = min_scale - start_scale;
        } else {
            new_scale_delta = preferred_scale_delta;
        }

        const x_delta = -(this.boardStateService.mouse_loc_map.x * new_scale_delta);
        const y_delta = -(this.boardStateService.mouse_loc_map.y * new_scale_delta);

        this.boardStateService.scale += new_scale_delta;
        this.boardStateService.x_offset += x_delta;
        this.boardStateService.y_offset += y_delta;
    }

    handleMouseLeave(event) {
        // this.boardService.handleMouseLeave();
        this.clearMouseLocation();
        this.boardStateService.mouseLeftDown = false;
    }

    handleMouseEnter(event) {
    }

    handleContextMenu(event) {
        return false;
    }

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        this.boardCanvasService.canvasNativeElement = this.mapContainer.nativeElement;
        this.boardCanvasService.cvs_height = this.mapContainer.nativeElement.clientHeight;
        this.boardCanvasService.cvs_width = this.mapContainer.nativeElement.clientWidth;
        this.boardStateService.mapOffsetTop = this.mapContainer.nativeElement.offsetTop;
        this.boardStateService.mapOffsetLeft = this.mapContainer.nativeElement.offsetLeft;
    }

    @HostListener('document:keydown', ['$event'])
    handleKeyDownEvent(event: KeyboardEvent) {
        const key_code = event.code;
        switch (key_code) {
            case 'ShiftLeft' :
                this.boardStateService.shiftDown = true;
                this.refreshMouseLocation();
                break;
            case 'ShiftRight' :
                break;
            case 'Space' :
                this.boardStateService.spaceDown = true;
                break;
        }
    }

    @HostListener('document:keyup', ['$event'])
    handleKeyUpEvent(event: KeyboardEvent) {
        const key_code = event.code;
        switch (key_code) {
            case 'ShiftLeft' :
                this.boardStateService.shiftDown = false;
                this.refreshMouseLocation();
                break;
            case 'ShiftRight' :
                break;
            case 'Space' :
                this.boardStateService.spaceDown = false;
                break;
            case 'Escape':
                this.boardStateService.source_click_location = null;
                break;
        }
    }

    updateMouseLocation(location: XyPair): void {
        // UPDATE GLOBAL MOUSE LOCATIONS
        this.boardStateService.mouse_loc_screen = location;
        this.boardStateService.mouse_loc_canvas = this.boardTransformService.screen_to_canvas(this.boardStateService.mouse_loc_screen);
        this.boardStateService.mouse_loc_map = this.boardTransformService.screen_to_map(this.boardStateService.mouse_loc_screen);
        this.boardStateService.mouse_loc_cell = this.boardTransformService.screen_to_cell(this.boardStateService.mouse_loc_screen);
        this.boardStateService.mouse_loc_cell_pix = new XyPair(this.boardStateService.mouse_loc_map.x - (this.boardStateService.mouse_loc_cell.x * this.boardStateService.cell_res), this.boardStateService.mouse_loc_map.y - (this.boardStateService.mouse_loc_cell.y * this.boardStateService.cell_res));
        this.boardStateService.mouse_cell_target = this.boardTransformService.calculate_cell_target(this.boardStateService.mouse_loc_cell_pix);
        this.boardStateService.mouseOnMap = this.boardStateService.coorInBounds(this.boardStateService.mouse_loc_cell.x, this.boardStateService.mouse_loc_cell.y);
    }

    refreshMouseLocation(): void {
        this.boardStateService.mouse_loc_canvas = this.boardTransformService.screen_to_canvas(this.boardStateService.mouse_loc_screen);
        this.boardStateService.mouse_loc_map = this.boardTransformService.screen_to_map(this.boardStateService.mouse_loc_screen);
        this.boardStateService.mouse_loc_cell = this.boardTransformService.screen_to_cell(this.boardStateService.mouse_loc_screen);
        this.boardStateService.mouse_loc_cell_pix = new XyPair(this.boardStateService.mouse_loc_map.x - (this.boardStateService.mouse_loc_cell.x * this.boardStateService.cell_res), this.boardStateService.mouse_loc_map.y - (this.boardStateService.mouse_loc_cell.y * this.boardStateService.cell_res));
        this.boardStateService.mouse_cell_target = this.boardTransformService.calculate_cell_target(this.boardStateService.mouse_loc_cell_pix);
        this.boardStateService.mouseOnMap = this.boardStateService.coorInBounds(this.boardStateService.mouse_loc_cell.x, this.boardStateService.mouse_loc_cell.y);
    }

    clearMouseLocation(): void {
        this.boardStateService.mouse_loc_canvas = null;
        this.boardStateService.mouse_loc_map = null;
        this.boardStateService.mouse_loc_cell = null;
        this.boardStateService.mouse_loc_cell_pix = null;
        this.boardStateService.mouse_cell_target = null;
        this.boardStateService.mouseOnMap = false;
    }

    // coorInBounds(x: number, y: number): boolean {
    //     return !((x >= this.boardStateService.mapDimX) || (y >= this.boardStateService.mapDimY) || (x < 0) || (y < 0));
    // }

    private doMouseLeftUp(event) {

        if (!this.boardStateService.mouseDrag) {
            switch (this.boardStateService.board_view_mode) {
                case ViewMode.MASTER:
                    switch (this.boardStateService.board_edit_mode) {
                        case BoardMode.PLAYER:
                            this.encounterService.handleClick(this.boardStateService.mouse_loc_cell);
                            break;
                    }
                    break;
                case ViewMode.PLAYER:
                    switch (this.boardStateService.board_edit_mode) {
                        case BoardMode.PLAYER:
                            this.encounterService.handleClick(this.boardStateService.mouse_loc_cell);
                            break;
                    }
                    break;
                case ViewMode.BOARD_MAKER:
                    switch (this.boardStateService.board_edit_mode) {
                        case BoardMode.PLAYER:
                            this.encounterService.handleClick(this.boardStateService.mouse_loc_cell);
                            break;
                        case BoardMode.WALLS:
                            if (!isNullOrUndefined(this.boardStateService.mouse_cell_target)) {
                                if (!isNullOrUndefined(this.boardStateService.source_click_location)) {
                                    // MOUSE NOT DRAGGING - WALL EDIT MODE - MOUSE ON MAP - SOURCE IS DEFINED
                                    switch (this.boardStateService.mouse_cell_target.zone) {
                                        case CellZone.CORNER:
                                            this.boardWallService.fillWallsBetweenCorners(this.boardStateService.source_click_location.coor, this.boardStateService.mouse_cell_target.coor);
                                            this.boardLightService.updateLightValues();
                                            this.boardStateService.source_click_location = this.boardStateService.mouse_cell_target;
                                            break;
                                        default:
                                            this.boardStateService.source_click_location = null;
                                    }
                                } else {
                                    switch (this.boardStateService.mouse_cell_target.zone) {
                                        // MOUSE NOT DRAGGING - WALL EDIT MODE - MOUSE ON MAP - SOURCE IS NOT DEFINED
                                        case CellZone.CORNER:
                                            this.boardStateService.source_click_location = this.boardStateService.mouse_cell_target;
                                            break;
                                        case CellZone.NORTH:
                                            this.boardStateService.source_click_location = null;
                                            this.boardWallService.toggleWall(this.boardStateService.mouse_cell_target);
                                            this.boardLightService.updateLightValues();
                                            break;
                                        case CellZone.WEST:
                                            this.boardStateService.source_click_location = null;
                                            this.boardWallService.toggleWall(this.boardStateService.mouse_cell_target);
                                            this.boardLightService.updateLightValues();
                                            break;
                                        case CellZone.FWR:
                                            this.boardStateService.source_click_location = null;
                                            this.boardWallService.toggleWall(this.boardStateService.mouse_cell_target);
                                            this.boardLightService.updateLightValues();
                                            break;
                                        case CellZone.BKW:
                                            this.boardStateService.source_click_location = null;
                                            this.boardWallService.toggleWall(this.boardStateService.mouse_cell_target);
                                            this.boardLightService.updateLightValues();
                                            break;
                                    }
                                }
                            }
                            break;
                        case BoardMode.DOORS:
                            break;
                        case BoardMode.LIGHTS:
                            if (!isNullOrUndefined(this.boardStateService.mouse_cell_target)) {
                                if (this.boardStateService.mouse_cell_target.zone === CellZone.CENTER) {
                                    this.toggleLight(this.boardStateService.mouse_cell_target.coor.x, this.boardStateService.mouse_cell_target.coor.y);
                                    this.boardLightService.updateLightValues();
                                }
                            }
                            break;
                        case BoardMode.TILES:
                            if (!isNullOrUndefined(this.boardStateService.mouse_cell_target)) {
                                switch (this.boardStateService.mouse_cell_target.zone) {
                                    case CellZone.CENTER:
                                        this.boardTileService.setTileData_All(this.boardStateService.mouse_loc_cell);
                                        break;
                                    case CellZone.TOP:
                                        this.boardTileService.setTileData_Top(this.boardStateService.mouse_loc_cell);
                                        break;
                                    case CellZone.LEFT:
                                        this.boardTileService.setTileData_Left(this.boardStateService.mouse_loc_cell);
                                        break;
                                    case CellZone.BOTTOM:
                                        this.boardTileService.setTileData_Bottom(this.boardStateService.mouse_loc_cell);
                                        break;
                                    case CellZone.RIGHT:
                                        this.boardTileService.setTileData_Right(this.boardStateService.mouse_loc_cell);
                                        break;
                                }
                            }
                            break;
                    }
                    break;
            }
        }

        this.boardStateService.mouseLeftDown = false;
        this.boardStateService.mouseDrag = false;
    }

    toggleLight(x: number, y: number): void {
        const target = new CellTarget(new XyPair(x, y), CellZone.CENTER);
        if (this.boardLightService.lightSourceData.has(target.hash())) {
            this.boardLightService.lightSourceData.delete(target.hash());
        } else {
            this.boardLightService.lightSourceData.set(target.hash(), new LightSource(x, y, 5));
        }
    }
}
