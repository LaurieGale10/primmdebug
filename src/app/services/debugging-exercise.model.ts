import { DebuggingStage } from "../types/types";

export interface DebuggingExercise {
    id: string,
    title: string,
    description: string,
    program: string,
    testCases?: TestCase[],
    multipleChoiceOptions?: Map<DebuggingStage,string[]>,
    difficulty?: Difficulty, //This should be an enum
    language?: string,
    lineContainingError?: number,
    hints?: Map<DebuggingStage, string[]>,
    modifyText?: string
}

export enum Difficulty {
    easy = "easy",
    intermediate = "intermediate",
    hard = "hard"
}

export interface TestCase {
    input?: string[],
    expected: string,
    actual?: string
}