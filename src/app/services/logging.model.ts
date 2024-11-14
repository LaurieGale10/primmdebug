export interface ExerciseLog {
    userId: string,
    exerciseId: string,
    time: Date,
    stageLogIds: string[],
    comments?: string
}

export interface StageLog {
    stage: string
    time: Date,
    programLogs?: string[]
    response?: string,
    correct?: boolean,
    focusEvents?: WindowFocusEvent[],
    testCaseLogs?: TestCasePaneLog,
    hintPaneLogs?: HintPaneLog
}

//When the user leaves the page for a particular PRIMMDebug challenge
export interface ExitLog {
    stage: string
    time: Date
}

export interface TestCasePaneLog {
    expansionChanges?: ToggleHelpPaneExpansionEvent[],
    paneContentChanges?: ChangeHelpPaneContentEvent[]
}

export interface HintPaneLog {
    expansionChanges?: ToggleHelpPaneExpansionEvent[],
    paneContentChanges?: ChangeHelpPaneContentEvent[]
}

/**
 * User event for storing data on whether content inside "help panels" (currently the test case or hint panels) are shown or hidden
 */
export interface ToggleHelpPaneExpansionEvent {
    newPaneView: PaneView,
    time: Date
}

export enum PaneView {
    open = "open",
    closed = "closed"
}

/**
 * User event for content that is displayed to user inside a "help panel" (currently the test case or hint panels)
 */
export interface ChangeHelpPaneContentEvent {
    newContent: string,
    time: Date
}

export interface WindowFocusEvent {
    focus: FocusType
    time: Date,
}

export enum FocusType {
    focusIn = "focus_in",
    focusOut = "focus_out"
}

export interface User {
    dateCreated: Date,
    ip?: string,
    schoolId?: string //To be added post-hoc
}