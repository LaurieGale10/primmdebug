import { Component, inject } from '@angular/core';
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { Analytics } from '@angular/fire/analytics';

@Component({
  selector: 'app-teacher-info',
  standalone: true,
  imports: [ToolbarComponent],
  templateUrl: './teacher-info.component.html',
  styleUrl: './teacher-info.component.sass'
})
export class TeacherInfoComponent {
  private analytics = inject(Analytics);

}
