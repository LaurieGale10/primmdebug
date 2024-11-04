import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HintDisplayComponent } from './hint-display.component';

describe('HintDisplayComponent', () => {
  let component: HintDisplayComponent;
  let fixture: ComponentFixture<HintDisplayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HintDisplayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HintDisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
