import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { ProfileService } from './profile/profile.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HomeModule } from './home/home.module';
import { MapMakerModule } from './map-maker/map-maker.module';
import { CharacterMakerModule } from './character-maker/character-maker.module';
import { MatButtonModule, MatIconModule, MatMenuModule, MatTabsModule } from '@angular/material';

@NgModule({
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        AppRoutingModule,
        MatTabsModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatMenuModule,
        HomeModule,
        MapMakerModule,
        MatIconModule,
        CharacterMakerModule
    ],
    declarations: [
        AppComponent,
        NavbarComponent
    ],
    providers: [
        ProfileService
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule {
}
