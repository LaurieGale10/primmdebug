import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictTestCasePaneComponent } from './predict-test-case-pane.component';

describe('PredictTestCasePaneComponent', () => {
  let component: PredictTestCasePaneComponent;
  let fixture: ComponentFixture<PredictTestCasePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictTestCasePaneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PredictTestCasePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
