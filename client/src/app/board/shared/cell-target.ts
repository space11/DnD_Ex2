import {XyPair} from '../geometry/xy-pair';
import {CellRegion} from './enum/cell-region';

export class CellTarget {
    public location: XyPair;
    public region: CellRegion;

    constructor(location: XyPair, zone: CellRegion) {
        this.location = location;
        this.region = zone;
    }

    toString(): string {
        return 'CELL_TARGET: X' + this.location.x + '_Y' + this.location.y + '_' + this.region.toString();
    }

    hash(): string | null {
        return this.toString();
    }
}
