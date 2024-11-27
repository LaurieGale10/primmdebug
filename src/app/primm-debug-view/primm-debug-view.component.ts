import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { DebuggingStage } from '../types/types';
import { DebuggingExercise } from '../services/debugging-exercise.model';
import { DocumentReference } from '@angular/fire/firestore';
import { trigger, transition } from '@angular/animations';
import { expandBorderAnimation } from '../animations/animations';
import { NgxConfettiExplosionComponent } from 'ngx-confetti-explosion';

import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {FormsModule} from '@angular/forms';
import {MatRadioModule} from '@angular/material/radio';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDividerModule} from '@angular/material/divider';
import {MatSelectModule} from '@angular/material/select';

import { ToHomeDialogComponent } from './to-home-dialog/to-home-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { FirestoreService } from '../services/firestore.service';
import { CodeEditorComponent } from "./code-editor/code-editor.component";
import { LoggingService } from '../services/logging.service';
import { ExerciseLog, FocusType, StageLog } from '../services/logging.model';
import { TestCaseDisplayComponent } from "./test-case-display/test-case-display.component";
import { HintDisplayComponent } from "./hint-display/hint-display.component";

import dedent from 'dedent';
import { environment } from '../../environments/environment.development';
import { StudentIdDialogComponent } from '../student-id-dialog/student-id-dialog.component';

@Component({
  selector: 'app-primm-debug-view',
  standalone: true,
  imports: [NgIf, NgFor, RouterOutlet, NgxConfettiExplosionComponent, MatButtonModule, MatInputModule, MatFormFieldModule, MatIconModule, FormsModule, MatRadioModule, MatToolbarModule, MatDividerModule, MatSelectModule, CodeEditorComponent, TestCaseDisplayComponent, HintDisplayComponent],
  templateUrl: './primm-debug-view.component.html',
  styleUrl: './primm-debug-view.component.sass',
  animations: [
    trigger('expandReflectionPaneBorder', [
      transition('* => '+DebuggingStage.predict, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.spotDefect, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.inspectCode, [expandBorderAnimation]),
      transition('* => '+DebuggingStage.findError, [expandBorderAnimation])
    ]) //Had to pass down expandCodeEditorPane to code-editor-component due to iFrame outsizing div (so that iFrame doesn't display annoying scroll bar)
  ]
})
export class PrimmDebugViewComponent implements OnInit {

  @ViewChild(CodeEditorComponent)
  codeEditor: CodeEditorComponent | undefined;

  exercise: DebuggingExercise | null = null;
  predictRunIteration: number = 0;
  debuggingStage: DebuggingStage = DebuggingStage.predict;
  DebuggingStageType = DebuggingStage; //To allow reference to enum types in interpolation
  
  studentAnswers: Map<DebuggingStage, string[]> = new Map<DebuggingStage, string[]>([
    [DebuggingStage.predict, []],
    [DebuggingStage.spotDefect, []],
    [DebuggingStage.inspectCode, []],
    [DebuggingStage.findError, []],
    [DebuggingStage.fixError, []],
    [DebuggingStage.modify, []]
  ]); //How will I go about saving this information to a database? Create a separate method for doing this? JSONify this?

  changesSuccessful: boolean | undefined;
  useMultipleChoiceOptions: boolean = false;

  userReflectionInput: string | null = null;
  userMultiChoiceInput: string | null = null;
  debugStepNames: Map<DebuggingStage, string> = new Map<DebuggingStage, string>([
    [DebuggingStage.spotDefect, "Spot the defect"],
    [DebuggingStage.inspectCode, "Inspect the code"],
    [DebuggingStage.findError, "Find the error"],
    [DebuggingStage.fixError, "Fix the error"]
  ]);
  debugStepQuestions: Map<DebuggingStage, string> = new Map<DebuggingStage, string>([
    [DebuggingStage.spotDefect, "What was the program meant to do, and what did it actually do?\n\nIf there's an error message, what is it telling you?"],
    [DebuggingStage.inspectCode, dedent(`Try and work out what the cause of the error could be.\n\nRead the code, run it with different inputs, and write down your thoughts. Use the test cases if you need any help.`)],
    [DebuggingStage.findError, "Enter what line you think the error is located on."],
    [DebuggingStage.fixError, "Now make the changes to the program that you think will fix the error. Then write down what you've changed."]
  ]);
  reflectionInputPlaceholders: Map<DebuggingStage, string> = new Map<DebuggingStage, string>([
    [DebuggingStage.predict, "e.g. The program will output a sequence of cities in alphabetical order."],
    [DebuggingStage.spotDefect, "e.g. The program was meant to output a sequence of integers in ascending order but actually printed them out unsorted."],
    [DebuggingStage.inspectCode, "e.g. After testing with four different variable values, I think the error is to do with the if statement on line 3."],
    [DebuggingStage.findError, "e.g. The equals sign on line 3."],
    [DebuggingStage.fixError, "e.g. Added a colon to the end of the while loop."]
  ])
  testCaseOutputs: Map<string, string> = new Map<string, string>();
  originalNumberOfLines: number[] | undefined;
  selectedLineNumber: number | undefined;
  foundErroneousLine: boolean | null = null;

  hasCodeEditorLoaded = signal(false);

  //Variables for logging
  programLogs: any = null;

