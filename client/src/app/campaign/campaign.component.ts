import { Component, OnInit } from '@angular/core';
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
import { EncounterStateData } from '../../../../shared/types/encounter/encounterState';
import { CampaignPageService } from './campaign-page.service';


@Component({
	selector: 'campaign-page',
	templateUrl: 'campaign.component.html',
	styleUrls: ['campaign.component.css']
})
export class CampaignComponent implements OnInit {
	private campaignId;

	public membersCard: DashboardCard;
	public memberDataSource: SubjectDataSource<UserProfile>;
	public memberTableCols = ['users', 'gm'];

	public encountersCard: DashboardCard;
	public encounterDataSource: SubjectDataSource<EncounterStateData>;
	public encounterTableCols = ['label', 'date'];

	constructor(private activatedRoute: ActivatedRoute,
							private campaignPageService: CampaignPageService,
							private alertService: AlertService,
							private userProfileService: UserProfileService,
							private dialog: MatDialog,
							private router: Router) {
	}

	ngOnInit(): void {
		this.activatedRoute.params
		 .pipe(
		  tap((params) => {
				this.campaignId = params['campaignId'];
				this.campaignPageService.setCampaignId(this.campaignId);
			}),
			mergeMap(() => {
				return this.campaignPageService.isReady();
			})
		 ).subscribe((isReady: boolean) => {
			if (isReady) {
				this.memberDataSource = new SubjectDataSource(this.campaignPageService.membersSubject);
				this.encounterDataSource = new SubjectDataSource(this.campaignPageService.encounterSubject);
			}
		});

		this.encountersCard = {
			menuOptions: [
				{
					title: 'New Encounter',
					function: this.newEncounter
				}
			]
		};

		this.membersCard = {
			menuOptions: [
				{
					title: 'Invite Friends',
					function: this.inviteFriends
				}
			]
		}
	}

	// public changeGameMaster(member: any): void {
	//   // make sure there is at least one game master left
	//   let remainingMaster = false;
	//   for (let i = 0; i < this.members.length; i++) {
	//     remainingMaster = remainingMaster || this.members[ i ].gameMaster;
	//   }
	//   if (!remainingMaster) {
	//     Observable.timer(100).subscribe(() => {
	//       member.gameMaster = true;
	//     });
	//     this.alertService.showAlert('There must be at least one game master');
	//   }
	// }

	public enterEncounter(encounter: EncounterStateData): void {
		this.router.navigate(['encounter', encounter._id])
	}

	private inviteFriends = () => {
		let dialogRef = this.dialog.open(SelectFriendsComponent);
		dialogRef.componentInstance.friendsSelected.subscribe((friends: UserProfile[]) => {
			this.campaignPageService.sendInvitations(friends);
		});
	};

	private newEncounter = () => {
		this.dialog.open(NewEncounterDialogComponent);
	};
}
