import 'reflect-metadata';
import { AppModule } from './app/app.module';
import {platformBrowserDynamic} from "@angular/platform-browser-dynamic";
import 'hammerjs/hammer';

platformBrowserDynamic().bootstrapModule(AppModule);
