export interface FacultyWithEvents {
    facultyId: number
    name: string
    totalEvents: number
    statusData: stateEventCounts[]
    allEvents: AllEvents[]
}

export interface stateEventCounts {
    name: string
    count: number
    percentage: number
}

export interface AllEvents {
    eventId: number
    name: string
    startExecutionDate?: string
    endExecutionDate?: string
    startDate: string
    endDate: string
    status: string
}