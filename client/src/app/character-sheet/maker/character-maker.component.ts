import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AddComponentComponent } from './dialog/add-component.component';
import { CharacterMakerService } from './character-maker.service';
import { MatDialog } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { CharacterInterfaceFactory } from '../shared/character-interface.factory';
import { CharacterSheetRepository } from '../../repositories/character-sheet.repository';
import { Aspect, AspectType } from '../shared/aspect';
import { DashboardCard } from '../../cdk/dashboard-card/dashboard-card';
import { AddTooltipAspectComponent } from "./dialog/add-tooltip-aspect.component";
import { CharacterAspectComponent } from '../shared/character-aspect.component';
import { PredefinedAspects } from '../../../../../shared/predefined-aspects.enum';
import { AbilityData } from '../../../../../shared/types/ability.data';
import { RulesConfigService } from '../../data-services/rules-config.service';
import { RuleData } from '../../../../../shared/types/rule.data';
import { CharacterTooltipPreviewComponent } from '../character-tooltip/character-tooltip-preview.component';
import { SubSink } from 'subsink';
import { BreadCrumbService } from '../../bread-crumb/bread-crumb.service';

@Component({
	selector: 'character-maker',
	templateUrl: 'character-maker.component.html',
	styleUrls: ['character-maker.component.scss']
})
export class CharacterMakerComponent implements OnInit, AfterViewInit, OnDestroy {
	private characterSheetId: string;
	private defaultAbilities: AbilityData[] = [];
	private rules: RuleData[] = [];
	private subscriptions: SubSink = new SubSink();
	@ViewChild('characterTooltip', {static: true})
	private characterToolTipComponent: CharacterTooltipPreviewComponent;

	public characterToolTipCard: DashboardCard;

	public readonly preDefinedAspects = [
		{
			label: PredefinedAspects.NAME,
			checked: false
		},
		{
			label: PredefinedAspects.HEALTH,
			checked: false
		},
	];

	constructor(private dialog: MatDialog,
	            private activatedRoute: ActivatedRoute,
	            private characterSheetRepository: CharacterSheetRepository,
	            private characterInterfaceFactory: CharacterInterfaceFactory,
	            public characterService: CharacterMakerService,
	            private breadCrumbService: BreadCrumbService,
	            public rulesConfigService: RulesConfigService) {

	}

	ngOnInit(): void {
		this.characterInterfaceFactory.setCharacterInterface(this.characterService);
		this.characterToolTipCard = {
			label: 'Character Tooltip Preview',
			menuOptions: [
				{
					label: 'Add Aspect to tooltip',
					function: this.addTooltipAspect
				}
			]
		};

		this.subscriptions.add(this.characterService.registerAspectComponentObservable.subscribe((aspectComponent: CharacterAspectComponent) => {
			if (aspectComponent.aspect.isPredefined) {
				for (let preDefinedAspect of this.preDefinedAspects) {
					if (preDefinedAspect.label.toLowerCase() === aspectComponent.aspect.label.toLowerCase()) {
						preDefinedAspect.checked = true;
					}
				}
			}
		}));
		this.subscriptions.add(this.characterService.removeComponentObservable.subscribe(() => {
			let tooltipAspects = this.characterService.getTooltipAspects();
			let notPredefined = false;
			for (let aspect of tooltipAspects) {
				if (!aspect.isPredefined) {
					notPredefined = true;
					break;
				}
			}
		}));
		this.subscriptions.add(this.characterService.isReadyObservable.subscribe((isReady: boolean) => {
			if (isReady) {
				this.characterToolTipComponent.tooltipConfig = this.characterService.characterTooltipConfig;
				this.defaultAbilities = this.characterService.abilities;
				this.rules = this.characterService.rules;
				this.breadCrumbService.addCrumb(this.characterService.label, `character-sheet/${this.characterSheetId}`);
			}
		}));
	}

	ngAfterViewInit(): void {
		this.subscriptions.add(this.activatedRoute.params.subscribe(params => {
			this.characterSheetId = params['characterSheetId'];
			this.characterService.setCharacterSheetId(this.characterSheetId);
		}));
	}

	public ngOnDestroy(): void {
		this.subscriptions.unsubscribe();
		this.characterService.unInit();
	}

	public openAddDialog(): void {
		this.dialog.open(AddComponentComponent);
	}

	public ruleChange(): void {
		this.characterService.setRules(this.rules);
	}

	public save(): void {
		this.characterService.setAbilities(this.defaultAbilities);
		this.characterService.setRules(this.rules);
		this.characterService.save();
	}

	public changePredefinedAspect(aspectLabel: string, checked: boolean): void {
		let aspectType: AspectType;
		let icon: string;
		switch (aspectLabel) {
			case ('Name'): {
				aspectType = AspectType.TEXT;
				icon = 'account_circle';
				break;
			}
			case ('Health'): {
				aspectType = AspectType.CURRENT_MAX;
				icon = 'favorite';
				break;
			}
			case ('Speed'): {
				aspectType = AspectType.NUMBER;
				icon = 'arrow_right_alt';
				break;
			}
			default: {
				console.error('Predefined Aspect not defined');
				return;
			}
		}
		if (checked) {
			let aspect = new Aspect(aspectLabel, aspectType, true, true);
			this.characterService.addComponent(aspect);
			this.characterToolTipComponent.addAspect(aspect, icon);
		}
		else {
			let aspect = this.characterService.getAspectByLabel(aspectLabel);
			this.characterService.removeComponent(aspect);
			this.characterToolTipComponent.removeAspect(aspect.label);
		}
	}

	private addTooltipAspect = () => {
		let tooltipAspects: Aspect[] = this.characterService.getTooltipAspects();
		for (let tooltipAspect of this.characterToolTipComponent.tooltipConfig.aspects) {
			for (let i = 0; i < tooltipAspects.length; i++) {
				if (tooltipAspects[i].label.toLowerCase() === tooltipAspect.aspect.label.toLowerCase()) {
					tooltipAspects.splice(i, 1);
					break;
				}
			}
		}
		this.dialog.open(AddTooltipAspectComponent, {
			data: {
				aspects: tooltipAspects
			}
		}).afterClosed().subscribe((tooltipAspect) => {
			if (tooltipAspect) {
				this.characterToolTipComponent.addAspect(this.characterService.getAspect(tooltipAspect.label), tooltipAspect.icon);
			}
		});
	};
}
