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
    eventDates: EventDate[]
}

export interface EventDate {
    eventDateId: number
    startExecutionDate: string | null
    endExecutionDate: string | null
    startDate: string
    endDate: string
    status: string
}