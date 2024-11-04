import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrimmDebugViewComponent } from './primm-debug-view.component';

describe('PrimmDebugViewComponent', () => {
  let component: PrimmDebugViewComponent;
  let fixture: ComponentFixture<PrimmDebugViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrimmDebugViewComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimmDebugViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
