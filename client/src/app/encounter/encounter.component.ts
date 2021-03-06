import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { EncounterService } from './encounter.service';
import { ActivatedRoute } from '@angular/router';
import { EncounterConcurrencyService } from './encounter-concurrency.service';
import { RightsService } from '../data-services/rights.service';
import { BoardTraverseService } from "../board/services/board-traverse.service";
import { BoardVisibilityService } from "../board/services/board-visibility.service";
import { BoardTransformService } from "../board/services/board-transform.service";
import { BoardCanvasService } from "../board/services/board-canvas.service";
import { BoardPlayerService } from "../board/services/board-player.service";
import { BoardWallService } from "../board/services/board-wall.service";
import { BoardLightService } from "../board/services/board-light.service";
import { BoardStateService } from "../board/services/board-state.service";
import { BoardTeamsService } from "../board/services/board-teams.service";
import { BoardNotationService } from "../board/services/board-notation-service";
import { BoardStealthService } from '../board/services/board-stealth.service';
import { EncounterKeyEventService } from "./encounter-key-event.service";
import { RuleService } from '../character-sheet/shared/rule/rule.service';
import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';
import { SubSink } from 'subsink';
import { filter, mergeMap } from 'rxjs/operators';

@Component({
	selector: 'encounter',
	templateUrl: 'encounter.component.html',
	styleUrls: ['encounter.component.scss']
})
export class EncounterComponent implements OnInit, OnDestroy {
	private subs: SubSink = new SubSink();

	public finishedLoading: boolean = false;

	constructor(private encounterService: EncounterService,
	            private activatedRoute: ActivatedRoute,
	            private encounterConcurrencyService: EncounterConcurrencyService,
	            private rightsService: RightsService,
	            private boardStateService: BoardStateService,
	            private boardVisibilityService: BoardVisibilityService,
	            private boardTransformService: BoardTransformService,
	            private boardCanvasService: BoardCanvasService,
	            private boardPlayerService: BoardPlayerService,
	            private boardWallService: BoardWallService,
	            private boardLightService: BoardLightService,
	            private boardNotationService: BoardNotationService,
	            private boardTeamsService: BoardTeamsService,
	            private boardTraverseService: BoardTraverseService,
	            private stealthService: BoardStealthService,
	            private keyInputService: EncounterKeyEventService,
	            private ruleService: RuleService,
	            private breadCrumbService: BreadCrumbService,
	) {
	}

	public ngOnInit(): void {
		this.initEncounterServices();
		this.subs.add(this.encounterService.refreshEncounterObservable.subscribe(() => {
			this.unInitEncounterServices();
			this.initEncounterServices();
		}));
	}

	public ngOnDestroy(): void {
		this.unInitEncounterServices();
		this.subs.unsubscribe();
	}

	@HostListener('document:keyup', ['$event'])
	public keyup(event): void {
		this.keyInputService.keyup(event);
	}

	private initEncounterServices(): void {
		this.encounterConcurrencyService.init();
		this.keyInputService.startListeningToKeyEvents();
		let encounterId: string;
		this.subs.add(this.activatedRoute.params.pipe(
				mergeMap((params) => {
					encounterId = params['encounterId'];
					this.encounterService.setEncounterId(encounterId);
					return this.encounterService.isReadyObservable;
				}),
				filter((isReady: boolean) => isReady)
				)
						.subscribe(() => {
							this.rightsService.setEncounterService(this.encounterService);
							this.ruleService.setAspectService(this.encounterService);
							this.breadCrumbService.addCrumb(this.encounterService.label, `encounter/${encounterId}`);
						})
		);

		this.subs.add(this.boardCanvasService.isReadyObservable.subscribe((isReady: boolean) => {
			if (isReady) {
				this.finishedLoading = true;
			}
		}));

		this.boardStateService.init();
		this.boardLightService.init();
		this.boardWallService.init();
		this.boardPlayerService.init();
		this.boardCanvasService.init();
		this.boardTransformService.init();
		this.boardVisibilityService.init();
		this.boardTraverseService.init();
		this.boardTeamsService.init();
		this.boardNotationService.init();
		this.stealthService.init();
	}

	private unInitEncounterServices(): void {
		this.encounterConcurrencyService.unInit();
		this.boardStateService.unInit();
		this.boardLightService.unInit();
		this.boardWallService.unInit();
		this.boardPlayerService.unInit();
		this.boardCanvasService.unInit();
		this.boardTransformService.unInit();
		this.boardTraverseService.unInit();
		this.boardVisibilityService.unInit();
		this.boardTeamsService.unInit();
		this.boardNotationService.unInit();
		this.stealthService.unInit();
	}
}