  constructor(private router: Router, private route: ActivatedRoute, private dialog: MatDialog, private firestoreService: FirestoreService, private loggingService: LoggingService) { };

  ngOnInit(): void {
    //TODO: Add error handling so undefined assertions (!s) can be made
    if (environment.logChanges && !this.loggingService.getStudentId()) {
      this.openToStudentDialog();
    }
    window.addEventListener("visibilitychange", () => {
      this.loggingService.addFocusWindowEvent(document.visibilityState === "hidden" ? FocusType.focusOut : FocusType.focusIn);
    });
    this.loggingService.setDebuggingStage(DebuggingStage.predict);

    let exerciseId: any;
    this.route.queryParams.subscribe(params => {
      exerciseId = params['id'];
      this.loggingService.setExerciseId(exerciseId);
    });

    this.firestoreService.getExerciseById(exerciseId).then(data => {
      if (data) {
        this.exercise = this.firestoreService.parseDebuggingExercise(data);
      }
    })
    this.loggingService.createExerciseLog();
  }

  openToStudentDialog() {
    const dialogRef = this.dialog.open(StudentIdDialogComponent, {disableClose: true});
  }

  onKeydown($event: Event) {
    //event?.preventDefault();
    if ((this.exercise!.multipleChoiceOptions?.get(this.debuggingStage) && this.userMultiChoiceInput && this.useMultipleChoiceOptions) || (!this.exercise!.multipleChoiceOptions?.get(this.debuggingStage) && this.userReflectionInput && !this.firestoreService.isEmptyString(this.userReflectionInput))) {
      this.nextDebuggingStage();
    }
    return false;
  }

  codeEditorLoaded(event: void) {
    this.hasCodeEditorLoaded.set(true);
  }

  runButtonPressed(event: void) {
    this.predictRunIteration++;
    if (this.debuggingStage == DebuggingStage.run) {
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
    const debuggingStageCounter: number = this.loggingService.getDebuggingStageCounter(debuggingStage);
    if ((2 <= debuggingStageCounter) && (debuggingStageCounter <= 4)) {
      return this.debuggingStage == DebuggingStage.inspectCode ? this.exercise!.hints!.get(DebuggingStage.findError)!.slice(0,debuggingStageCounter - 1) : this.exercise!.hints!.get(debuggingStage)!.slice(0,debuggingStageCounter - 1); //Function will only be called within HTML blocks where hints has been verified as truthy
    }
    return [];
  }

  /**
   * Sets the debugging stage once the user moves on from the find error phase.
   * Requires a separate function as the foundErroneousLine and selectedLineNumber variables need to be reset.
   * @param debuggingStage The debugging stage to be set
   */
  setDebuggingStageFromFindError(debuggingStage: DebuggingStage) {
    this.foundErroneousLine = null;
    this.selectedLineNumber = undefined;
    this.setDebuggingStage(debuggingStage);
  }

  setDebuggingStage(debuggingStage: DebuggingStage) {
    this.debuggingStage = debuggingStage;
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
      case DebuggingStage.spotDefect: {
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
   * Saves a students' response to a particular prompt to the studentAnswers variable (and soon to be logging the answer as well)
   */
  saveStudentResponse(response: string) {
    const currentList: string[] = this.studentAnswers.get(this.debuggingStage)!;
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
    this.nextDebuggingStage();
  }

  checkLineNumber() {
    //Log attempt made by user, and whether is was incorrect or not
    if (this.exercise?.lineContainingError && this.exercise?.lineContainingError == this.selectedLineNumber!) {
      this.foundErroneousLine = true;
    }
    else {
      this.foundErroneousLine = false;
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
    this.codeEditor!.sendMessage({
      type: "logs",
      timestamp: Date.now()
    })
    return stageLog;
  }

  nextDebuggingStage() {
    this.loggingService.saveStageLog(this.createStageLog()).then((docRef: DocumentReference | null) => {
      if (docRef && this.programLogs && this.programLogs.length > 1) {
        this.loggingService.addProgramLogsToStageLogs(docRef, this.programLogs!);
      }
      this.programLogs = null;
    });
    if (this.exercise?.multipleChoiceOptions?.get(this.debuggingStage) && this.useMultipleChoiceOptions) {
      this.saveStudentResponse(this.userMultiChoiceInput!);
    }
    else if (this.userReflectionInput) {
      this.saveStudentResponse(this.userReflectionInput!);
    }
    this.resetUserInput();
    switch (this.debuggingStage) {
      case DebuggingStage.predict: {
        this.setDebuggingStage(DebuggingStage.run);
        break;
      }
      case DebuggingStage.run: {
        if (this.exercise?.testCases && this.predictRunIteration < this.exercise?.testCases.length) {
          this.setDebuggingStage(DebuggingStage.predict);
        }
        else {
          this.setDebuggingStage(DebuggingStage.spotDefect);
        }
        break;
      }
      case DebuggingStage.spotDefect: {
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

  openToHomeDialog() {
    const dialogRef = this.dialog.open(ToHomeDialogComponent, {
      data: {
        title: "Are you sure?",
        content: "Are you sure you want to return to the homepage? All your progress on this exercise will be lost!"
      }
    });
  }

  returnToHomepage() {
    let route = '';
    this.loggingService.saveExitLog();
    this.router.navigate([route]);
  }

}