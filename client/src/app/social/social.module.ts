import { NgModule } from '@angular/core';
import { AddFriendComponent } from './add-friend/add-friend.component';
import { MatButtonModule, MatInputModule, MatTableModule } from '@angular/material';
import { SocialRepository } from './social.repository';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        MatTableModule,
        MatInputModule,
        MatButtonModule
    ],
    declarations: [
        AddFriendComponent
    ],
    entryComponents: [
        AddFriendComponent
    ],
    providers: [
        SocialRepository
    ],
    exports: [
        AddFriendComponent
    ]
})
export class SocialModule {

}