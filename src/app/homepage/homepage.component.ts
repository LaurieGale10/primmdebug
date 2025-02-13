import { Component, OnInit } from '@angular/core';
import { ExerciseViewWidgetComponent } from "./exercise-view-widget/exercise-view-widget.component";
import { DebuggingExercise } from '../services/debugging-exercise.model';

import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import { MatDialog } from '@angular/material/dialog';
import { StudentIdDialogComponent } from '../student-id-dialog/student-id-dialog.component';
import { environment } from '../../environments/environment.development';

@Component({
    selector: 'app-homepage',
    standalone: true,
    templateUrl: './homepage.component.html',
    styleUrl: './homepage.component.sass',
    imports: [ExerciseViewWidgetComponent, MatIconModule, MatToolbarModule, MatButtonModule]
})
export class HomepageComponent implements OnInit {

    exercises: Array<DebuggingExercise> | null = null; //TODO: Look up convention regarding whether to set var that might be null/undefined before it's setter function is called

    displaySurveyButton: boolean = false;

    constructor(private firestoreService: FirestoreService, private loggingService: LoggingService, private dialog: MatDialog) { }

    ngOnInit(): void {
      this.loggingService.resetDebuggingStage();
      this.firestoreService.getUnparsedExercises().subscribe(data => {
        const unparsedExercises = data;
        this.exercises = this.firestoreService.parseDebuggingExercises(unparsedExercises);
      });

      if (environment.logChanges && !this.loggingService.getStudentId()) {
        if (!sessionStorage.getItem("studentId")) {
          this.openToStudentDialog();
        }
        else {
          this.loggingService.setStudentId(sessionStorage.getItem("studentId")!);
        }
      }
      this.verifyDisplayStudentButton();
    }

    verifyDisplayStudentButton() {
      if (environment.logChanges && this.loggingService.getStudentId()) {
        this.firestoreService.getStudentSchool(this.loggingService.getStudentId()!).then((school) => {
          if (school && environment.surveyDates.has(school)) {
            const surveyStartDate: Date = environment.surveyDates.get(school)!.get("startDate")!;
            const surveyEndDate: Date = environment.surveyDates.get(school)!.get("endDate")!;
            const now: Date = new Date();
            if (now >= surveyStartDate && now <= surveyEndDate) {
              this.displaySurveyButton = true;
            }
          }
        });
      }
    }

    openSurvey() {
      window.open(environment.surveyLink+"?student_id="+this.loggingService.getStudentId(), "_blank");
    }

    openToStudentDialog() {
      const dialogRef = this.dialog.open(StudentIdDialogComponent, {disableClose: true}).afterClosed().subscribe(result => {
        this.verifyDisplayStudentButton();
      });
    }

}
