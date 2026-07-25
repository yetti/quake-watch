import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { Globe } from '@primeicons/angular/globe';
import { MenubarModule } from 'primeng/menubar';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-root',
  imports: [Globe, MenubarModule, PanelModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = environment.title;
}
