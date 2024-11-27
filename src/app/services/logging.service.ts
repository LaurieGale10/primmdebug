import { inject, Injectable } from '@angular/core';
import { CollectionReference, DocumentReference, Firestore, addDoc, arrayUnion, collection, updateDoc, where} from '@angular/fire/firestore';

import { ChangeHelpPaneContentEvent, ExerciseLog, FocusType, HintPaneLog, StageLog, TestCasePaneLog, ToggleHelpPaneExpansionEvent, WindowFocusEvent, ExitLog } from './logging.model';
import { DebuggingStage } from '../types/types';
import { environment } from '../../environments/environment.development';


@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  private firestore: Firestore = inject(Firestore);
  
  exerciseId: string | undefined;
  exerciseLogReference: DocumentReference | undefined;

  //Firestore collection references
  exerciseLogsCollection: CollectionReference | undefined;
  stageLogsCollection: CollectionReference | undefined;

  //Properties associated with stringifying of debugging stage names.
  overallStageCounter: number = 0;
  debuggingStageCounters: Map<DebuggingStage, number> = new Map<DebuggingStage, number>([
    [DebuggingStage.predict, 0],
    [DebuggingStage.run, 0],
    [DebuggingStage.spotDefect, 0],
    [DebuggingStage.inspectCode, 0],
    [DebuggingStage.findError, 0],
    [DebuggingStage.fixError, 0],
    [DebuggingStage.test, 0],
    [DebuggingStage.completedTest, 0],
    [DebuggingStage.modify, 0],
    [DebuggingStage.make, 0]
  ]);
  currentDebuggingStage: DebuggingStage | null = null;

  //Properties whose state is maintained within the logging service
  studentId: string | null = null;
  testCaseLogs: TestCasePaneLog | null = null;
  hintsLogs: HintPaneLog | null = null;
  windowFocusLogs: WindowFocusEvent[] = [];

  constructor() {
    if (!environment.mockData) {
      this.exerciseLogsCollection = collection(this.firestore, 'exercise_logs');
      this.stageLogsCollection = collection(this.firestore, 'stage_logs'); //TODO: Implement error handling here
    }
    else {
      this.exerciseLogsCollection = collection(this.firestore, 'mock_exercise_logs');
      this.stageLogsCollection = collection(this.firestore, 'mock_stage_logs'); //TODO: Implement error handling here
    }

  }

  getStudentId(): string | null {
    return this.studentId;
  }

  setStudentId(id: string) {
    this.studentId = id;
  }

  setExerciseId(id: string) {
    this.exerciseId = id;
  }

  createExerciseLog() {
    if (environment.logChanges) {
      const exerciseLog: ExerciseLog = {
        studentId: this.studentId!,
        exerciseId: this.exerciseId!,
        time: new Date(),
        stageLogIds: []
      }
      addDoc(this.exerciseLogsCollection!, exerciseLog).then((documentReference: DocumentReference) => {
        this.exerciseLogReference = documentReference;
      });
    }
  }

  getDebuggingStageCounter(debuggingStage: DebuggingStage): number {
    return this.debuggingStageCounters.get(debuggingStage)!;
  }

  setDebuggingStage(debuggingStage: DebuggingStage) {
    this.currentDebuggingStage = debuggingStage;
    this.debuggingStageCounters.set(this.currentDebuggingStage, this.debuggingStageCounters.get(this.currentDebuggingStage)! + 1);
    this.overallStageCounter += 1;
  }

  resetDebuggingStage() {
    this.currentDebuggingStage = null;
    this.overallStageCounter = 0;
    this.debuggingStageCounters.forEach((val, key) => {
      this.debuggingStageCounters.set(key,0);
    })
  }

  stringifyDebuggingStageLog(): string {
    return this.overallStageCounter+"_"+this.currentDebuggingStage+"_"+this.debuggingStageCounters.get(this.currentDebuggingStage!);
  }

  async saveStageLog(stageLog: StageLog): Promise<DocumentReference | null> {
    if (environment.logChanges) {
      //Check if there's any granular logs to add
      if (this.windowFocusLogs && this.windowFocusLogs.length > 0) {
        stageLog.focusEvents = this.windowFocusLogs;
      }
      if (this.testCaseLogs) {
        stageLog.testCaseLogs = this.testCaseLogs;
      }
      if (this.hintsLogs) {
        stageLog.hintPaneLogs = this.hintsLogs;
      }
      const docRef = await addDoc(this.stageLogsCollection!, stageLog);
      updateDoc(this.exerciseLogReference!, {
        stageLogIds: arrayUnion(docRef.id)
      });
      this.resetFinerGrainedLogs();
      return docRef;
    }
    return null;
  }

  async saveExitLog() {
    if (environment.logChanges) {
      const exitLog: ExitLog = {
        stage: "exit",
        time: new Date()
      }
      const docRef = await addDoc(this.stageLogsCollection!, exitLog);
      updateDoc(this.exerciseLogReference!, {
        stageLogIds: arrayUnion(docRef.id)
      });
    }
  }

  addProgramLogsToStageLogs(stageLogDocRef: DocumentReference, programLogs: any) {
    if (environment.logChanges) {
      updateDoc(stageLogDocRef, {
        programLogs: programLogs
      });
    }
  }
  
  //Methods to do with finer grained logs

  addFocusWindowEvent(focus: FocusType) {
    if (environment.logChanges) {
      this.windowFocusLogs.push({
        time: new Date(),
        focus: focus
      })
    }
  }

  /**
   * Checks whether the hint/test-case-related pane is of type ToggleHelpPaneExpansionEvent or not, necessary for successfully adding the log
   * Currently poor and inextensible method (doesn't expand beyond two types) written on a Friday evening
   * @param event 
   * @returns Whether the hint/test-case-related pane is of type ToggleHelpPaneExpansionEvent
   */
  isToggleHelpPaneExpansionEvent(event: ToggleHelpPaneExpansionEvent | ChangeHelpPaneContentEvent): boolean {
    return "newPaneView" in event;
  }


  addTestCaseLog(event: ToggleHelpPaneExpansionEvent | ChangeHelpPaneContentEvent) {
    //Checks the type of the event without having to make multiple functions
    if (this.isToggleHelpPaneExpansionEvent(event)) {
      if (!this.testCaseLogs) {
        this.testCaseLogs = {};
      }
      (this.testCaseLogs.expansionChanges ??= []).push(event as ToggleHelpPaneExpansionEvent);
    }
    else {
      if (!this.testCaseLogs) {
        this.testCaseLogs = {};
      }
      (this.testCaseLogs.paneContentChanges ??= []).push(event as ChangeHelpPaneContentEvent);
    }
  }


  addHintLog(event: ToggleHelpPaneExpansionEvent | ChangeHelpPaneContentEvent) {
    if (this.isToggleHelpPaneExpansionEvent(event)) {
      if (!this.hintsLogs) {
        this.hintsLogs = {};
      }
      (this.hintsLogs.expansionChanges ??= []).push(event as ToggleHelpPaneExpansionEvent);
    }
    else {
      if (!this.hintsLogs) {
        this.hintsLogs = {};
      }
      (this.hintsLogs.paneContentChanges ??= []).push(event as ChangeHelpPaneContentEvent);
    }
  }

  resetFinerGrainedLogs() {
    this.windowFocusLogs = [];
  }

}