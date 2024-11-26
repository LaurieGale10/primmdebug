import { Component } from '@angular/core';
import { LoggingService } from '../services/logging.service';

@Component({
  selector: 'app-student-id-dialog',
  standalone: true,
  imports: [],
  templateUrl: './student-id-dialog.component.html',
  styleUrl: './student-id-dialog.component.sass'
})
export class StudentIdDialogComponent {

  constructor(private loggingService: LoggingService) { }

}
