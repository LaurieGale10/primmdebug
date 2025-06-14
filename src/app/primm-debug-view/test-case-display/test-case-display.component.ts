import { Component, OnInit, Input, signal } from '@angular/core';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TestCase } from '../../services/debugging-exercise.model';
import { LoggingService } from '../../services/logging.service';
import { PaneView } from '../../services/logging.model';
import { WhitespacePreserverPipe } from '../../pipes/whitespace-preserver.pipe';

@Component({
  selector: 'app-test-case-display',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule, MatButtonModule, WhitespacePreserverPipe],
  templateUrl: './test-case-display.component.html',
  styleUrl: './test-case-display.component.sass'
})
export class TestCaseDisplayComponent implements OnInit {

  readonly panelOpenState = signal(false);

  @Input({required: true})
  testCases: TestCase[] | null = [];

  @Input({required: true})
  studentPredictions: string[] | undefined;

  testCaseIndex: number = 0;

  disableAnimation: boolean = true; //Fix to avoid expansion panel expanding on animation of parent div 

  constructor(private loggingService: LoggingService, private whitespacePreserverPipe: WhitespacePreserverPipe) {}

  ngOnInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }

  onPanelExpansionChange(expanded: boolean) {
    this.panelOpenState.set(expanded);
    this.loggingService.addTestCaseLog({
      newPaneView: expanded ? PaneView.open : PaneView.closed,
      time: new Date()
    })
  }

  setCurrentTestCaseValue(testCaseValue: number) {
    this.testCaseIndex = testCaseValue;
    this.loggingService.addTestCaseLog({
      newContent: "Test case "+(this.testCaseIndex + 1).toString(),
      time: new Date()
    })
  }
}
