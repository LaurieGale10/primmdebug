import { Component } from '@angular/core';
import {MatToolbarModule} from '@angular/material/toolbar';
import { Router } from '@angular/router';


@Component({
  selector: 'app-bottom-toolbar',
  standalone: true,
  imports: [MatToolbarModule],
  templateUrl: './bottom-toolbar.component.html',
  styleUrl: './bottom-toolbar.component.sass'
})
export class BottomToolbarComponent {

  constructor(private router: Router) { }

  toTeacherInfo() {
    let route = '/teacher-info';
    this.router.navigate([route]);
  }
}
