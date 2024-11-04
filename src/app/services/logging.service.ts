import { inject, Injectable } from '@angular/core';
import { CollectionReference, DocumentReference, Firestore, addDoc, arrayUnion, collection, collectionData, doc, updateDoc, where} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { ExerciseLog, StageLog } from './logging.model';
import { DebuggingStage } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  private firestore: Firestore = inject(Firestore);
  logChanges: boolean = false;
  
  exerciseId: string | undefined;
  exerciseLogReference: DocumentReference | undefined;
  userId: string | null = null;
  usersCollection: CollectionReference | undefined;
  exerciseLogsCollection: CollectionReference | undefined;
  stageLogsCollection: CollectionReference | undefined;

  //Variables associated with stringifying of debugging stage names.
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

  constructor() { 
    this.exerciseLogsCollection = collection(this.firestore, 'exercise_logs');
    this.stageLogsCollection = collection(this.firestore, 'stage_logs'); //TODO: Implement error handling here
    this.usersCollection = collection(this.firestore, "users");
  }
  
  //@LogIfEnabled()
  createUserId() {
    if (this.logChanges && this.usersCollection) {
      addDoc(this.usersCollection, {
        dateCreated: new Date()
        //IP address here on in exerise log?
      }).then((documentReference: DocumentReference) => {
        this.userId = documentReference.id;
      });
    }
  }

  //@LogIfEnabled()
  getUserId(): string | null {
    return this.logChanges ? this.userId : null;
  }

  setExerciseId(id: string) {
    this.exerciseId = id;
  }

  //@LogIfEnabled()
  createExerciseLog() {
    if (this.logChanges) {
      const exerciseLog: ExerciseLog = {
        userId: this.userId!,
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

  //@LogIfEnabled()
  async saveStageLog(stageLog: StageLog): Promise<DocumentReference | null> {
    if (this.logChanges) {
      const docRef = await addDoc(this.stageLogsCollection!, stageLog);
      updateDoc(this.exerciseLogReference!, {
        stageLogIds: arrayUnion(docRef.id)
      });
      return docRef;
    }
    return null;
  }

  //@LogIfEnabled()
  addProgramLogsToStageLogs(stageLogDocRef: DocumentReference, programLogs: any) {
    if (this.logChanges) {
      updateDoc(stageLogDocRef, {
        programLogs: programLogs
      });
    }
  }
  
  stringifyDebuggingStageLog(): string {
    return this.overallStageCounter+"_"+this.currentDebuggingStage+"_"+this.debuggingStageCounters.get(this.currentDebuggingStage!);
  }

}