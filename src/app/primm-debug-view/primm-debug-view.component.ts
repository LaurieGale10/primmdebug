import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { ChallengeProgress, DebuggingStage, PageToNavigate } from '../types/types';
import { DebuggingExercise, TestCase } from '../services/debugging-exercise.model';
import { DocumentReference } from '@angular/fire/firestore';
import { trigger, transition } from '@angular/animations';
import { expandBorderAnimation } from '../animations/animations';
import { NgxConfettiExplosionComponent } from 'ngx-confetti-explosion';
import { Analytics } from '@angular/fire/analytics';

import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatDividerModule} from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../services/firestore.service';
import { LoggingService } from '../services/logging.service';
import { SessionManagerService } from '../services/session-manager.service';
import { CodeEditorComponent } from "./code-editor/code-editor.component";
import { ExerciseLog, FocusType, StageLog } from '../services/logging.model';
import { TestCaseDisplayComponent } from "./test-case-display/test-case-display.component";
import { PreviousHypothesesPaneComponent } from './previous-hypotheses-pane/previous-hypotheses-pane.component';
import { HintDisplayComponent } from "./hint-display/hint-display.component";
import { ToolbarComponent } from '../toolbar/toolbar.component';
import { PredictRunTestCasePaneComponent } from "./predict-run-test-case-pane/predict-run-test-case-pane.component";

import dedent from 'dedent';
import { environment } from '../../environments/environment.development';
import { ConfirmNavDialogComponent } from '../toolbar/confirm-nav-dialog/confirm-nav-dialog.component';

@Component({
  selector: 'app-primm-debug-view',
  standalone: true,
  imports: [NgxConfettiExplosionComponent, MatButtonModule, MatInputModule, MatFormFieldModule, MatIconModule, FormsModule, MatRadioModule, MatDividerModule, MatSelectModule, MatProgressSpinnerModule, CodeEditorComponent, TestCaseDisplayComponent, PreviousHypothesesPaneComponent, HintDisplayComponent, ToolbarComponent, PredictRunTestCasePaneComponent],
  templateUrl: './primm-debug-view.component.html',
  styleUrl: './primm-debug-view.component.sass',
  animations: [
    trigger('expandReflectionPaneBorder', [
      transition('* => '+DebuggingStage.predict, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.spotIssue, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.inspectCode, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.findError, [expandBorderAnimation])
    ]) //Had to pass down expandCodeEditorPane to code-editor-component due to iFrame outsizing div (so that iFrame doesn't display annoying scroll bar)
  ]
})
export class PrimmDebugViewComponent implements OnInit {
  private analytics = inject(Analytics);

  @ViewChild(CodeEditorComponent)
  codeEditor: CodeEditorComponent | undefined;

  exercise: DebuggingExercise | null = null;
  exerciseId: string | null = null;
  predictRunIteration: number = 0;
  debuggingStage: DebuggingStage = DebuggingStage.predict;
  DebuggingStageType = DebuggingStage; //To allow reference to enum types in interpolation
  
  studentResponses: Map<DebuggingStage, (string | null)[]> = new Map<DebuggingStage, (string | null)[]>([
    [DebuggingStage.predict, [] as string[]],
    [DebuggingStage.spotIssue, [] as string[]],
    [DebuggingStage.inspectCode, []],
    [DebuggingStage.findError, [] as string[]],
    [DebuggingStage.fixError, [] as string[]],
    [DebuggingStage.modify, [] as string[]]
  ]);

  changesSuccessful: boolean | null = null;
  useMultipleChoiceOptions: boolean = false;

