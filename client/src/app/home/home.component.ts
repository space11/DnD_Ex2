import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewRuleSetDialogComponent } from './dialog/new-rule-set-dialog.component';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserProfileService } from '../utilities/services/userProfile.service';


@Component({
    selector: 'home-page',
    templateUrl: 'home.component.html',
    styleUrls: ['home.component.css']
})
export class HomeComponent implements AfterViewInit {
    @ViewChild('fileInput') fileInput: ElementRef;
    public ruleSets: any[];
    private reader: FileReader = new FileReader();
    private profileImageURL;

    constructor(private dialog: MatDialog,
                private http: HttpClient,
                private router: Router,
                private userProfileService: UserProfileService) {
        this.profileImageURL = this.userProfileService.getProfilePhotoUrl();
    }

    public ngAfterViewInit(): void {
        this.getRuleSets();
    }

    public newRuleSet(): void {
        this.dialog.open(NewRuleSetDialogComponent);
    }

    public ruleSetHome(ruleSetId: string): void {
        this.router.navigate(['/rule-set', ruleSetId]);
    }

    public upload(): void {
        this.fileInput.nativeElement.click();
    }

    public loadImage(): void {
        this.reader.addEventListener('load', () => {
            this.profileImageURL = this.reader.result;
            this.userProfileService.setProfilePhotoUrl(this.profileImageURL);
        });
        if (this.fileInput.nativeElement.files[0]) {
            this.reader.readAsDataURL(this.fileInput.nativeElement.files[0]);
        }
    }

    private getRuleSets(): void {
        this.http.get('/api/ruleset/userrulesets', {responseType: 'json'}).subscribe((ruleSets: any) => {
            this.ruleSets = ruleSets;
        });
    }
}
