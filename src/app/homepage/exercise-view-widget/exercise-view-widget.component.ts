import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DebuggingExercise, Difficulty } from '../../services/debugging-exercise.model';
import { Router } from '@angular/router';
import { LimitStringPipe  } from '../../pipes/limit-string.pipe';

@Component({
  selector: 'app-exercise-view-widget',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIconModule, LimitStringPipe],
  templateUrl: './exercise-view-widget.component.html',
  styleUrl: './exercise-view-widget.component.sass'
})
export class ExerciseViewWidgetComponent {

  @Input() exerciseData: DebuggingExercise | null = null;

  DifficultyType = Difficulty; //To allow reference to enum types in interpolation

  constructor(private router: Router) { };

  loadExercise() {
    let route = '/exercise';
    this.router.navigate([route], { queryParams: {id: this.exerciseData!.id}});
  }
}
