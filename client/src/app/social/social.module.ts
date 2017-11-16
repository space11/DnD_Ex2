import { NgModule } from '@angular/core';
import { AddFriendComponent } from './add-friend/add-friend.component';
import { MatButtonModule, MatIconModule, MatInputModule, MatTableModule } from '@angular/material';
import { SocialRepository } from './social.repository';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { SocialService } from './social.service';

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        MatTableModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule
    ],
    declarations: [
        AddFriendComponent
    ],
    entryComponents: [
        AddFriendComponent
    ],
    providers: [
        SocialRepository,
        SocialService
    ],
    exports: [
        AddFriendComponent
    ]
})
export class SocialModule {

}