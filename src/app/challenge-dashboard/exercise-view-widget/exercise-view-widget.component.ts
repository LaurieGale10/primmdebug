import { Component, Input, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DebuggingExercise, Difficulty } from '../../services/debugging-exercise.model';
import { Router } from '@angular/router';
import { LimitStringPipe  } from '../../pipes/limit-string.pipe';
import { SessionManagerService } from '../../services/session-manager.service';
import { ChallengeProgress } from '../../types/types';

@Component({
  selector: 'app-exercise-view-widget',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIconModule, LimitStringPipe],
  templateUrl: './exercise-view-widget.component.html',
  styleUrl: './exercise-view-widget.component.sass'
})
export class ExerciseViewWidgetComponent implements OnInit {

  @Input() exercise: DebuggingExercise | null = null;

  challengeProgress: ChallengeProgress = ChallengeProgress.unattempted;

  ChallengeProgressType = ChallengeProgress; //To allow reference to enum types in interpolation

  DifficultyType = Difficulty; //To allow reference to enum types in interpolation

  constructor(private router: Router, private sessionManagerService: SessionManagerService) { }
  
  ngOnInit(): void {
    if (this.sessionManagerService.getChallengeProgress(this.exercise!.id) !== null) {
      console.log(this.challengeProgress)
      this.challengeProgress = this.sessionManagerService.getChallengeProgress(this.exercise!.id)!;
    }//Quite messy at the moment
  }

  loadExercise() {
    let route = '/exercise';
    this.router.navigate([route], { queryParams: {id: this.exercise!.id}});
  }
}
