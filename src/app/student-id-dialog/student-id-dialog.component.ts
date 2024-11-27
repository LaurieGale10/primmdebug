import { Component } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import {FormsModule} from '@angular/forms';

import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import { FirestoreService } from '../services/firestore.service';

@Component({
  selector: 'app-student-id-dialog',
  standalone: true,
  imports: [MatDialogContent, MatDialogActions, MatDialogTitle, MatDialogClose, MatButton, MatFormFieldModule, MatInputModule, MatIcon, FormsModule],
  templateUrl: './student-id-dialog.component.html',
  styleUrl: './student-id-dialog.component.sass'
})
export class StudentIdDialogComponent {

  firstWord: string | undefined;
  secondWord: string | undefined;

  constructor(private firestoreService: FirestoreService, private loggingService: LoggingService) { }

  submitId() {
    const id = this.firstWord!.toLowerCase() + "-" + this.secondWord!.toLowerCase();
    this.firestoreService.validateStudentId(id).then((validId) => {
      if (validId) {
        console.log("Valid student ID")
        this.loggingService.setStudentId(id);
      }
      else {
        console.log("Invalid student ID")
        //Add error message in front end
      }
    })
  }

}
