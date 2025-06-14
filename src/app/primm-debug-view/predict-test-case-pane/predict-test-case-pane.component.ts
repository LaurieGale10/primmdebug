import { Component, EventEmitter, Input, model, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';

@Component({
  selector: 'app-predict-test-case-pane',
  standalone: true,
  imports: [MatIconModule, FormsModule, MatInputModule],
  templateUrl: './predict-test-case-pane.component.html',
  styleUrl: './predict-test-case-pane.component.sass'
})
export class PredictTestCasePaneComponent {

  @Input()
  testCaseInput: string[] | undefined;

  @Output()
  onKeyDown: EventEmitter<Event> = new EventEmitter<Event>();

  prediction = model<string | null>("");

  onKeydown($event: Event) {
    this.onKeyDown.emit($event);
  }
}
