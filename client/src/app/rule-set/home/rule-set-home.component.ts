import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { NewCharacterSheetDialogComponent } from './dialog/new-character-sheet-dialog.component';
import { BehaviorSubject, Subject } from 'rxjs';
import { NewNpcDialogComponent } from './dialog/new-npc-dialog.component';
import { RuleSetRepository } from '../../repositories/rule-set.repository';
import { SubjectDataSource } from '../../utilities/subjectDataSource';
import { CharacterSheetData } from '../../../../../shared/types/rule-set/character-sheet.data';
import { DashboardCard } from '../../cdk/dashboard-card/dashboard-card';
import { RuleSetData } from '../../../../../shared/types/rule-set/rule-set.data';
import { ConfigService } from '../../data-services/config.service';

@Component({
	selector: 'rule-set-home',
	templateUrl: 'rule-set-home.component.html',
	styleUrls: ['rule-set-home.component.scss']
})
export class RuleSetHomeComponent implements OnInit {
	private ruleSetId: string;
	private ruleSet: RuleSetData;

	public characterSheets: CharacterSheetData[];
	public admins: any[];
	public npcs: any[];

	public configCard: DashboardCard;

	private readonly adminSubject: Subject<AdminData[]>;
	private adminDataSource: SubjectDataSource<AdminData>;
	public adminColumns = ['username', 'role'];

	public characterSheetCard: DashboardCard;
	private readonly characterSheetSubject: BehaviorSubject<CharacterSheetData[]>;
	private characterSheetDataSource: SubjectDataSource<CharacterSheetData>;
	public characterSheetColumns = ['label'];

	public npcCard: DashboardCard;
	private readonly npcSubject: Subject<NpcData[]>;
	private npcDataSource: SubjectDataSource<NpcData>;
	public npcColumns = ['label'];

	constructor(private activatedRoute: ActivatedRoute,
	            private dialog: MatDialog,
	            private router: Router,
	            private ruleSetRepository: RuleSetRepository,
	            private configService: ConfigService) {
		this.adminSubject = new Subject<AdminData[]>();
		this.adminDataSource = new SubjectDataSource(this.adminSubject);

		this.configCard = {
			title: 'Rule Set Config'
		};

		this.characterSheetCard = {
			menuOptions: [
				{
					title: 'New Character Sheet',
					function: this.newCharacterSheet
				}
			]
		};

		this.npcCard = {
			menuOptions: [
				{
					title: 'Create NPC',
					function: this.createNPC
				}
			]
		};

		this.characterSheetSubject = new BehaviorSubject<CharacterSheetData[]>([]);
		this.characterSheetDataSource = new SubjectDataSource<CharacterSheetData>(this.characterSheetSubject);

		this.npcSubject = new Subject<NpcData[]>();
		this.npcDataSource = new SubjectDataSource(this.npcSubject);
	}

	ngOnInit(): void {
		this.activatedRoute.params.subscribe((params) => {
			this.ruleSetId = params['ruleSetId'];
			this.ruleSetRepository.getRuleSet(this.ruleSetId).subscribe((ruleSet: RuleSetData) => {
				let completeConfig = this.configService.completeConfig(ruleSet.config);
				ruleSet.config = completeConfig;
				this.ruleSet = ruleSet;
			});
			this.ruleSetRepository.getCharacterSheets(this.ruleSetId).subscribe((characterSheets: CharacterSheetData[]) => {
				this.characterSheets = characterSheets;
				this.characterSheetSubject.next(characterSheets);
			});
			this.ruleSetRepository.getAdmin(this.ruleSetId).subscribe((admins: any[]) => {
				this.admins = admins;
				this.adminSubject.next(admins);
			});
			this.ruleSetRepository.getNpcs(this.ruleSetId).subscribe((npcs: any[]) => {
				this.npcs = npcs;
				this.npcSubject.next(npcs);
			});
		});
	}

	private newCharacterSheet = () => {
		this.dialog.open(NewCharacterSheetDialogComponent, {data: {ruleSetId: this.ruleSetId}}).afterClosed().subscribe((characterSheet: CharacterSheetData) => {
			this.router.navigate(['character-sheet', characterSheet._id]);
		});
	};

	editCharacterSheet(characterSheetId: string): void {
		this.router.navigate(['character-sheet', characterSheetId]);
	}

	editNpc(npcId: string): void {
		this.router.navigate(['npc', npcId]);
	}

	private createNPC = () => {
		this.dialog.open(NewNpcDialogComponent, {data: {characterSheets: this.characterSheets}})
				.afterClosed().subscribe((npc) => {
					if (npc) {
						this.router.navigate(['npc', npc._id]);
					}
		});
	};
}

interface AdminData {
	username: string,
	role: string
}

interface NpcData {
	_id: string,
	label: string,
	characterSheetId: string,
	ruleSetId: string,
	values: any[]
}
