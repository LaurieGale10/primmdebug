import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { PreviousHypothesesPaneComponent } from './previous-hypotheses-pane.component';

describe('PreviousHypothesesPaneComponent', () => {
  let component: PreviousHypothesesPaneComponent;
  let fixture: ComponentFixture<PreviousHypothesesPaneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PreviousHypothesesPaneComponent,
        NoopAnimationsModule
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PreviousHypothesesPaneComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Display Logic', () => {

    describe('Navigation Buttons', () => {
      
      it('should not show navigation buttons when previousHypotheses.length == 1', () => {
        // Arrange
        component.previousHypotheses = ['Single hypothesis'];
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const navigationButtons = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons'));
        expect(navigationButtons).toBeNull();
      });

      it('should show navigation buttons when previousHypotheses.length > 1', () => {
        // Arrange
        component.previousHypotheses = ['First hypothesis', 'Second hypothesis'];
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const navigationButtons = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons'));
        expect(navigationButtons).toBeTruthy();
        
        const buttons = fixture.debugElement.queryAll(By.css('.expansion-panel-switch-buttons button'));
        expect(buttons.length).toBe(2);
      });

      it('should show navigation buttons when previousHypotheses contains mixed null and non-null values', () => {
        // Arrange
        component.previousHypotheses = ['First hypothesis', null, 'Third hypothesis'];
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const navigationButtons = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons'));
        expect(navigationButtons).toBeTruthy();
      });
    });

    describe('Component Visibility', () => {
      
      it('should display when previousHypotheses contains at least one non-null value', () => {
        // Arrange
        component.previousHypotheses = [null, 'Valid hypothesis', null];
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const expansionPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));
        expect(expansionPanel).toBeTruthy();
      });
    });

    describe('Content Display', () => {
      
      it('should show "no response" message for null values', () => {
        // Arrange
        component.previousHypotheses = [null, 'Valid hypothesis'];
        component.previousHypothesisIndex = 0; // Point to null value
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const contentElement = fixture.debugElement.query(By.css('p'));
        expect(contentElement.nativeElement.textContent.trim()).toBe("You didn't enter a response on this stage.");
      });

      it('should display non-null hypothesis values directly', () => {
        // Arrange
        const hypothesis = 'This is my debugging hypothesis';
        component.previousHypotheses = [hypothesis, null];
        component.previousHypothesisIndex = 0; // Point to non-null value
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const contentElement = fixture.debugElement.query(By.css('p em'));
        expect(contentElement.nativeElement.textContent.trim()).toBe(hypothesis);
      });

      it('should handle mixed null and non-null values correctly', () => {
        // Arrange
        const validHypothesis = 'This is a valid hypothesis';
        component.previousHypotheses = [null, validHypothesis, null];
        
        // Test null value display
        component.previousHypothesisIndex = 0;
        fixture.detectChanges();
        
        let contentElement = fixture.debugElement.query(By.css('p'));
        expect(contentElement.nativeElement.textContent.trim()).toBe("You didn't enter a response on this stage.");
        
        // Test non-null value display
        component.previousHypothesisIndex = 1;
        fixture.detectChanges();
        
        contentElement = fixture.debugElement.query(By.css('p em'));
        expect(contentElement.nativeElement.textContent.trim()).toBe(validHypothesis);
        
        // Test another null value
        component.previousHypothesisIndex = 2;
        fixture.detectChanges();
        
        contentElement = fixture.debugElement.query(By.css('p'));
        expect(contentElement.nativeElement.textContent.trim()).toBe("You didn't enter a response on this stage.");
      });
    });

    describe('Panel State', () => {
      
      it('should not start in an expanded state', () => {
        // Arrange
        component.previousHypotheses = ['Test hypothesis'];
        
        // Act
        fixture.detectChanges();
        
        // Assert
        expect(component.panelOpenState()).toBe(false);
        
        const expansionPanel = fixture.debugElement.query(By.css('mat-expansion-panel'));
        expect(expansionPanel.nativeElement.classList.contains('mat-expanded')).toBe(false);
      });

      it('should update panel state when expanded', () => {
        // Arrange
        component.previousHypotheses = ['Test hypothesis'];
        fixture.detectChanges();
        
        // Act
        component.onPanelExpansionChange(true);
        
        // Assert
        expect(component.panelOpenState()).toBe(true);
      });

      it('should update panel state when collapsed', () => {
        // Arrange
        component.previousHypotheses = ['Test hypothesis'];
        component.panelOpenState.set(true);
        fixture.detectChanges();
        
        // Act
        component.onPanelExpansionChange(false);
        
        // Assert
        expect(component.panelOpenState()).toBe(false);
      });
    });

    describe('Navigation Functionality', () => {
      
      it('should disable left button when at first index', () => {
        // Arrange
        component.previousHypotheses = ['First', 'Second', 'Third'];
        component.previousHypothesisIndex = 0;
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const leftButton = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons button:first-child'));
        expect(leftButton.nativeElement.disabled).toBe(true);
      });

      it('should disable right button when at last index', () => {
        // Arrange
        component.previousHypotheses = ['First', 'Second', 'Third'];
        component.previousHypothesisIndex = 2; // Last index
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const rightButton = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons button:last-child'));
        expect(rightButton.nativeElement.disabled).toBe(true);
      });

      it('should enable both buttons when in middle of array', () => {
        // Arrange
        component.previousHypotheses = ['First', 'Second', 'Third'];
        component.previousHypothesisIndex = 1; // Middle index
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const buttons = fixture.debugElement.queryAll(By.css('.expansion-panel-switch-buttons button'));
        expect(buttons[0].nativeElement.disabled).toBe(false); // Left button
        expect(buttons[1].nativeElement.disabled).toBe(false); // Right button
      });

      it('should update index when navigation buttons are clicked', () => {
        // Arrange
        component.previousHypotheses = ['First', 'Second', 'Third'];
        component.previousHypothesisIndex = 1;
        fixture.detectChanges();
        
        // Test left navigation
        const leftButton = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons button:first-child'));
        leftButton.nativeElement.click();
        
        expect(component.previousHypothesisIndex).toBe(0);
        
        // Test right navigation
        const rightButton = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons button:last-child'));
        rightButton.nativeElement.click();
        
        expect(component.previousHypothesisIndex).toBe(1);
      });
    });

    describe('Panel Header Content', () => {
      
      it('should show correct header when panel is closed', () => {
        // Arrange
        component.previousHypotheses = ['Test hypothesis'];
        component.panelOpenState.set(false);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const panelTitle = fixture.debugElement.query(By.css('mat-panel-title'));
        expect(panelTitle.nativeElement.textContent).toContain('Click to Show Your Previous Thoughts');
      });

      it('should show correct header with attempt number when panel is open', () => {
        // Arrange
        component.previousHypotheses = ['First', 'Second'];
        component.previousHypothesisIndex = 1;
        component.panelOpenState.set(true);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const panelTitle = fixture.debugElement.query(By.css('mat-panel-title'));
        expect(panelTitle.nativeElement.textContent).toContain('Your Previous Thoughts For This Stage (Attempt 2)');
      });
    });

    describe('Edge Cases', () => {
      
      it('should handle empty array gracefully', () => {
        // Arrange
        component.previousHypotheses = [];
        
        // Act & Assert - Should not throw error
        expect(() => fixture.detectChanges()).not.toThrow();
      });

      it('should handle single null value', () => {
        // Arrange
        component.previousHypotheses = [null];
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const contentElement = fixture.debugElement.query(By.css('p'));
        expect(contentElement.nativeElement.textContent.trim()).toBe("You didn't enter a response on this stage.");
        
        const navigationButtons = fixture.debugElement.query(By.css('.expansion-panel-switch-buttons'));
        expect(navigationButtons).toBeNull();
      });
    });
  });
});
