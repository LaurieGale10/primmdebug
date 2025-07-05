import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';

import { PrimmDebugViewComponent } from './primm-debug-view.component';
import { FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import { SessionManagerService } from '../services/session-manager.service';
import { DebuggingStage } from '../types/types';
import { DebuggingExercise } from '../services/debugging-exercise.model';

describe('PrimmDebugViewComponent', () => {
  let component: PrimmDebugViewComponent;
  let fixture: ComponentFixture<PrimmDebugViewComponent>;
  let mockSessionManagerService: jasmine.SpyObj<SessionManagerService>;
  let mockFirestoreService: jasmine.SpyObj<FirestoreService>;
  let mockLoggingService: jasmine.SpyObj<LoggingService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockDialog: jasmine.SpyObj<MatDialog>;
  let mockCodeEditor: jasmine.SpyObj<any>;

  const mockExercise: DebuggingExercise = {
    id: 'test-exercise',
    program: 'print("Hello World")',
    testCases: [
      { input: ['test input'], expected: 'expected output', actual: 'actual output' }
    ],
    lineContainingError: 1,
    hints: new Map(),
    multipleChoiceOptions: new Map(),
    title: 'test-exercise',
    description: 'test-description'
  };

  // Helper function to setup component with exercise data
  const setupComponentWithExercise = () => {
    component.exercise = mockExercise;
    component.hasCodeEditorLoaded.set(true);
    component.codeEditor = mockCodeEditor;
  };

  beforeEach(async () => {
    // Create spies for all dependencies
    mockSessionManagerService = jasmine.createSpyObj('SessionManagerService', [
      'getDebuggingStage', 'setDebuggingStage', 'getPredictRunIteration', 'setPredictRunIteration',
      'getSelectedLineNumber', 'setSelectedLineNumber', 'getCurrentResponse', 'setCurrentResponse',
      'getPreviousResponses', 'setPreviousResponses', 'clearSessionStorage'
    ]);
    
    mockFirestoreService = jasmine.createSpyObj('FirestoreService', [
      'getExerciseById', 'parseDebuggingExercise', 'isEmptyString'
    ]);
    
    mockLoggingService = jasmine.createSpyObj('LoggingService', [
      'getStudentId', 'setStudentId', 'setExerciseId', 'setDebuggingStage', 
      'createExerciseLog', 'saveStageLog', 'addFocusWindowEvent', 'getDebuggingStageCounter',
      'stringifyDebuggingStageLog', 'addProgramLogsToStageLogs'
    ]);
    
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockDialog = jasmine.createSpyObj('MatDialog', ['open']);
    
    // Create mock code editor
    mockCodeEditor = jasmine.createSpyObj('CodeEditorComponent', ['sendMessage']);
    
    mockActivatedRoute = {
      queryParams: of({ id: 'test-exercise-id' })
    };

    // Setup default return values
    mockFirestoreService.getExerciseById.and.returnValue(Promise.resolve(mockExercise));
    mockFirestoreService.parseDebuggingExercise.and.returnValue(mockExercise);
    mockLoggingService.getStudentId.and.returnValue('test-student');
    mockLoggingService.saveStageLog.and.returnValue(Promise.resolve(null));
    mockLoggingService.stringifyDebuggingStageLog.and.returnValue('mock-stage-log');

    await TestBed.configureTestingModule({
      imports: [
        PrimmDebugViewComponent,
        NoopAnimationsModule
      ],
      providers: [
        { provide: SessionManagerService, useValue: mockSessionManagerService },
        { provide: FirestoreService, useValue: mockFirestoreService },
        { provide: LoggingService, useValue: mockLoggingService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MatDialog, useValue: mockDialog }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrimmDebugViewComponent);
    component = fixture.componentInstance;
    
    // Setup mock code editor and set hasCodeEditorLoaded to true
    component.codeEditor = mockCodeEditor;
    component.hasCodeEditorLoaded.set(true);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // PERSISTENT STATE TESTS
  describe('Persistent State Management', () => {
    
    describe('Session Storage Persistence', () => {
      
      it('should save debugging stage to session storage when stage changes', () => {
        // Arrange
        setupComponentWithExercise();
        const newStage = DebuggingStage.spotDefect;
        
        // Act
        component.setDebuggingStage(newStage);
        
        // Assert
        expect(mockSessionManagerService.setDebuggingStage).toHaveBeenCalledWith(newStage);
        expect(component.debuggingStage).toBe(newStage);
      });

      it('should save predict run iteration to session storage', () => {
        // Arrange
        setupComponentWithExercise();
        component.predictRunIteration = 2;
        
        // Act
        component.setDebuggingStage(DebuggingStage.predict);
        
        // Assert
        expect(mockSessionManagerService.setPredictRunIteration).toHaveBeenCalledWith(2);
      });

      it('should save current user response to session storage', () => {
        // Arrange
        const response = 'This is my prediction';
        
        // Act
        component.onStudentInputChange(response);
        
        // Assert
        expect(mockSessionManagerService.setCurrentResponse).toHaveBeenCalledWith(response);
        expect(component.userReflectionInput).toBe(response);
      });

      it('should save selected line number to session storage', () => {
        // Arrange
        component.selectedLineNumber = 5;
        
        // Act
        component.onSelectedLineNumberChange();
        
        // Assert
        expect(mockSessionManagerService.setSelectedLineNumber).toHaveBeenCalledWith(5);
      });

      it('should save previous responses when transitioning to next stage', () => {
        // Arrange
        setupComponentWithExercise();
        component.userReflectionInput = 'Test response';
        component.debuggingStage = DebuggingStage.predict;
        
        // Act
        component.nextDebuggingStage();
        
        // Assert
        expect(mockSessionManagerService.setPreviousResponses).toHaveBeenCalled();
        const savedResponses = mockSessionManagerService.setPreviousResponses.calls.mostRecent().args[0];
        expect(savedResponses).toContain(DebuggingStage.predict);
      });
    });

    describe('Session Storage Restoration', () => {
      
      it('should restore debugging stage from session storage', () => {
        // Arrange
        const savedStage = DebuggingStage.inspectCode;
        mockSessionManagerService.getDebuggingStage.and.returnValue(savedStage);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(savedStage);
      });

      it('should restore predict run iteration from session storage', () => {
        // Arrange
        const savedIteration = 3;
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.predict);
        mockSessionManagerService.getPredictRunIteration.and.returnValue(savedIteration);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.predictRunIteration).toBe(savedIteration);
      });

      it('should restore selected line number from session storage', () => {
        // Arrange
        const savedLineNumber = 7;
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.findError);
        mockSessionManagerService.getSelectedLineNumber.and.returnValue(savedLineNumber);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.selectedLineNumber).toBe(savedLineNumber);
      });

      it('should restore current response from session storage', () => {
        // Arrange
        const savedResponse = 'Restored response';
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.spotDefect);
        mockSessionManagerService.getCurrentResponse.and.returnValue(savedResponse);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.userReflectionInput).toBe(savedResponse);
      });

      it('should restore previous responses from session storage', () => {
        // Arrange
        const savedResponses = new Map<DebuggingStage, string[]>([
          [DebuggingStage.predict, ['Previous prediction']],
          [DebuggingStage.spotDefect, ['Previous spot defect response']]
        ]);
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.inspectCode);
        mockSessionManagerService.getPreviousResponses.and.returnValue(savedResponses);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.studentResponses.get(DebuggingStage.predict)).toEqual(['Previous prediction']);
        expect(component.studentResponses.get(DebuggingStage.spotDefect)).toEqual(['Previous spot defect response']);
      });
    });

    describe('Page Refresh Simulation', () => {
      
      it('should maintain state after simulated page refresh', () => {
        // Arrange - Simulate existing session data
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.predict);
        mockSessionManagerService.getCurrentResponse.and.returnValue('Work in progress response');
        mockSessionManagerService.getPreviousResponses.and.returnValue(
          new Map<DebuggingStage, string[]>([[DebuggingStage.predict, ['Completed prediction']]])
        );
        setupComponentWithExercise();
        
        // Act - Simulate page refresh by calling ngOnInit and checkSessionStorage
        component.ngOnInit();
        component.hasCodeEditorLoaded.set(true);
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.predict);
        expect(component.userReflectionInput).toBe('Work in progress response');
        expect(component.studentResponses.get(DebuggingStage.predict)).toEqual(['Completed prediction']);
      });

      it('should start fresh when no session storage exists', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(null);
        
        // Act
        component.ngOnInit();
        
        // Assert
        expect(mockSessionManagerService.setDebuggingStage).toHaveBeenCalledWith(DebuggingStage.predict);
      });

      it('should handle partial session storage data gracefully', () => {
        // Arrange - Only some session data exists
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.inspectCode);
        mockSessionManagerService.getPredictRunIteration.and.returnValue(null);
        mockSessionManagerService.getCurrentResponse.and.returnValue(null);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.inspectCode);
        expect(component.predictRunIteration).toBe(0); // Should maintain default
        expect(component.userReflectionInput).toBeNull();
      });
    });

    describe('State Transition Persistence', () => {
      
      it('should clear current response but preserve previous responses during stage transition', () => {
        // Arrange
        setupComponentWithExercise();
        component.userReflectionInput = 'Current response';
        component.debuggingStage = DebuggingStage.predict;
        
        // Act
        component.nextDebuggingStage();
        
        // Assert
        expect(mockSessionManagerService.setCurrentResponse).toHaveBeenCalledWith(null);
        expect(mockSessionManagerService.setPreviousResponses).toHaveBeenCalled();
      });

      it('should maintain session state during setDebuggingStageFromFindError', () => {
        // Arrange
        setupComponentWithExercise();
        component.selectedLineNumber = 5;
        component.foundErroneousLine = true;
        
        // Act
        component.setDebuggingStageFromFindError(DebuggingStage.fixError);
        
        // Assert
        expect(component.selectedLineNumber).toBeUndefined();
        expect(component.foundErroneousLine).toBeNull();
        expect(mockSessionManagerService.setDebuggingStage).toHaveBeenCalledWith(DebuggingStage.fixError);
      });
    });

    describe('Edge Cases', () => {
      
      it('should handle corrupted previous responses data', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.inspectCode);
        mockSessionManagerService.getPreviousResponses.and.returnValue(null);
        setupComponentWithExercise();
        
        // Act & Assert - Should not throw error
        expect(() => component.checkSessionStorage()).not.toThrow();
      });

      it('should not restore state if debugging stage is not set', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(null);
        mockSessionManagerService.getCurrentResponse.and.returnValue('Some response');
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.userReflectionInput).toBeNull();
        expect(mockSessionManagerService.getCurrentResponse).not.toHaveBeenCalled();
      });

      it('should handle exercise reset and clear relevant session data', () => {
        // Arrange
        setupComponentWithExercise();
        component.debuggingStage = DebuggingStage.fixError;
        component.predictRunIteration = 3;
        
        // Act
        component.resetPredictUI();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.predict);
        expect(component.predictRunIteration).toBe(0);
      });
    });
  });

  describe('Advanced Persistent State Scenarios', () => {
    
    describe('Multi-Stage Progress Persistence', () => {
      
      it('should preserve complete user journey across refresh', () => {
        // Arrange - Simulate user who has completed several stages
        const progressData = {
          stage: DebuggingStage.findError,
          predictIteration: 2,
          previousResponses: new Map<DebuggingStage, string[]>([
            [DebuggingStage.predict, ['First prediction', 'Second prediction']],
            [DebuggingStage.spotDefect, ['Error analysis response']],
            [DebuggingStage.inspectCode, ['Code inspection response']]
          ]),
          currentResponse: 'Looking for error on line...'
        };

        mockSessionManagerService.getDebuggingStage.and.returnValue(progressData.stage);
        mockSessionManagerService.getPredictRunIteration.and.returnValue(progressData.predictIteration);
        mockSessionManagerService.getPreviousResponses.and.returnValue(progressData.previousResponses);
        mockSessionManagerService.getCurrentResponse.and.returnValue(progressData.currentResponse);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.findError);
        expect(component.predictRunIteration).toBe(2);
        expect(component.userReflectionInput).toBe('Looking for error on line...');
        expect(component.studentResponses.get(DebuggingStage.predict)?.length).toBe(2);
        expect(component.studentResponses.get(DebuggingStage.spotDefect)).toEqual(['Error analysis response']);
      });

      it('should handle predict-run cycle state persistence', () => {
        // Arrange - User in middle of predict-run iterations
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.predict);
        mockSessionManagerService.getPredictRunIteration.and.returnValue(1);
        mockSessionManagerService.getPreviousResponses.and.returnValue(
          new Map<DebuggingStage, string[]>([[DebuggingStage.predict, ['First test case prediction']]])
        );
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.predict);
        expect(component.predictRunIteration).toBe(1);
        expect(component.studentResponses.get(DebuggingStage.predict)).toEqual(['First test case prediction']);
      });
    });

    describe('Session Storage Synchronization', () => {
      
      it('should sync session storage when user input changes', () => {
        // Arrange
        const newInput = 'Updated prediction';
        
        // Act
        component.onStudentInputChange(newInput);
        
        // Assert
        expect(component.userReflectionInput).toBe(newInput);
        expect(mockSessionManagerService.setCurrentResponse).toHaveBeenCalledWith(newInput);
      });

      it('should clear session storage appropriately during stage transitions', () => {
        // Arrange
        setupComponentWithExercise();
        component.userReflectionInput = 'Response to save';
        component.debuggingStage = DebuggingStage.spotDefect;
        
        // Act
        component.nextDebuggingStage();
        
        // Assert - Current response should be cleared, previous responses should be saved
        expect(mockSessionManagerService.setCurrentResponse).toHaveBeenCalledWith(null);
        expect(mockSessionManagerService.setPreviousResponses).toHaveBeenCalled();
      });

      it('should handle session storage for line number selection', () => {
        // Arrange
        component.selectedLineNumber = 12;
        
        // Act
        component.onSelectedLineNumberChange();
        
        // Assert
        expect(mockSessionManagerService.setSelectedLineNumber).toHaveBeenCalledWith(12);
      });
    });

    describe('Component Initialization with Session Data', () => {
      
      it('should initialize with fresh state when no session exists', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(null);
        mockSessionManagerService.getPredictRunIteration.and.returnValue(null);
        mockSessionManagerService.getCurrentResponse.and.returnValue(null);
        mockSessionManagerService.getPreviousResponses.and.returnValue(null);
        setupComponentWithExercise();
        
        // Act
        component.ngOnInit();
        
        // Assert
        expect(mockSessionManagerService.setDebuggingStage).toHaveBeenCalledWith(DebuggingStage.predict);
        expect(component.debuggingStage).toBe(DebuggingStage.predict);
        expect(component.predictRunIteration).toBe(0);
        expect(component.userReflectionInput).toBeNull();
      });

      it('should restore findError stage with line selection', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.findError);
        mockSessionManagerService.getSelectedLineNumber.and.returnValue(5);
        mockSessionManagerService.getCurrentResponse.and.returnValue(null);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.findError);
        expect(component.selectedLineNumber).toBe(5);
      });

      it('should prioritize selected line number over current response in findError stage', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.findError);
        mockSessionManagerService.getSelectedLineNumber.and.returnValue(3);
        mockSessionManagerService.getCurrentResponse.and.returnValue('Some response');
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.selectedLineNumber).toBe(3);
        expect(component.userReflectionInput).toBeNull(); // Should not restore response when line number exists
      });
    });

    describe('Error Handling and Resilience', () => {
      
      it('should handle JSON parsing errors in previous responses gracefully', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.inspectCode);
        mockSessionManagerService.getPreviousResponses.and.returnValue(null);
        setupComponentWithExercise();
        
        // Act & Assert
        expect(() => component.checkSessionStorage()).not.toThrow();
        expect(component.debuggingStage).toBe(DebuggingStage.inspectCode);
      });

      it('should handle null values in session storage gracefully', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.spotDefect);
        mockSessionManagerService.getPredictRunIteration.and.returnValue(null);
        mockSessionManagerService.getCurrentResponse.and.returnValue(null);
        mockSessionManagerService.getSelectedLineNumber.and.returnValue(null);
        setupComponentWithExercise();
        
        // Act
        component.checkSessionStorage();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.spotDefect);
        expect(component.predictRunIteration).toBe(0);
        expect(component.userReflectionInput).toBeNull();
        expect(component.selectedLineNumber).toBeUndefined();
      });


    });

    describe('State Reset Scenarios', () => {
      
      it('should properly reset state when retrying exercise', () => {
        // Arrange
        setupComponentWithExercise();
        component.debuggingStage = DebuggingStage.fixError;
        component.predictRunIteration = 3;
        component.userReflectionInput = 'Some response';
        component.selectedLineNumber = 7;
        
        // Act
        component.retryExercise();
        
        // Assert
        expect(component.debuggingStage).toBe(DebuggingStage.predict);
        expect(component.predictRunIteration).toBe(0);
      });

      it('should clear relevant state when transitioning from findError stage', () => {
        // Arrange
        setupComponentWithExercise();
        component.selectedLineNumber = 8;
        component.foundErroneousLine = true;
        
        // Act
        component.setDebuggingStageFromFindError(DebuggingStage.fixError);
        
        // Assert
        expect(component.selectedLineNumber).toBeUndefined();
        expect(component.foundErroneousLine).toBeNull();
        expect(mockSessionManagerService.setDebuggingStage).toHaveBeenCalledWith(DebuggingStage.fixError);
      });
    });

    describe('Code Editor Integration', () => {
      
      it('should trigger session storage check when code editor loads', () => {
        // Arrange
        mockSessionManagerService.getDebuggingStage.and.returnValue(DebuggingStage.inspectCode);
        spyOn(component, 'checkSessionStorage');
        
        // Act
        component.codeEditorLoaded();
        
        // Assert
        expect(component.hasCodeEditorLoaded()).toBe(true);
        expect(component.checkSessionStorage).toHaveBeenCalled();
      });

      it('should not check session storage before code editor is loaded', () => {
        // Arrange
        spyOn(component, 'checkSessionStorage');
        component.hasCodeEditorLoaded.set(false);
        
        // Act
        component.ngOnInit();
        
        // Assert
        expect(component.checkSessionStorage).not.toHaveBeenCalled();
      });
    });
  });

  describe('Input Validation', () => {
    
    beforeEach(() => {
      setupComponentWithExercise();
    });

    describe('isStudentResponseValid', () => {
      
      it('should return false when userReflectionInput is null', () => {
        // Arrange
        component.userReflectionInput = null;
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should return false when userReflectionInput is empty string', () => {
        // Arrange
        component.userReflectionInput = '';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should return false when userReflectionInput contains only whitespace', () => {
        // Arrange
        component.userReflectionInput = '   ';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should return false when userReflectionInput contains only special characters', () => {
        // Arrange
        component.userReflectionInput = '!@#$%^&*()';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should return false when userReflectionInput contains only spaces and special characters', () => {
        // Arrange
        component.userReflectionInput = '  !@# $%^  ';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should return true when userReflectionInput contains a number', () => {
        // Arrange
        component.userReflectionInput = 'test 123';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains only a single number', () => {
        // Arrange
        component.userReflectionInput = '5';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains uppercase letters', () => {
        // Arrange
        component.userReflectionInput = 'HELLO WORLD';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains lowercase letters', () => {
        // Arrange
        component.userReflectionInput = 'hello world';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains mixed case letters', () => {
        // Arrange
        component.userReflectionInput = 'Hello World';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains letters and numbers', () => {
        // Arrange
        component.userReflectionInput = 'abc123';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput has alphanumeric with leading/trailing whitespace', () => {
        // Arrange
        component.userReflectionInput = '  hello  ';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput has alphanumeric with special characters', () => {
        // Arrange
        component.userReflectionInput = 'hello! world?';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains single character', () => {
        // Arrange
        component.userReflectionInput = 'a';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should return true when userReflectionInput contains single uppercase character', () => {
        // Arrange
        component.userReflectionInput = 'A';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });
    });

    describe('Button State Integration', () => {
      
      beforeEach(() => {
        setupComponentWithExercise();
        component.debuggingStage = DebuggingStage.predict;
        component.useMultipleChoiceOptions = false;
      });

      it('should return correct validation state for button disabled condition with invalid input', () => {
        // Arrange
        component.userReflectionInput = '!@#$';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should return correct validation state for button enabled condition with valid input', () => {
        // Arrange
        component.userReflectionInput = 'valid response';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should handle validation state changes from invalid to valid', () => {
        // Arrange - Start with invalid input
        component.userReflectionInput = '###';
        expect(component.isStudentResponseValid()).toBe(false);
        
        // Act - Change to valid input
        component.userReflectionInput = 'now valid';
        
        // Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should handle validation state changes from valid to invalid', () => {
        // Arrange - Start with valid input
        component.userReflectionInput = 'valid input';
        expect(component.isStudentResponseValid()).toBe(true);
        
        // Act - Change to invalid input
        component.userReflectionInput = '!!!';
        
        // Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });

      it('should validate correctly when multiple choice options exist but are enabled', () => {
        // Arrange
        component.useMultipleChoiceOptions = true;
        component.exercise!.multipleChoiceOptions!.set(DebuggingStage.predict, ['Option 1', 'Option 2']);
        component.userMultiChoiceInput = null;
        component.userReflectionInput = 'valid text';
        
        // Act & Assert - Text validation should still work but won't be used for button state
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should validate correctly when multiple choice is disabled', () => {
        // Arrange
        component.useMultipleChoiceOptions = false;
        component.exercise!.multipleChoiceOptions!.set(DebuggingStage.predict, ['Option 1', 'Option 2']);
        component.userMultiChoiceInput = null;
        component.userReflectionInput = 'valid text';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(true);
      });

      it('should handle edge case with empty input when multiple choice is disabled', () => {
        // Arrange
        component.useMultipleChoiceOptions = false;
        component.userMultiChoiceInput = null;
        component.userReflectionInput = '';
        
        // Act & Assert
        expect(component.isStudentResponseValid()).toBe(false);
      });
    });
  });

  describe('Component Visibility Logic', () => {
    
    describe('Previous Hypotheses Pane Display', () => {
      
      beforeEach(() => {
        setupComponentWithExercise();
        // Set debugging stage to inspectCode for all tests in this suite
        component.debuggingStage = DebuggingStage.inspectCode;
        // Ensure component is fully initialized
        fixture.detectChanges();
      });

      it('should not display previous-hypotheses-pane when inspectCode responses only contain null values', () => {
        // Arrange
        component.studentResponses.set(DebuggingStage.inspectCode, [null, null, null]);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const previousHypothesesPane = fixture.debugElement.query(By.css('app-previous-hypotheses-pane'));
        expect(previousHypothesesPane).toBeNull();
      });

      it('should display previous-hypotheses-pane when inspectCode responses contain at least one non-null value', () => {
        // Arrange
        component.studentResponses.set(DebuggingStage.inspectCode, [null, 'Valid hypothesis', null]);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const previousHypothesesPane = fixture.debugElement.query(By.css('app-previous-hypotheses-pane'));
        expect(previousHypothesesPane).toBeTruthy();
      });

      it('should display previous-hypotheses-pane when all inspectCode responses are non-null', () => {
        // Arrange
        component.studentResponses.set(DebuggingStage.inspectCode, ['First hypothesis', 'Second hypothesis']);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const previousHypothesesPane = fixture.debugElement.query(By.css('app-previous-hypotheses-pane'));
        expect(previousHypothesesPane).toBeTruthy();
      });

      it('should not display previous-hypotheses-pane when inspectCode responses array is empty', () => {
        // Arrange
        component.studentResponses.set(DebuggingStage.inspectCode, []);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const previousHypothesesPane = fixture.debugElement.query(By.css('app-previous-hypotheses-pane'));
        expect(previousHypothesesPane).toBeNull();
      });

      it('should not display previous-hypotheses-pane when not in inspectCode stage', () => {
        // Arrange
        component.debuggingStage = DebuggingStage.predict;
        component.studentResponses.set(DebuggingStage.inspectCode, ['Valid hypothesis']);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const previousHypothesesPane = fixture.debugElement.query(By.css('app-previous-hypotheses-pane'));
        expect(previousHypothesesPane).toBeNull();
      });

      it('should pass correct previousHypotheses input to previous-hypotheses-pane component', () => {
        // Arrange
        const inspectCodeResponses = ['First hypothesis', null, 'Third hypothesis'];
        component.studentResponses.set(DebuggingStage.inspectCode, inspectCodeResponses);
        
        // Act
        fixture.detectChanges();
        
        // Assert
        const previousHypothesesPane = fixture.debugElement.query(By.css('app-previous-hypotheses-pane'));
        expect(previousHypothesesPane).toBeTruthy();
        expect(previousHypothesesPane.componentInstance.previousHypotheses).toEqual(inspectCodeResponses);
      });
    });
  });
});
