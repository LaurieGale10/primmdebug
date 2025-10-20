import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { BottomToolbarComponent } from '../bottom-toolbar/bottom-toolbar.component';
import { Analytics } from '@angular/fire/analytics';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [ToolbarComponent, BottomToolbarComponent, MatButtonModule, MatDividerModule],
  templateUrl: './homepage.component.html',
  styleUrls: ['./homepage.component.sass'],
  animations: [
    trigger('expandRetract', [
      state('expanded', style({
        transform: 'scale(1.15)', // Enlarged size
      })),
      state('retracted', style({
        transform: 'scale(1)', // Original size
      })),
      transition('expanded <=> retracted', [
        animate('300ms ease-in-out') // Animation duration and easing
      ])
    ])
  ]
})
export class HomepageComponent {
  private analytics = inject(Analytics);
  
  constructor(private router: Router) { }

  toChallengeDashboard() {
    let route = '/dashboard';
    this.router.navigate([route]);
  }

  toTeacherInfo() {
    let route = '/teacher-info';
    this.router.navigate([route]);
  }

  // Updated the imageStates property to use hover-based logic
  imageStates: { [key: string]: string } = {
    flowchart: 'retracted',
    code: 'retracted',
    reflection: 'retracted'
  };

  // Hover event handlers
  onMouseEnter(image: string): void {
    this.imageStates[image] = 'expanded';
  }

  onMouseLeave(image: string): void {
    this.imageStates[image] = 'retracted';
  }
}
