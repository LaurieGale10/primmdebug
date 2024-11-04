import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestCaseDisplayComponent } from './test-case-display.component';

describe('TestCaseDisplayComponent', () => {
  let component: TestCaseDisplayComponent;
  let fixture: ComponentFixture<TestCaseDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestCaseDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TestCaseDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
