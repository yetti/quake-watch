import { Component } from '@angular/core';
import { Globe } from '@primeicons/angular/globe';
import { MenubarModule } from 'primeng/menubar';
import { PanelModule } from 'primeng/panel';
import { environment } from '../environments/environment';
import { QuakeList } from './features/quakes/quake-list/quake-list';

@Component({
  selector: 'app-root',
  imports: [Globe, MenubarModule, PanelModule, QuakeList],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = environment.title;
}
