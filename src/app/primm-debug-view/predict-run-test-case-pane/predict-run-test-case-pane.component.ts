import { Component, EventEmitter, Input, model, Output } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatInputModule} from '@angular/material/input';
import { DebuggingStage } from '../../types/types';

@Component({
  selector: 'app-predict-run-test-case-pane',
  standalone: true,
  imports: [MatIconModule, FormsModule, MatInputModule],
  templateUrl: './predict-run-test-case-pane.component.html',
  styleUrl: './predict-run-test-case-pane.component.sass'
})
export class PredictRunTestCasePaneComponent {

  @Input()
  testCaseInput: string[] | undefined;

  @Input({required: true})
  debuggingStage: DebuggingStage.predict | DebuggingStage.run | undefined;

  @Input({required: true})
  studentPrediction: string | undefined;

  @Output()
  onKeyDown: EventEmitter<Event> = new EventEmitter<Event>();

  prediction = model<string | null>("");

  DebuggingStageType = DebuggingStage; //To allow reference to enum types in interpolation

  onKeydown($event: Event) {
    this.onKeyDown.emit($event);
  }
}
