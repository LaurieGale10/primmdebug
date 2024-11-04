import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExerciseViewWidgetComponent } from './exercise-view-widget.component';

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
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
