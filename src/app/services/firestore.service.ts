import { Component, inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, where} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import dedent from 'dedent';

import { DebuggingExercise, Difficulty, TestCase } from './debugging-exercise.model';
import { DebuggingStage } from '../types/types';
import { CollectionReference, DocumentReference, DocumentSnapshot, orderBy, query, updateDoc } from 'firebase/firestore';
import { WhitespacePreserverPipe } from '../pipes/whitespace-preserver.pipe';
import { environment } from '../../environments/environment.development';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);
  studentIdsCollection: CollectionReference | undefined;
  unparsedExercises$: Observable<DebuggingExercise[] | null> | undefined;
  exercises: DebuggingExercise[] | null = null;

  constructor(private http: HttpClient, private whitespacePreserverPipe: WhitespacePreserverPipe) {
    //Only want to fetch student_ids collection if we're wanting to log changes
    if (environment.logChanges && !environment.mockData) {
      this.studentIdsCollection = collection(this.firestore, 'student_ids');
    }
    else if (environment.logChanges && environment.mockData) {
      this.studentIdsCollection = collection(this.firestore, 'mock_student_ids');
    }
    const exercisesCollection = collection(this.firestore, 'exercises');
    const exercisesQuery = query(exercisesCollection, orderBy('difficulty'));
    this.unparsedExercises$ = collectionData(
      exercisesQuery,
      {idField: "id"}
    ) as Observable<DebuggingExercise[] | null>;
  }

  isEmptyString(value: string): boolean {
    return value.trim().length === 0;
  }

  //Perhaps use when I have more time to test to make code in method below neater
  removeEmptyValues(arr: string[]): string[] {
    return arr.filter(item => {
      !!item && !this.isEmptyString(item)
    });
  }
  
  parseMultipleChoiceOptions(exercise: any): Map<DebuggingStage, Array<string>> | null {
    const multipleChoiceOptions: Map<DebuggingStage, Array<string>> = new Map<DebuggingStage, Array<string>>();

    if (!!exercise["identify_fault_multiple_choice"] && Array.isArray(exercise["identify_fault_multiple_choice"])) {
      const spotDefectOptions: Array<string> = [];
      for (let i: number = 0; i < exercise["identify_fault_multiple_choice"].length; i++) {
        if (!this.isEmptyString(exercise["identify_fault_multiple_choice"][i])) {
          spotDefectOptions.push(dedent(exercise["identify_fault_multiple_choice"][i]));
        }
      }
      if (spotDefectOptions.length > 1) {
        multipleChoiceOptions.set(DebuggingStage.spotDefect, spotDefectOptions);
      }
    }

    if (!!exercise["hypothesis_generation_multiple_choice"] && Array.isArray(exercise["hypothesis_generation_multiple_choice"])) {
      const inspectCodeOptions: Array<string> = [];
      for (let i: number = 0; i < exercise["hypothesis_generation_multiple_choice"].length; i++) {
        if (!this.isEmptyString(exercise["hypothesis_generation_multiple_choice"][i])) {
          inspectCodeOptions.push(dedent(exercise["hypothesis_generation_multiple_choice"][i]));
        }
      }
      if (inspectCodeOptions.length > 1) {
        multipleChoiceOptions.set(DebuggingStage.inspectCode, inspectCodeOptions);
      }
    }

    if (!!exercise["find_error_multiple_choice"] && Array.isArray(exercise["find_error_multiple_choice"])) {
      const findErrorOptions: Array<string> = [];
      for (let i: number = 0; i < exercise["find_error_multiple_choice"].length; i++) {
        if (!this.isEmptyString(exercise["find_error_multiple_choice"][i])) {
          findErrorOptions.push(dedent(exercise["find_error_multiple_choice"][i]));
        }
      }
      if (findErrorOptions.length > 1) {
        multipleChoiceOptions.set(DebuggingStage.findError, findErrorOptions);
      }
    }
    return multipleChoiceOptions.size > 0 ? multipleChoiceOptions : null; 
  }

  parseDifficulty(exercise: any): Difficulty | null {
    if (exercise["difficulty"]) {
      const difficulty: number = exercise["difficulty"];
      switch (difficulty) {
        case 1:
          return Difficulty.easy;
        case 2:
          return Difficulty.intermediate;
        case 3:
          return Difficulty.hard;
      }
    }
    return null;
  }

  parseTestCase(testCase: any): TestCase {
    //Test case must have one of the following fields
    if ((testCase["expected"] && typeof testCase["expected"] === "string")
      || (testCase["actual"] && typeof testCase["actual"] === "string")
      || (testCase["input"] && Array.isArray(testCase["input"]))
    ) {
      const result: TestCase = {
        expected: testCase["expected"]
      };
      //No point adding optional fields unless we have the "expected field", so putting checks for these inside this if statement
      if (testCase["actual"] && typeof testCase["actual"] === "string") {
        result.actual = testCase["actual"];
      }
      if (testCase["input"] && Array.isArray(testCase["input"])) {
        const inputField: string[] = [];
        testCase["input"].forEach((input: string) => {
          inputField.push(input); //String type checking needed here?
        });
        if (inputField.length > 0) {
          result.input = inputField;
        }
      }
      return testCase;
    }
    throw new Error("Invalid test case format: " + JSON.stringify(testCase));
  }

  parseTestCases(exercise: any): TestCase[] {
    const testCases: TestCase[] = [];
    exercise["test_cases"].forEach((testCase: any) => {
      try {
        const parsedTestCase: TestCase = this.parseTestCase(testCase);
        testCases.push(parsedTestCase);
      }
      catch (error) {
        console.error("Error parsing test case: ", error);
      }
    });
    if (testCases.length === 0) {
      throw new Error("No test cases found for this exercise\nUnparsed exercise: " + exercise);
    }
    return testCases;
  }

  parseLanguage(exercise: any): string | null {
    return exercise["language"] ? exercise["language"] : null;
  }

  parseLineContainingError(exercise: any): number | null {
    return exercise["line_containing_error"] ? exercise["line_containing_error"] : null;
  }

  parseHints(exercise: any): Map<DebuggingStage, string[]> | null {
    if (exercise["hints"]) {
      const parsedHints: Map<DebuggingStage, string[]> = new Map<DebuggingStage, string[]>();
      //For now, we'll only have hints for the find_the_error and fix_the_error stages
      if (exercise["hints"]["find_the_error"] && Array.isArray(exercise["hints"]["find_the_error"])) {
        parsedHints.set(DebuggingStage.findError, exercise["hints"]["find_the_error"]);
      }
      if (exercise["hints"]["fix_the_error"] && Array.isArray(exercise["hints"]["fix_the_error"])) {
        parsedHints.set(DebuggingStage.fixError, exercise["hints"]["fix_the_error"]);
      }
      return parsedHints.size > 0 ? parsedHints : null;
    }
    return null;
  }

  parseModifyText(exercise: any): string | null {
    return exercise["modify_text"] ? exercise["modify_text"] : null;
  }
  
  /**
   * Checks whether debugging exercises contain the necessary information required for a valid debugging exercise.
   * @param exercise The debugging exercise
   * @returns Whethert
   */
  exerciseContainsNecessaryData(exercise: DebuggingExercise): boolean {
    return !!(exercise.title && !this.isEmptyString(exercise.title) && exercise.description && !this.isEmptyString(exercise.description) && exercise.program && !this.isEmptyString(exercise.program));
  }

  parseDebuggingExercise(unparsedExercise: any): DebuggingExercise | null {
    if (this.exerciseContainsNecessaryData(unparsedExercise)) { //TODO: Improve error handling here; if this method throws an error, parsing for all the other exercises should still be attempted
      const multiChoiceOptions: Map<DebuggingStage, string[]> | null = this.parseMultipleChoiceOptions(unparsedExercise);
      const difficulty: Difficulty | null = this.parseDifficulty(unparsedExercise);
      let testCases: TestCase[] = []; //TODO: If we can't parse the test cases, we don't want to return the exercise
      try {
        testCases = this.parseTestCases(unparsedExercise);
      }
      catch (error) {
        console.error(error);
      }
      const language: string | null = this.parseLanguage(unparsedExercise);
      const lineContainingError: number | null = this.parseLineContainingError(unparsedExercise);
      const hints: Map<DebuggingStage, string[]> | null = this.parseHints(unparsedExercise);
      const modifyText: string | null = this.parseModifyText(unparsedExercise);
      const parsedExercise: DebuggingExercise = {
        id: unparsedExercise["id"],
        title: unparsedExercise["title"],
        description: this.whitespacePreserverPipe.transform(unparsedExercise["description"]),
        program: this.whitespacePreserverPipe.transform(unparsedExercise["program"]),
        testCases: testCases
      };
      if (multiChoiceOptions) {
        parsedExercise.multipleChoiceOptions = multiChoiceOptions; 
      }
      if (difficulty) {
        parsedExercise.difficulty = difficulty;
      }
      if (testCases) {
        parsedExercise.testCases = testCases;
      }
      if (language) {
        parsedExercise.language = language;
      }
      if (lineContainingError) {
        parsedExercise.lineContainingError = lineContainingError;
      }
      if (hints) {
        parsedExercise.hints = hints;
      }
      if (modifyText) {
        parsedExercise.modifyText = modifyText;
      }
      return parsedExercise;
    }
    return null;
  }

  parseDebuggingExercises(unparsedExercises: any): DebuggingExercise[] | null {
    let parsedDebuggingExercises: DebuggingExercise[] = [];
    unparsedExercises.forEach((exercise: any) => {
      const parsedExercise: DebuggingExercise | null = this.parseDebuggingExercise(exercise);
      if (parsedExercise) {
        parsedDebuggingExercises.push(parsedExercise);
      }
    });
    return parsedDebuggingExercises.length > 0 ? parsedDebuggingExercises : null;
  }

  async getExerciseById(id: string): Promise<DebuggingExercise | null> {
    const docRef = doc(this.firestore, "exercises", id);
    const docSnapshot = await getDoc(docRef);
    return docSnapshot.data() as DebuggingExercise | null; //How to get ID returning here?
  }

  authenticateStudent(docRef: DocumentReference, docSnapshot: DocumentSnapshot, id: string) {
    const dataToAdd: any = {};
    sessionStorage.setItem("studentId", id);
    if (!docSnapshot.data()!["ip"]) {
      if (!docSnapshot.data()!["dateFirstAccessed"]) {
        dataToAdd["dateFirstAccessed"] = new Date();
      }
      this.http.get("https://api64.ipify.org?format=json").subscribe((result: any) => {
        if (result["ip"]) {
          dataToAdd["ip"] = result["ip"]; //Currently doesn't work; need to wait on this or write two separate updateDoc calls
        }
        updateDoc(docRef, dataToAdd);
      });
    }
  }

  async validateStudentId(id: string): Promise<boolean | null> {
    const docRef = doc(this.studentIdsCollection!, id);
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists() && docSnapshot.data()) {
      this.authenticateStudent(docRef, docSnapshot, id);
    }
    //If docSnapshot.exists() return true then add IP if this doesn't already exist (this will change each time but don't think I need to collect this every time)
    return docSnapshot.exists();
  }

  async getStudentSchool(studentId: string): Promise<string | null> {
    if (environment.logChanges) {
      const studentIdDbName: string = environment.mockData ? "mock_student_ids" : "student_ids";
      const docRef = doc(this.firestore, studentIdDbName, studentId);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.exists() && docSnapshot.data()) {
        return docSnapshot.data()["school"];
      }
    }
    return null;
  }

  getUnparsedExercises(): Observable<DebuggingExercise[] | null> {
    return this.unparsedExercises$!;
  }

}
