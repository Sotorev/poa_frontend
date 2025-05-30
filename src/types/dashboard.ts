export interface EventDate {
  eventDateId: number
  startExecutionDate: string | null
  endExecutionDate: string | null
  startDate: string
  endDate: string
  status: string
}

export interface Event {
  eventId: number
  name: string
  eventDates: EventDate[]
}

export interface StatusData {
  name: string
  count: number
  percentage: number
}

export interface DashboardData {
  facultyId: number
  name: string
  totalEvents: number
  statusData: StatusData[]
  allEvents: Event[]
}

export interface GanttItem {
  id: string
  name: string
  startDate: Date
  endDate: Date
  status: string
  progress: number
  isOverdue: boolean
  daysUntilDeadline: number
}
