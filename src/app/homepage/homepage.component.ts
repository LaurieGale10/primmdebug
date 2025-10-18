import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToolbarComponent } from '../toolbar/toolbar.component';

import {MatButtonModule} from '@angular/material/button';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [ToolbarComponent, MatButtonModule],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.sass'
})
export class HomepageComponent {

  constructor(private router: Router) { }

  toChallengeDashboard() {
    let route = '/dashboard';
    this.router.navigate([route]);
  }

  toTeacherInfo() {
    let route = '/teacher-info';
    this.router.navigate([route]);
  }
}
