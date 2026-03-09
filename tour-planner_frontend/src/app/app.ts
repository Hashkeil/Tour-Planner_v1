import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Registeration} from './registeration/registeration';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Registeration],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('tour-planner');
}
