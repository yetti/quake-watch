import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuakeList } from "./features/quake/components/quake-list/quake-list";
import { QuakeMap } from "./features/quake/components/quake-map/quake-map";
import { QuakeFilters } from "./features/quake/components/quake-filters/quake-filters";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, QuakeList, QuakeMap, QuakeFilters],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('quake-watch');
}
