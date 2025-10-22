import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PredictRunTestCasePaneComponent } from './predict-run-test-case-pane.component';

describe('PredictTestCasePaneComponent', () => {
  let component: PredictRunTestCasePaneComponent;
  let fixture: ComponentFixture<PredictRunTestCasePaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PredictRunTestCasePaneComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PredictRunTestCasePaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
