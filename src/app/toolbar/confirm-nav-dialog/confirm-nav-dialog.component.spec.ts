import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmNavDialogComponent } from './confirm-nav-dialog.component';

describe('ConfirmNavDialogComponent', () => {
  let component: ConfirmNavDialogComponent;
  let fixture: ComponentFixture<ConfirmNavDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmNavDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmNavDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
