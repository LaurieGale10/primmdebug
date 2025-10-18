import { Component } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';

@Component({
  selector: 'app-teacher-info',
  standalone: true,
  imports: [ToolbarComponent],
  templateUrl: './teacher-info.component.html',
  styleUrl: './teacher-info.component.sass'
})
export class TeacherInfoComponent {

}
