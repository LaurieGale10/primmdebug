export enum DebuggingStage {
    predict = "predict",
    run = "run",
    spotIssue = "spot_the_issue",
    inspectCode = "inspect_the_code",
    findError = "find_the_error",
    fixError = "fix_the_error",
    test = "test",
    completedTest = "completed_test",
    modify = "modify",
    make = "make"
}

export enum ChallengeProgress {
    unattempted = "unattempted",
    attempted = "attempted",
    completed = "completed"
}

export enum PageToNavigate {
    homepage,
    challengeDashboard
}