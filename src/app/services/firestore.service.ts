import { Component, inject, Injectable } from '@angular/core';
import { Firestore, collection, collectionData, doc, getDoc, where} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import dedent from 'dedent';

import { DebuggingExercise, TestCase } from './debugging-exercise.model';
import { DebuggingStage } from '../types/types';
import { orderBy, query } from 'firebase/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  private firestore: Firestore = inject(Firestore);
  unparsedExercises$: Observable<DebuggingExercise[] | null> | undefined;
  exercises: DebuggingExercise[] | null = null;

  constructor() {
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

  parseDifficulty(exercise: any): string | null {
    if (exercise["difficulty"]) {
      const difficulty: number = exercise["difficulty"];
      switch (difficulty) {
        case 1:
          return "easy";
        case 2:
          return "intermediate";
        case 3:
          return "hard";
      }
    }
    return null;
  }

  parseTestCase(testCase: any): TestCase | null {
    //Check required field of TestCase first
    if (testCase["expected"] && typeof testCase["expected"] === "string") {
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
    return null;
  }

  parseTestCases(exercise: any): TestCase[] | null {
    if (exercise["test_cases"]) {
      const testCases: TestCase[] = [];
      exercise["test_cases"].forEach((testCase: any) => {
        const parsedTestCase: TestCase | null = this.parseTestCase(testCase);
        if (parsedTestCase) {
          testCases.push(parsedTestCase);
        }
      });
      if (testCases.length > 0) {
        return testCases;
      }
    }
    return null;
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
  
  /**
   * Maintains the whitespace (tabs and newlines) that is currently removed when saving a multi-line string
   * @param doc The string to add newlines to, annotated with \\n's and \\t's
   */
  restoreWhitespace(doc: string): string {
    return doc.replaceAll("\\t","\t").replaceAll("\\n", "\n").replaceAll(/\n\s/g, '\n');//Needs to remove any trailing spaces after \n's
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
    if (this.exerciseContainsNecessaryData(unparsedExercise)) {
      const multiChoiceOptions: Map<DebuggingStage, string[]> | null = this.parseMultipleChoiceOptions(unparsedExercise);
      const difficulty: string | null = this.parseDifficulty(unparsedExercise);
      const testCases: TestCase[] | null = this.parseTestCases(unparsedExercise);
      const language: string | null = this.parseLanguage(unparsedExercise);
      const lineContainingError: number | null = this.parseLineContainingError(unparsedExercise);
      const hints: Map<DebuggingStage, string[]> | null = this.parseHints(unparsedExercise);
      const parsedExercise: DebuggingExercise = {
        id: unparsedExercise["id"],
        title: unparsedExercise["title"],
        description: this.restoreWhitespace(unparsedExercise["description"]),
        program: this.restoreWhitespace(unparsedExercise["program"])
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

  getUnparsedExercises(): Observable<DebuggingExercise[] | null> {
    return this.unparsedExercises$!;
  }

}
