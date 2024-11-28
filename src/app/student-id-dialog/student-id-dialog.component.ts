import { Component, ViewChild } from '@angular/core';
import { LoggingService } from '../services/logging.service';
import {FormsModule} from '@angular/forms';

import { MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
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

  @ViewChild("submitButton")
  submitButton: HTMLButtonElement | undefined;

  firstWord: string | null = null;
  secondWord: string | undefined;
  invalidInput: boolean = false;

  constructor(private firestoreService: FirestoreService, private loggingService: LoggingService, private dialogRef: MatDialogRef<StudentIdDialogComponent>) { }

  submitId() {
    const id = this.firstWord!.toLowerCase() + "-" + this.secondWord!.toLowerCase();
    this.firestoreService.validateStudentId(id).then((validId) => {
      if (validId) {
        this.loggingService.setStudentId(id);
        //Some feedback/animation needed here
        this.dialogRef.close();
      }
      else {
        console.log("Invalid student ID")
        this.invalidInput = true;
        this.submitButton!.disabled = true;

        setTimeout(
          () =>{
            this.submitButton!.disabled = false;
          },1500);
      }
    })
  }

}
