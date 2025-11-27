import { Component, Input, OnInit, signal } from '@angular/core';

import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoggingService } from '../../services/logging.service';//TODO: Implement logging (likely requires refactoring of pane-expansion-style logging)
import { PaneView } from '../../services/logging.model';

@Component({
  selector: 'app-previous-hypotheses-pane',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './previous-hypotheses-pane.component.html',
  styleUrl: './previous-hypotheses-pane.component.sass'
})
export class PreviousHypothesesPaneComponent implements OnInit {
  readonly panelOpenState = signal(false);

  @Input({required: true})
  previousHypotheses: (string | null)[] = [];

  previousHypothesisIndex: number = 0;

  disableAnimation: boolean = true; //Fix to avoid expansion panel expanding on animation of parent div 

  ngOnInit(): void {
    setTimeout(() => this.disableAnimation = false);
  }

  onPanelExpansionChange(expanded: boolean) {
    this.panelOpenState.set(expanded);
    //TODO: Add logging
  }

  setPreviousHypothesisIndex(index: number) {
    this.previousHypothesisIndex = index;
    //TODO: Add logging
  }
}
