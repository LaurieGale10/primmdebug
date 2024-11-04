import { Component, Input, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-hint-display',
  standalone: true,
  imports: [MatExpansionModule, MatIconModule, MatButtonModule],
  templateUrl: './hint-display.component.html',
  styleUrl: './hint-display.component.sass'
})
export class HintDisplayComponent {
  readonly panelOpenState = signal(false);

  @Input({required: true})
  hints: string[] | null = null;

  hintIndex: number = 0;

  setHintIndex(hintValue: number) {
    this.hintIndex = hintValue;
  }
}
