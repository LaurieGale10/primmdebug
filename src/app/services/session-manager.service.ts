import { Injectable } from '@angular/core';
import { DebuggingStage } from '../types/types';

@Injectable({
  providedIn: 'root'
})
export class SessionManagerService {

  constructor() { }

  clearSessionStorage() {
    sessionStorage.clear();
  }

  setDebuggingStage(stage: DebuggingStage) {
    sessionStorage.setItem("debuggingStage", stage);
  }
  
  getDebuggingStage(): DebuggingStage | null {
    return sessionStorage.getItem("debuggingStage") as DebuggingStage | null;
  }

  setPredictRunIteration(predictRunIteration: number | null) {
    if (predictRunIteration === null) {
      sessionStorage.removeItem("predictRunIteration");
      return;
    }
    sessionStorage.setItem("predictRunIteration", predictRunIteration.toString());
  }

  getPredictRunIteration(): number | null {
    const iteration = sessionStorage.getItem("predictRunIteration");
    return iteration ? parseInt(iteration) : null;
  }

  setPreviousResponses(response: string) {
    sessionStorage.setItem("previousResponses", response);
  }

  getPreviousResponses(): Map<DebuggingStage, string[]> | null {
    let previousResponses = null;
    if (!sessionStorage.getItem("previousResponses")) {
      return null;
    }
    try {
      previousResponses = JSON.parse(sessionStorage.getItem("previousResponses")!);
    }
    catch (error) {
      return null;
    }
    return new Map<DebuggingStage, string[]>(previousResponses);
  }

  setCurrentResponse(response: string | null) {
    if (response === null) {
      sessionStorage.removeItem("currentResponse");
      return;
    }
    sessionStorage.setItem("currentResponse", response);
  }

  getCurrentResponse(): string | null {
    return sessionStorage.getItem("currentResponse");
  }

  setSelectedLineNumber(lineNumber: number | null) {
    if (lineNumber === null) {
      sessionStorage.removeItem("selectedLineNumber");
      return;
    }
    sessionStorage.setItem("selectedLineNumber", lineNumber.toString());
  }

  getSelectedLineNumber(): number | null {
    const lineNumber = sessionStorage.getItem("selectedLineNumber");
    return lineNumber ? parseInt(lineNumber) : null;
  }
}
