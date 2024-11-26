import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentIdDialogComponent } from './student-id-dialog.component';

describe('StudentIdDialogComponent', () => {
  let component: StudentIdDialogComponent;
  let fixture: ComponentFixture<StudentIdDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentIdDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(StudentIdDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
