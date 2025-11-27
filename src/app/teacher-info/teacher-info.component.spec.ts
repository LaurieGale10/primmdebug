import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherInfoComponent } from './teacher-info.component';

describe('TeacherInfoComponent', () => {
  let component: TeacherInfoComponent;
  let fixture: ComponentFixture<TeacherInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherInfoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TeacherInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
