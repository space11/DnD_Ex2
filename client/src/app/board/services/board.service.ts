import {Injectable} from '@angular/core';
import {XyPair} from '../geometry/xy-pair';
import {CellLightConfig} from '../shared/cell-light-state';
import {CellTarget} from '../shared/cell-target';
import {CellZone} from '../shared/cell-zone';
import {LightSource} from '../map-objects/light-source';
import {LightValue} from '../shared/light-value';
import {BoardStateService} from './board-state.service';
import {BoardCanvasService} from './board-canvas.service';
import {BoardLosService} from './board-los.service';


@Injectable()
export class BoardService {

    public cellLightData: Array<Array<CellLightConfig>>;
    public lightSourceData: Map<string, LightSource> = new Map();

    // light
    public ambientLight: LightValue;


    constructor(
        public boardStateService: BoardStateService,
        public boardCanvasService: BoardCanvasService,
        public boardLosService: BoardLosService
    ) {
        this.cellLightData = new Array(this.boardStateService.mapDimX);
        for (let x = 0; x < this.boardStateService.mapDimX; x++) {
            this.cellLightData[x] = new Array(this.boardStateService.mapDimY);
            for (let y = 0; y < this.boardStateService.mapDimY; y++) {
                this.cellLightData[x][y] = new CellLightConfig(x, y);
            }
        }
    }

    // *************************************************************************************************************************************************************
    // STATIC FUNCTIONS
    // *************************************************************************************************************************************************************
    static distanceCellToCell(cell1: XyPair, cell2: XyPair): number {
        const delta_y = Math.abs(cell2.y - cell1.y);
        const delta_x = Math.abs(cell2.x - cell1.x);
        const delta_delta = Math.abs(delta_y - delta_x);
        const small_delta = Math.min(delta_x, delta_y);
        const double_step = Math.floor(small_delta / 2);
        const reg_step = small_delta - double_step;
        return (2 * double_step) + reg_step + delta_delta;
    }

    // *************************************************************************************************************************************************************
    // UN-CATEGORIZED FUNCTIONS
    // *************************************************************************************************************************************************************

    /**
     * returns an array of XY pairs that represent cells
     * @param source_cell
     * @param range
     * @returns {null}
     */
    calcCellsWithinRangeOfCell(source_cell: XyPair, range: number): Array<XyPair> {
        const returnMe = Array<XyPair>();

        let x_low = source_cell.x - range;
        if (x_low < 0) {
            x_low = 0;
        }
        let x_high = source_cell.x + range;
        if (x_high > this.boardStateService.mapDimX) {
            x_high = this.boardStateService.mapDimX;
        }
        let y_low = source_cell.y - range;
        if (y_low < 0) {
            y_low = 0;
        }
        let y_high = source_cell.y + range;
        if (y_high > this.boardStateService.mapDimY) {
            y_high = this.boardStateService.mapDimY;
        }

        for (let x = x_low; x <= x_high; x++) {
            for (let y = y_low; y <= y_high; y++) {
                const cell = new XyPair(x, y);
                if (BoardService.distanceCellToCell(source_cell, cell) <= range) {
                    returnMe.push(cell);
                }
            }
        }
        return returnMe;
    }

    // *************************************************************************************************************************************************************
    // MAP MANIPULATION FUNCTIONS
    // *************************************************************************************************************************************************************

    updateLightValues(): void {
        for (let x = 0; x < this.boardStateService.mapDimX; x++) {
            for (let y = 0; y < this.boardStateService.mapDimY; y++) {
                // for each cell on the map
                const cell = this.cellLightData[x][y];

                // reset the ambient light values
                cell.light_north = this.boardStateService.ambientLight;
                cell.light_west = this.boardStateService.ambientLight;
                cell.light_south = this.boardStateService.ambientLight;
                cell.light_east = this.boardStateService.ambientLight;

                // set booleans for which cells have been touched
                let north = false;
                let west = false;
                let south = false;
                let east = false;

                // sort light sources by distance to cell, removing any beyond influence distance
                const mapped_light_sources = new Map<number, Array<LightSource>>();
                for (const light_source of Array.from(this.lightSourceData.values())) {
                    const distance = BoardService.distanceCellToCell(new XyPair(cell.coor.x, cell.coor.y), light_source.coor);
                    if (distance <= light_source.dim_range) {
                        if (!mapped_light_sources.has(distance)) {
                            mapped_light_sources.set(distance, new Array<LightSource>());
                        }
                        mapped_light_sources.get(distance).push(light_source);
                    }
                }

                const distances = Array.from(mapped_light_sources.keys()).sort((a, b) => {
                    if (a > b) {
                        return 1;
                    }
                    if (a < b) {
                        return -1;
                    }
                    return 0;
                });

                for (const dist of distances) {
                    for (const light_source of mapped_light_sources.get(dist)) {
                        if (!(north && east && south && west)) {
                            if (!north) {
                                if (this.boardLosService.cellHasLOSToNorth(light_source.coor, cell.coor)) {
                                    cell.updateLightIntensityNorth(light_source.lightImpactAtDistance(dist));
                                    north = true;
                                }
                            }
                            if (!east) {
                                if (this.boardLosService.cellHasLOSToEast(light_source.coor, cell.coor)) {
                                    cell.updateLightIntensityEast(light_source.lightImpactAtDistance(dist));
                                    east = true;
                                }
                            }
                            if (!south) {
                                if (this.boardLosService.cellHasLOSToSouth(light_source.coor, cell.coor)) {
                                    cell.updateLightIntensitySouth(light_source.lightImpactAtDistance(dist));
                                    south = true;
                                }
                            }
                            if (!west) {
                                if (this.boardLosService.cellHasLOSToWest(light_source.coor, cell.coor)) {
                                    cell.updateLightIntensityWest(light_source.lightImpactAtDistance(dist));
                                    west = true;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    toggleLight(x: number, y: number): void {
        const target = new CellTarget(new XyPair(x, y), CellZone.CENTER);
        if (this.lightSourceData.has(target.hash())) {
            this.lightSourceData.delete(target.hash());
        } else {
            this.lightSourceData.set(target.hash(), new LightSource(x, y, 5));
        }
    }
}
