import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ExerciseViewWidgetComponent } from './exercise-view-widget.component';
import { ChallengeProgress } from '../../types/types';

describe('ExerciseViewWidgetComponent', () => {
  let component: ExerciseViewWidgetComponent;
  let fixture: ComponentFixture<ExerciseViewWidgetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExerciseViewWidgetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ExerciseViewWidgetComponent);
    component = fixture.componentInstance;

    // Add a valid exercise object to the component
    component.exercise = {
      id: 'mock-exercise-id',
      title: 'Mock Exercise',
      description: 'This is a mock exercise for testing purposes.',
      program: 'print("Hello, World!")',
      testCases: []
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not display progress-status--attempted or progress-status--completed divs if no progress is made', () => {
    spyOn(localStorage, 'getItem').and.returnValue(null);
    fixture.detectChanges();

    const attemptedDiv: DebugElement = fixture.debugElement.query(By.css('.progress-status--attempted'));
    const completedDiv: DebugElement = fixture.debugElement.query(By.css('.progress-status--completed'));

    expect(attemptedDiv).toBeNull();
    expect(completedDiv).toBeNull();
  });

  it('should display the progress-status--attempted div if a debugging stage is attempted but no successful change is made', () => {
    localStorage.setItem('mock-exercise-id', ChallengeProgress.attempted);
    fixture.detectChanges();

    const attemptedDiv: DebugElement = fixture.debugElement.query(By.css('.progress-status--attempted'));
    const completedDiv: DebugElement = fixture.debugElement.query(By.css('.progress-status--completed'));

    expect(attemptedDiv).not.toBeNull();
    expect(completedDiv).toBeNull();
  });

  it('should display the progress-status--completed div if a successful change is made', () => {
    localStorage.setItem('mock-exercise-id', ChallengeProgress.completed);
    fixture.detectChanges();

    const attemptedDiv: DebugElement = fixture.debugElement.query(By.css('.progress-status--attempted'));
    const completedDiv: DebugElement = fixture.debugElement.query(By.css('.progress-status--completed'));

    expect(attemptedDiv).toBeNull();
    expect(completedDiv).not.toBeNull();
  });
});
