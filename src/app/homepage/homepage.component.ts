import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ExerciseViewWidgetComponent } from "./exercise-view-widget/exercise-view-widget.component";
import { DebuggingExercise } from '../services/debugging-exercise.model';

import {MatIconModule} from '@angular/material/icon';
import {MatToolbarModule} from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';

@Component({
    selector: 'app-homepage',
    standalone: true,
    templateUrl: './homepage.component.html',
    styleUrl: './homepage.component.sass',
    imports: [NgIf, ExerciseViewWidgetComponent, MatIconModule, MatToolbarModule, MatButtonModule]
})
export class HomepageComponent implements OnInit {

    exercises: Array<DebuggingExercise> | null = null; //TODO: Look up convention regarding whether to set var that might be null/undefined before it's setter function is called

    constructor(private firestoreService: FirestoreService, private loggingService: LoggingService) { }

    ngOnInit(): void {
      if (!this.loggingService.getUserId()) {
        this.loggingService.createUserId();
      }
      this.loggingService.resetDebuggingStage();
      this.firestoreService.getUnparsedExercises().subscribe(data => {
        const unparsedExercises = data;
        this.exercises = this.firestoreService.parseDebuggingExercises(unparsedExercises);
      });
    }

}
