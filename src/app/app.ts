import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { QuakeList } from "./features/list/components/quake-list/quake-list";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, QuakeList],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('quake-watch');
}