  userReflectionInput: string | null = null;
  userMultiChoiceInput: string | null = null;
  debugStepNames: Map<DebuggingStage, string> = new Map<DebuggingStage, string>([
    [DebuggingStage.spotIssue, "Spot the issue"],
    [DebuggingStage.inspectCode, "Inspect the code"],
    [DebuggingStage.findError, "Find the error"],
    [DebuggingStage.fixError, "Fix the error"]
  ]);
  debugStepQuestions: Map<DebuggingStage, string> = new Map<DebuggingStage, string>([
    [DebuggingStage.spotIssue, "What was the program meant to do, and what did it actually do?\n\nIf there's an error message, what is it telling you?"],
    [DebuggingStage.inspectCode, dedent(`Try and work out what the cause of the issue could be.\n\nRead the code, run it with different inputs, and write down your thoughts. Use the test cases if you need help.`)],
    [DebuggingStage.findError, "Enter what line you think the error is located on."],
    [DebuggingStage.fixError, "Now try and fix the error. Then write down what you've changed."]
  ]);
  reflectionInputPlaceholders: Map<DebuggingStage, string> = new Map<DebuggingStage, string>([
    [DebuggingStage.predict, "e.g. The program will output a sequence of cities in alphabetical order."],
    [DebuggingStage.spotIssue, "e.g. The program was meant to output a sequence of integers in ascending order but actually printed them out unsorted."],
    [DebuggingStage.inspectCode, "e.g. After testing with four different variable values, I think the error is to do with the if statement on line 3."],
    [DebuggingStage.findError, "e.g. The equals sign on line 3."],
    [DebuggingStage.fixError, "e.g. Added a colon to the end of the while loop."]
  ])
  originalNumberOfLines: number[] | undefined;
  selectedLineNumber: number | undefined;
  foundErroneousLine: boolean | null = null;

  codeEditorLoading = signal(true);
  codeEditorSuccessfullyLoaded = signal(false);

  programLogs: any = null;

