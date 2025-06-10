import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToHomeDialogComponent } from './to-home-dialog.component';

describe('ToHomeDialogComponent', () => {
  let component: ToHomeDialogComponent;
  let fixture: ComponentFixture<ToHomeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToHomeDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ToHomeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
