import {Component} from '@angular/core';
import {BoardConfigService} from '../services/board-config.service';
import {BoardService} from '../services/board.service';
import {TileService} from '../services/tile.service';
import {ViewMode} from '../shared/view-mode';
import {BoardMode} from '../shared/board-mode';
import {LightValue} from '../shared/light-value';

@Component({
  selector: 'board-controller',
  templateUrl: 'board-controller.component.html',
  styleUrls: ['board-controller.component.scss']
})

export class BoardControllerComponent {
  public ViewMode = ViewMode;
  public BoardMode = BoardMode;

  currentMode = 'Walls';
  modes: string[] = [
    'Walls',
    'Doors',
    'Lights',
    'Tiles'
  ];

  currentView = 'Board Maker';
  viewModes: string[] = [
    'Board Maker',
    'Player View',
    'Game Master'
  ];

  tileUrls: string[] = [
    'resources/images/map-tiles/coal_ore.jpg',
    'resources/images/map-tiles/cobolt_ore.jpg',
    'resources/images/map-tiles/diamond_ore.jpg',
    'resources/images/map-tiles/emerald_ore.jpg',
    'resources/images/map-tiles/iron_ore.jpg',
    'resources/images/map-tiles/gold.jpg',

    'resources/images/map-tiles/cobolt_floor.jpg',
    'resources/images/map-tiles/diamond_floor.jpg',
    'resources/images/map-tiles/emerald_floor.jpg',
    'resources/images/map-tiles/gold_floor.jpg',
    'resources/images/map-tiles/iron_floor.jpg',

    'resources/images/map-tiles/brick.jpg',
    'resources/images/map-tiles/cobblestone.jpg',
    'resources/images/map-tiles/old_stone.jpg',
    'resources/images/map-tiles/old_stone_moss.jpg',
    'resources/images/map-tiles/old_stone_moss_decor.jpg',
    'resources/images/map-tiles/gravel.jpg',
    'resources/images/map-tiles/stone.jpg',
    'resources/images/map-tiles/stone_decor1.jpg',
    'resources/images/map-tiles/stone_tile.jpg',
    'resources/images/map-tiles/stone_tile_old.jpg',

    'resources/images/map-tiles/dirt.jpg',
    'resources/images/map-tiles/mud.jpg',
    'resources/images/map-tiles/grass.jpg',
    'resources/images/map-tiles/lilly_pad.jpg',
    'resources/images/map-tiles/lilly_pad2.jpg',

    'resources/images/map-tiles/sand.jpg',
    'resources/images/map-tiles/sandstone.jpg',
    'resources/images/map-tiles/sandstone_decor1.jpg',
    'resources/images/map-tiles/sandstone_decor2.jpg',
    'resources/images/map-tiles/sandstone_tile.jpg',

    'resources/images/map-tiles/wood1.jpg',
    'resources/images/map-tiles/wood2.jpg',
    'resources/images/map-tiles/crate.jpg',
  ];

  constructor(
    public bs: BoardService,
    public bcs: BoardConfigService,
    public ts: TileService
  ) {}

  showModeControls(): boolean {
    return this.bcs.board_view_mode === ViewMode.BOARD_MAKER;
  }

  showLightControls(): boolean {
    return this.bcs.board_view_mode === ViewMode.BOARD_MAKER || this.bcs.board_view_mode === ViewMode.MASTER;
  }

  onModeChange() {
    switch (this.currentMode) {
      case 'Walls' :
        this.bcs.board_edit_mode = BoardMode.WALLS;
        this.bcs.inputOffset = 0.12;
        this.bcs.doDiagonals = true;
        break;
      case 'Doors' :
        this.bs.source_click_location = null;
        this.bcs.board_edit_mode = BoardMode.DOORS;
        this.bcs.inputOffset = 0.10;
        this.bcs.doDiagonals = true;
        break;
      case 'Lights' :
        this.bs.source_click_location = null;
        this.bcs.board_edit_mode = BoardMode.LIGHTS;
        this.bcs.inputOffset = 0;
        this.bcs.doDiagonals = false;
        break;
      case 'Tiles' :
        this.bs.source_click_location = null;
        this.bcs.board_edit_mode = BoardMode.TILES;
        this.bcs.inputOffset = 0;
        this.bcs.doDiagonals = false;
        break;
    }
  }

  onViewChange() {
    switch (this.currentView) {
      case 'Board Maker':
        this.bs.source_click_location = null;
        this.bcs.board_view_mode = ViewMode.BOARD_MAKER;
        break;
      case 'Player View':
        this.bs.source_click_location = null;
        this.bcs.board_view_mode = ViewMode.PLAYER;
        break;
      case 'Game Master':
        this.bs.source_click_location = null;
        this.bcs.board_view_mode = ViewMode.MASTER;
        break;
    }
  }

  mapOpacitySliderInput(event) {
    this.bcs.board_maker_map_opacity = event.value;
  }

  increaseAmbientLight(): void {
    if (this.bcs.ambientLight === LightValue.DARK) {
      this.bcs.ambientLight = LightValue.DIM;
    } else if (this.bcs.ambientLight === LightValue.DIM) {
      this.bcs.ambientLight = LightValue.FULL;
    }
    this.bs.updateLightValues();
  }

  decreaseAmbientLight(): void {
    if (this.bcs.ambientLight === LightValue.FULL) {
      this.bcs.ambientLight = LightValue.DIM;
    } else if (this.bcs.ambientLight === LightValue.DIM) {
      this.bcs.ambientLight = LightValue.DARK;
    }
    this.bs.updateLightValues();
  }

  getLightValue(): string {
    switch (this.bcs.ambientLight) {
      case LightValue.DARK:
        return 'Dark';
      case LightValue.DIM:
        return 'Dim';
      case LightValue.FULL:
        return 'Full';
    }
  }

  updateTile(id: string) {
    this.ts.activeTileUrl = id;
  }
}