  constructor(private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private firestoreService: FirestoreService, private loggingService: LoggingService, private sessionManagerService: SessionManagerService) { };

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.exerciseId = params['id'];
    });

    this.firestoreService.getExerciseById(this.exerciseId!).then(data => {
      if (data) {
        this.exercise = this.firestoreService.parseDebuggingExercise(data);
        this.exercise!.id = this.exerciseId!;
      }
    })
    
    //TODO: Add error handling so undefined assertions (!s) can be made
    //Logic for when PRIMMDebug view page is being loaded anew (without routing from the homepage)
    if (environment.logChanges) {
      const studentId = this.loggingService.getStudentId() || sessionStorage.getItem("studentId");

      if (!studentId) {
        this.router.navigate(['/']);
      } else {
        if (!this.loggingService.getStudentId()) {
          this.loggingService.setStudentId(studentId);
        }
        this.setupExerciseLogs();
      }
    }
    if (!this.sessionManagerService.getDebuggingStage()) {
        this.sessionManagerService.setDebuggingStage(DebuggingStage.predict);
    }
  }

  getPredictResponses(): string[] {
    return this.studentResponses.get(DebuggingStage.predict) as string[];
  }

  /**
   * Checks whether the studentResponses.get(DebuggingStage.inspectCode) array actually contains any non-null values.
   */
  inspectCodeResponsesContainInput(): boolean {
    return this.studentResponses.get(DebuggingStage.inspectCode)?.some(response => response !== null) || false;
  }

  checkSessionStorage() {
    //Items in session storage can only exist when if the debuggingStage field exists
    if (this.sessionManagerService.getDebuggingStage()) {
      if (this.sessionManagerService.getPredictRunIteration()) {
        this.predictRunIteration = this.sessionManagerService.getPredictRunIteration()!;
      }

      if (this.sessionManagerService.getSelectedLineNumber()) {
        this.selectedLineNumber = this.sessionManagerService.getSelectedLineNumber()!;
      }
      else if (this.sessionManagerService.getCurrentResponse()) {
        this.userReflectionInput = this.sessionManagerService.getCurrentResponse();
      }

      if (this.sessionManagerService.getPreviousResponses()) {
        this.studentResponses = this.sessionManagerService.getPreviousResponses()!;
      }
      this.setDebuggingStage(this.sessionManagerService.getDebuggingStage()!);
    }
  }

  /**
   * Arranges all of the necessary logs on a user correctly entering a student ID or straightaway if they've previously entered a valid ID in their session
   */
  setupExerciseLogs() {
    this.loggingService.setExerciseId(this.exerciseId!);
    this.loggingService.setDebuggingStage(DebuggingStage.predict);
    window.addEventListener("visibilitychange", () => {
      this.loggingService.addFocusWindowEvent(document.visibilityState === "hidden" ? FocusType.focusOut : FocusType.focusIn);
    });
    this.loggingService.createExerciseLog();
  }

  onKeydown($event: Event) {
    //event?.preventDefault();
    if (
      (this.exercise!.multipleChoiceOptions?.get(this.debuggingStage) && this.userMultiChoiceInput && this.useMultipleChoiceOptions) ||
      (!this.exercise!.multipleChoiceOptions?.get(this.debuggingStage) && this.isStudentResponseValid()) ||
      ([DebuggingStage.inspectCode, DebuggingStage.modify].includes(this.debuggingStage)) ||
      (this.debuggingStage == DebuggingStage.findError && this.selectedLineNumber)
    ) {
      this.nextDebuggingStage();
    }
    return false;
  }

  onStudentInputChange(studentInput: string | null = null) {
    if (studentInput) {
      this.userReflectionInput = studentInput;
    }
    this.sessionManagerService.setCurrentResponse(this.userReflectionInput!);
  }

  onSelectedLineNumberChange() {
    this.sessionManagerService.setSelectedLineNumber(this.selectedLineNumber!);
  }

  testCasesContainInputs(testCases: TestCase[]): boolean {
    return testCases.some(testCase => testCase.input && testCase.input.length > 0);
  }

  codeEditorFinishedLoading(successfullyLoaded: boolean) {
    this.codeEditorLoading.set(false);
    this.codeEditorSuccessfullyLoaded.set(successfullyLoaded);
    this.checkSessionStorage();
  }

  runButtonPressed(event: void) {
    if (this.debuggingStage == DebuggingStage.run) {
      this.predictRunIteration++;
      this.nextDebuggingStage();
    }
  }

  onLogsReceived(event: any) {
    this.programLogs = event["snapshots"];
  }

  resetPredictUI() {
    this.resetCodeInEditor();
    this.setDebuggingStage(DebuggingStage.predict);
    this.predictRunIteration = 0;
  }

  sendToggleRunMessage(disableRun: boolean) {
    this.codeEditor!.sendMessage({
      type: "toggleRun",
      disableRun: disableRun
    });
  }

  sendToggleReadOnlyCode(readOnlyCode: boolean) {
    this.codeEditor!.sendMessage({
      type: "toggleReadOnlyCode",
      readOnlyCode: readOnlyCode
    });
  }

  resetCodeInEditor() {
    this.codeEditor!.sendMessage({
      type: "initialise",
      code:  "",
      language: "python",
      logChanges: true
    });
    this.codeEditor!.sendMessage({
      type: "initialise",
      code:  this.exercise!.program,
      language: "python",
      logChanges: true
    });
  }

  /**
   * Works the out the number of hints to pass to the hint-display component, based on the number of times the user has visited the list component
   */
  passHintsToComponent(debuggingStage: DebuggingStage): string[] {
    let numberHintsToDisplay: number = 0;

    // Handle the special case for inspect the code
    if (debuggingStage == DebuggingStage.inspectCode || debuggingStage == DebuggingStage.findError) {
      if (this.studentResponses.get(DebuggingStage.findError)!.length == 0) {
        return [];
      }
      const findErrorHints = this.exercise!.hints!.get(DebuggingStage.findError)!;
      numberHintsToDisplay = Math.min(
          this.studentResponses.get(DebuggingStage.findError)!.length
        , findErrorHints.length)
      return findErrorHints.slice(0, numberHintsToDisplay);
    }

    const stageHints = this.exercise!.hints!.get(debuggingStage)!;
    numberHintsToDisplay = Math.min(this.studentResponses.get(debuggingStage)!.length, stageHints.length);
    return stageHints.slice(0, numberHintsToDisplay);
  }

  isStudentResponseValid(): boolean {
    return this.userReflectionInput !== null && /[0-9A-Za-z]/.test(this.userReflectionInput);
  }

  /**
   * Sets the debugging stage once the user moves on from the find error phase.
   * Requires a separate function as the foundErroneousLine and selectedLineNumber variables need to be reset.
   * @param debuggingStage The debugging stage to be set
   */
  setDebuggingStageFromFindError(debuggingStage: DebuggingStage) {
    //TODO: Think this method could be refactored into nextDebuggingStage()
    this.saveStudentResponse("Line "+this.selectedLineNumber!);
    this.sessionManagerService.setPreviousResponses(JSON.stringify(Array.from(this.studentResponses.entries())));

    this.foundErroneousLine = null;
    this.selectedLineNumber = undefined;
    this.sessionManagerService.setSelectedLineNumber(null);
    this.setDebuggingStage(debuggingStage);
  }

  setDebuggingStage(debuggingStage: DebuggingStage) {
    this.debuggingStage = debuggingStage;
    this.sessionManagerService.setDebuggingStage(debuggingStage);
    if (debuggingStage == DebuggingStage.predict || debuggingStage == DebuggingStage.run) {
      this.sessionManagerService.setPredictRunIteration(this.predictRunIteration);
    }
    this.loggingService.setDebuggingStage(this.debuggingStage);
    switch (this.debuggingStage) {
      case DebuggingStage.predict: {
        this.sendToggleRunMessage(true);
        this.sendToggleReadOnlyCode(true);
        break;
      }
      case DebuggingStage.run: {
        this.sendToggleRunMessage(false);
        break;
      }
      case DebuggingStage.spotIssue: {
        this.sessionManagerService.setPredictRunIteration(null);
        this.sendToggleRunMessage(true);
        break;
      }
      case DebuggingStage.inspectCode: {
        this.sendToggleRunMessage(false);
        this.sendToggleReadOnlyCode(true);
        this.resetCodeInEditor();
        break;
      }
      case DebuggingStage.findError: {
        this.originalNumberOfLines = this.getNumberOfLines(this.exercise!.program);
        this.sendToggleRunMessage(true);
        break;
      }
      case DebuggingStage.fixError: {
        this.resetCodeInEditor();
        this.sendToggleReadOnlyCode(false);
        break;
      }
      case DebuggingStage.test: {
        this.sendToggleReadOnlyCode(true);
        this.sendToggleRunMessage(false);
        break;
      }
      case DebuggingStage.completedTest: {
        this.sendToggleRunMessage(true);
        break;
      }
      case DebuggingStage.modify: {
        this.sendToggleRunMessage(false);
        this.sendToggleReadOnlyCode(false);
      }
    }
  }

  /**
   * Saves a students' response to a particular prompt to the studentResponses variable
   */
  saveStudentResponse(response: string | null) {
    const currentList: (string | null)[] = this.studentResponses.get(this.debuggingStage)!;
    currentList.push(response);
  }

  /**
   * Resets userReflectionInput and userMultiChoiceInput to null after a user has entered some input, which allows them to move onto the next stage
   */
  resetUserInput() {
    this.userReflectionInput = null;
    this.userMultiChoiceInput = null;
  }

  enterSuccessOfChanges(changesSuccessful: boolean): void {
    this.changesSuccessful = changesSuccessful;
    if (this.changesSuccessful) {
      this.sessionManagerService.setChallengeProgress(this.exercise!.id, ChallengeProgress.completed);
    }
    this.nextDebuggingStage();
  }

  checkLineNumber() {
    //Log attempt made by user, and whether is was incorrect or not
    if (this.exercise?.lineContainingError && this.exercise?.lineContainingError == this.selectedLineNumber!) {
      this.foundErroneousLine = true;
    }
    else {
      this.foundErroneousLine = false;
      this.sessionManagerService.setSelectedLineNumber(null);
    }
    this.loggingService.saveStageLog(this.createStageLog());
  }

  getNumberOfLines(program: string): number[] {
    const numberOfLines: number = program.split("\n").length;
    const linesArray: number[] = Array.from(new Array(numberOfLines), (x,i) => i+1);
    return linesArray;
  }

  createStageLog(): StageLog {
    const stageLog: StageLog = {
      stage: this.loggingService.stringifyDebuggingStageLog(),
      time: new Date()
    }
    if (this.userMultiChoiceInput) {
      stageLog.response = this.userMultiChoiceInput!;
    }
    else if (this.userReflectionInput) {
      stageLog.response = this.userReflectionInput!;
    }
    else if (this.selectedLineNumber) {
      stageLog.response = "Line "+this.selectedLineNumber;
      stageLog.correct = this.foundErroneousLine!;
    }
    if (this.debuggingStage == DebuggingStage.test) {
      stageLog.correct = this.changesSuccessful!;
    }
    this.codeEditor!.sendMessage({
      type: "logs",
      timestamp: Date.now()
    })
    return stageLog;
  }

  nextDebuggingStage() {
    this.loggingService.saveStageLog(this.createStageLog()).then((docRef: DocumentReference | null) => {
      if (docRef && this.programLogs && this.programLogs.length > 0) { //TODO: Ideally log program logs with stage logs to avoid having update permission of stage logs
        this.loggingService.addProgramLogsToStageLogs(docRef, this.programLogs!);
      }
      this.programLogs = null;
    });
    if (this.exercise?.multipleChoiceOptions?.get(this.debuggingStage) && this.useMultipleChoiceOptions) {
      this.saveStudentResponse(this.userMultiChoiceInput!);
    }
    else if (this.userReflectionInput || this.debuggingStage == DebuggingStage.inspectCode) {
      this.saveStudentResponse(this.userReflectionInput!);
    }
    this.sessionManagerService.setCurrentResponse(null);
    this.sessionManagerService.setPreviousResponses(JSON.stringify(Array.from(this.studentResponses.entries())));
    this.resetUserInput();
    switch (this.debuggingStage) {
      case DebuggingStage.predict: {
        console.log(this.exercise)//For some reason the ID is undefined; need to fix this
        this.sessionManagerService.setChallengeProgress(this.exercise!.id, ChallengeProgress.attempted);
        this.setDebuggingStage(DebuggingStage.run);
        break;
      }
      case DebuggingStage.run: {
        if (this.predictRunIteration < this.exercise!.testCases!.length) {
          this.setDebuggingStage(DebuggingStage.predict);
        }
        else {
          this.setDebuggingStage(DebuggingStage.spotIssue);
        }
        break;
      }
      case DebuggingStage.spotIssue: {
        this.setDebuggingStage(DebuggingStage.inspectCode);
        break;
      }
      case DebuggingStage.inspectCode: {
        this.setDebuggingStage(DebuggingStage.findError);
        break;
      }
      case DebuggingStage.findError: {
        this.setDebuggingStage(DebuggingStage.fixError);
        break;
      }
      case DebuggingStage.fixError: {
        this.setDebuggingStage(DebuggingStage.test);
        break;
      }
      case DebuggingStage.test: {
        this.setDebuggingStage(DebuggingStage.completedTest);
        break;
      }
      case DebuggingStage.completedTest: {
        this.setDebuggingStage(DebuggingStage.modify);
        break;
      }
      case DebuggingStage.modify: {
        this.setDebuggingStage(DebuggingStage.make);
        break;
      }
    }
  }

  retryExercise() {
    this.resetPredictUI();
  }

  returnToDashboard() {
    let route:string = '/dashboard';
    this.router.navigate([route]);
  }

  /**
   * Navigates back to the challenge dashboard, first opening a dialog to confirm the navigation
   */
  toChallengeDashboard() {
    const dialogRef = this.dialog.open(ConfirmNavDialogComponent, {
      data: {
        title: "Are you sure?",
        content: "Are you sure you want to go to the dashboard? All your progress will be lost!",
        pageToNavigate: PageToNavigate.challengeDashboard
      },
    });
  }

}
