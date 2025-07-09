import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

import { HintDisplayComponent } from './hint-display.component';
import { LoggingService } from '../../services/logging.service';
import { DebuggingStage } from '../../types/types';
import { PaneView } from '../../services/logging.model';

describe('HintDisplayComponent', () => {
  let component: HintDisplayComponent;
  let fixture: ComponentFixture<HintDisplayComponent>;
  let loggingService: jasmine.SpyObj<LoggingService>;

  beforeEach(async () => {
    const loggingServiceSpy = jasmine.createSpyObj('LoggingService', ['addHintLog']);

    await TestBed.configureTestingModule({
      imports: [HintDisplayComponent, NoopAnimationsModule],
      providers: [
        { provide: LoggingService, useValue: loggingServiceSpy }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(HintDisplayComponent);
    component = fixture.componentInstance;
    loggingService = TestBed.inject(LoggingService) as jasmine.SpyObj<LoggingService>;
    
    // Set required input
    component.hints = ['First hint', 'Second hint', 'Third hint'];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('debuggingStage input changes', () => {
    it('should close the panel when debuggingStage changes from inspectCode to fixError', () => {
      // Arrange: Open the panel first
      component.panelOpenState.set(true);
      expect(component.panelOpenState()).toBe(true);

      // Act: Change debugging stage from inspectCode to fixError
      component.debuggingStage = DebuggingStage.fixError;

      // Assert: Panel should be closed
      expect(component.panelOpenState()).toBe(false);
    });

    it('should close the panel when debuggingStage changes to any value', () => {
      // Arrange: Open the panel first
      component.panelOpenState.set(true);
      expect(component.panelOpenState()).toBe(true);

      // Act: Change debugging stage to any value
      component.debuggingStage = DebuggingStage.spotDefect;

      // Assert: Panel should be closed
      expect(component.panelOpenState()).toBe(false);
    });

    it('should reset hintIndex when debuggingStage changes', () => {
      // Arrange: Set hint index to something other than 0
      component.hintIndex = 2;
      component.debuggingStage = DebuggingStage.inspectCode;

      // Act: Change debugging stage
      component.debuggingStage = DebuggingStage.fixError;

      // Assert: Hint index should be reset to 0
      expect(component.hintIndex).toBe(0);
    });
  });

  describe('panel display and content', () => {
    it('should display correct title when panel is closed', () => {
      // Arrange: Ensure panel is closed
      component.panelOpenState.set(false);
      fixture.detectChanges();

      // Act & Assert: Check title
      const titleElement = fixture.debugElement.query(By.css('mat-panel-title'));
      expect(titleElement.nativeElement.textContent.trim()).toContain('Need a Hint?');
    });

    it('should display correct title with hint number when panel is open', () => {
      // Arrange: Open panel and set hint index
      component.panelOpenState.set(true);
      component.hintIndex = 1;
      fixture.detectChanges();

      // Act & Assert: Check title shows hint number
      const titleElement = fixture.debugElement.query(By.css('mat-panel-title'));
      expect(titleElement.nativeElement.textContent.trim()).toContain('Hint 2');
    });

    it('should display correct hint content when panel is open', () => {
      // Arrange: Open panel and set hint index
      component.panelOpenState.set(true);
      component.hintIndex = 1;
      fixture.detectChanges();

      // Act & Assert: Check hint content
      const hintContentElement = fixture.debugElement.query(By.css('.hint-content'));
      expect(hintContentElement.nativeElement.textContent.trim()).toBe('Second hint');
    });

    it('should show navigation buttons when multiple hints exist', () => {
      // Arrange: Open panel with multiple hints
      component.panelOpenState.set(true);
      component.hints = ['First hint', 'Second hint', 'Third hint'];
      fixture.detectChanges();

      // Act & Assert: Check navigation buttons exist
      const navigationButtons = fixture.debugElement.queryAll(By.css('.expansion-panel-switch-buttons button'));
      expect(navigationButtons.length).toBe(2);
    });

    it('should disable previous button when on first hint', () => {
      // Arrange: Open panel on first hint
      component.panelOpenState.set(true);
      component.hintIndex = 0;
      fixture.detectChanges();

      // Act & Assert: Check previous button is disabled
      const previousButton = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons button:first-child'));
      expect(previousButton.nativeElement.disabled).toBe(true);
    });

    it('should disable next button when on last hint', () => {
      // Arrange: Open panel on last hint
      component.panelOpenState.set(true);
      component.hintIndex = 2; // Last hint (index 2 of 3 hints)
      fixture.detectChanges();

      // Act & Assert: Check next button is disabled
      const nextButton = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons button:last-child'));
      expect(nextButton.nativeElement.disabled).toBe(true);
    });
  });

  describe('panel interaction', () => {
    it('should log panel expansion when opened', () => {
      // Arrange: Panel is closed
      component.panelOpenState.set(false);
      loggingService.addHintLog.calls.reset();

      // Act: Open panel
      component.onPanelExpansionChange(true);

      // Assert: Should log panel opening
      expect(loggingService.addHintLog).toHaveBeenCalledWith({
        newPaneView: PaneView.open,
        time: jasmine.any(Date)
      });
      expect(component.panelOpenState()).toBe(true);
    });

    it('should log panel collapse when closed', () => {
      // Arrange: Panel is open
      component.panelOpenState.set(true);
      loggingService.addHintLog.calls.reset();

      // Act: Close panel
      component.onPanelExpansionChange(false);

      // Assert: Should log panel closing
      expect(loggingService.addHintLog).toHaveBeenCalledWith({
        newPaneView: PaneView.closed,
        time: jasmine.any(Date)
      });
      expect(component.panelOpenState()).toBe(false);
    });

    it('should navigate to next hint and log the change', () => {
      // Arrange: Set up for navigation
      component.hintIndex = 0;
      loggingService.addHintLog.calls.reset();

      // Act: Navigate to next hint
      component.setHintIndex(1);

      // Assert: Should update index and log
      expect(component.hintIndex).toBe(1);
      expect(loggingService.addHintLog).toHaveBeenCalledWith({
        newContent: 'Test case 2',
        time: jasmine.any(Date)
      });
    });
  });

  describe('edge cases', () => {
    it('should handle single hint without navigation buttons', () => {
      // Arrange: Set single hint
      component.hints = ['Single hint'];
      component.panelOpenState.set(true);
      fixture.detectChanges();

      // Act & Assert: Should not show navigation buttons
      const navigationButtons = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons'));
      expect(navigationButtons).toBeNull();
    });
  });
});
