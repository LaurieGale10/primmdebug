import { Component, Input, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { LoggingService } from '../../services/logging.service';
import { PaneView } from '../../services/logging.model';

@Component({
  selector: 'app-hint-display',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './hint-display.component.html',
  styleUrl: './hint-display.component.sass'
})
export class HintDisplayComponent {
  panelOpenState = signal(false);

  @Input({required: true})
  hints: string[] | undefined;

  @Input()
  set debuggingStage(value: any) {
    this.panelOpenState.set(false);
    this.hintIndex = 0;
  }

  hintIndex: number = 0;

  disableAnimation: boolean = true; //Fix to avoid expansion panel expanding on animation of parent div 

  constructor(private loggingService: LoggingService) { }

  onPanelExpansionChange(expanded: boolean) {
    this.panelOpenState.set(expanded);
    this.loggingService.addHintLog({
      newPaneView: expanded ? PaneView.open : PaneView.closed,
      time: new Date()
    })
  }

  setHintIndex(hintValue: number) {
    this.hintIndex = hintValue;
    this.loggingService.addHintLog({
      newContent: "Test case "+(this.hintIndex + 1).toString(),
      time: new Date()
    });
  }
}
