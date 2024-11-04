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
    snapshots?: string
}

export interface User {
    dateCreated: Date,
    ip: string,
    schoolId?: string,
    lessonNumber?: number
}