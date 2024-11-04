import { Component, OnInit, Input, signal } from '@angular/core';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { TestCase } from '../../services/debugging-exercise.model';

@Component({
  selector: 'app-test-case-display',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './test-case-display.component.html',
  styleUrl: './test-case-display.component.sass'
})
export class TestCaseDisplayComponent implements OnInit {

  readonly panelOpenState = signal(false);

  @Input({required: true})
  testCases: TestCase[] | null = null;

  testCaseIndex: number = 0;

  disableAnimation: boolean = true; //Fix to avoid expansion panel expanding on animation of parent div 

  ngOnInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }

  setCurrentTestCaseValue(testCaseValue: number) {
    this.testCaseIndex = testCaseValue;
  }
}
