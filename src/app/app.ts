import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuakeList } from "./features/quake/components/quake-list/quake-list";
import { QuakeMap } from "./features/quake/components/quake-map/quake-map";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, QuakeList, QuakeMap],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('quake-watch');
}
