import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserProfile } from '../types/userProfile';
import { AlertService } from '../alert/alert.service';
import { UserProfileService } from '../data-services/userProfile.service';
import { MatDialog } from '@angular/material';
import { SelectFriendsComponent } from '../social/select-friends/select-friends.component';
import { NewEncounterDialogComponent } from './dialog/new-encounter-dialog.component';
import { SubjectDataSource } from '../utilities/subjectDataSource';
import { mergeMap, tap } from 'rxjs/operators';
import { DashboardCard } from '../cdk/dashboard-card/dashboard-card';
import { CampaignPageService } from './campaign-page.service';
import { NewCharacterDialogComponent } from '../rule-set/home/dialog/new-character-dialog.component';
import { CharacterSheetData } from '../../../../shared/types/rule-set/character-sheet.data';
import { RuleSetRepository } from '../repositories/rule-set.repository';
import { CharacterData } from '../../../../shared/types/character.data';
import { EncounterData } from '../../../../shared/types/encounter/encounter.data';
import { MqService } from '../mq/mq.service';
import { RightsService } from '../data-services/rights.service';
import { timer } from 'rxjs';
import { isUndefined } from 'util';
import { BreadCrumbService } from '../bread-crumb/bread-crumb.service';

@Component({
	selector: 'campaign-page',
	templateUrl: 'campaign.component.html',
	styleUrls: ['campaign.component.scss']
})
export class CampaignComponent implements OnInit, OnDestroy {
	private campaignId;

	public membersCard: DashboardCard;
	public memberDataSource: SubjectDataSource<UserProfile>;
	public memberTableCols = ['users', 'gm'];

	public encountersCard: DashboardCard;
	public encounterDataSource: SubjectDataSource<EncounterData>;
	public encounterTableCols = ['label', 'date', 'options'];

	public charactersCard: DashboardCard;
	public characterDataSource: SubjectDataSource<CharacterData>;
	public characterTableCols = ['label', 'options'];

	constructor(private activatedRoute: ActivatedRoute,
	            public campaignPageService: CampaignPageService,
	            private alertService: AlertService,
	            public userProfileService: UserProfileService,
	            private dialog: MatDialog,
	            private ruleSetRepo: RuleSetRepository,
	            private mqService: MqService,
	            public rightsService: RightsService,
	            private breadCrumbService: BreadCrumbService,
	            private router: Router) {
	}

	ngOnInit(): void {
		this.activatedRoute.params
				.pipe(
						tap((params) => {
							this.campaignId = params['campaignId'];
							if (this.campaignId !== this.campaignPageService.campaignId) {
								this.campaignPageService.setCampaignId(this.campaignId);
							}
						}),
						mergeMap(() => {
							return this.campaignPageService.isReadyObservable;
						})
				).subscribe((isReady: boolean) => {
			if (isReady) {
				this.memberDataSource = new SubjectDataSource(this.campaignPageService.membersSubject);
				this.encounterDataSource = new SubjectDataSource(this.campaignPageService.encounterSubject);
				this.characterDataSource = new SubjectDataSource(this.campaignPageService.characterSubject);
				this.rightsService.setCampaignService(this.campaignPageService);
				this.breadCrumbService.addCrumb(this.campaignPageService.campaignState.label, `campaign/${this.campaignId}`)
			}
		});

		this.encountersCard = {
			menuOptions: [
				{
					label: 'New Encounter',
					function: this.newEncounter
				}
			]
		};

		this.membersCard = {
			menuOptions: [
				{
					label: 'Invite Friends',
					function: this.inviteFriends
				}
			]
		};

		this.charactersCard = {
			menuOptions: [
				{
					label: 'Create New Character',
					function: this.createCharacter
				}
			]
		};
	}

	ngOnDestroy(): void {
		// this.campaignPageService.unInit();
	}

	public changeGameMaster(member: any): void {
	  // make sure there is at least one game master left
	  let remainingMaster = false;
	  member.gameMaster = !member.gameMaster;
	  for (let i = 0; i < this.campaignPageService.members.length; i++) {
	    remainingMaster = remainingMaster || this.rightsService.isCampaignGM(this.campaignPageService.members[i]._id);
	  }
	  if (!remainingMaster) {
	    timer(100).subscribe(() => {
	      member.gameMaster = true;
	    });
	    this.alertService.showAlert('There must be at least one game master');
	  }
	  else {
	  	this.campaignPageService.setIsGameMaster(member._id, member.gameMaster);
	  }
	}

	public enterEncounter(encounter: EncounterData): void {
		this.router.navigate(['encounter', encounter._id])
	}

	public deleteEncounter(encounter: EncounterData): void {
		this.campaignPageService.deleteEncounter(encounter._id);
	}

	public openEncounter(encounter: EncounterData): void {
		this.campaignPageService.openEncounter(encounter._id);
	}

	public closeEncounter(encounter: EncounterData): void {
		this.campaignPageService.closeEncounter(encounter._id);
	}

	public editCharacter(characterId: string): void {
		this.router.navigate(['character', characterId]);
	}

	public deleteCharacter(character: CharacterData): void {
		this.campaignPageService.deleteCharacter(character._id);
	}

	private inviteFriends = () => {
		let dialogRef = this.dialog.open(SelectFriendsComponent);
		dialogRef.afterClosed().subscribe((friends: UserProfile[]) => {
			if (!isUndefined(friends)) {
				this.campaignPageService.sendInvitations(friends);
			}
		});
	};

	private newEncounter = () => {
		this.dialog.open(NewEncounterDialogComponent);
	};

	private createCharacter = () => {
		this.ruleSetRepo.getCharacterSheets(this.campaignPageService.campaignState.ruleSetId).subscribe((characterSheets: CharacterSheetData[]) => {
			this.dialog.open(NewCharacterDialogComponent, {
				data: {
					campaignId: this.campaignId,
					characterSheets: characterSheets,
					isNpc: false
				}
			}).afterClosed().subscribe((character) => {
				this.mqService.sendCampaignUpdate(this.campaignId);
				if (character) {
					this.router.navigate(['character', character._id]);
				}
			});
		});
	};
}
