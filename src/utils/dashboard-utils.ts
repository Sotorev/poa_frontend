import type { Event, GanttItem } from "@/types/dashboard"

export function calculateDaysUntilDeadline(endDate: string): number {
	const today = new Date()
	const deadline = new Date(endDate)
	const diffTime = deadline.getTime() - today.getTime()
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

export function isOverdue(endDate: string, status: string): boolean {
	if (status === "Finalizado") return false
	const today = new Date()
	const deadline = new Date(endDate)
	return deadline < today
}

export function getStatusColor(status: string): string {
	switch (status) {
		case "Planificación":
			return "bg-blue-500"
		case "En ejecución":
			return "bg-yellow-500"
		case "Finalizado":
			return "bg-green-500"
		default:
			return "bg-gray-500"
	}
}

export function getStatusProgress(status: string): number {
	switch (status) {
		case "Planificación":
			return 0
		case "En ejecución":
			return 50
		case "Finalizado":
			return 100
		default:
			return 0
	}
}

export function transformEventsToGanttItems(events: Event[]): GanttItem[] {
	const ganttItems: GanttItem[] = []

	events.forEach((event) => {
		event.eventDates.forEach((eventDate, index) => {
			const daysUntilDeadline = calculateDaysUntilDeadline(eventDate.endDate)
			const isEventOverdue = isOverdue(eventDate.endDate, eventDate.status)

			// Use "Edición" instead of "Fase" for repeated events
			const eventName = event.eventDates.length > 1 ? `${event.name} - Edición ${index + 1}` : event.name

			ganttItems.push({
				id: `${event.eventId}-${eventDate.eventDateId}`,
				name: eventName,
				startDate: new Date(eventDate.startDate),
				endDate: new Date(eventDate.endDate),
				status: eventDate.status,
				progress: getStatusProgress(eventDate.status),
				isOverdue: isEventOverdue,
				daysUntilDeadline,
			})
		})
	})

	return ganttItems.sort((a, b) => a.startDate.getTime() - b.startDate.getTime())
}

export function getUpcomingEvents(ganttItems: GanttItem[]): GanttItem[] {
	return ganttItems.filter(
		(item) => item.daysUntilDeadline <= 7 && item.daysUntilDeadline >= 0 && item.status !== "Finalizado",
	)
}

export function getOverdueEvents(ganttItems: GanttItem[]): GanttItem[] {
	return ganttItems.filter((item) => item.isOverdue)
}

export function formatDateRange(startDate: Date, endDate: Date): string {
	const start = startDate.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	})
	const end = endDate.toLocaleDateString("es-ES", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	})

	return `${start} - ${end}`
}

export function getDurationInDays(startDate: Date, endDate: Date): number {
	const diffTime = endDate.getTime() - startDate.getTime()
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
}

export function getWeekdaysInRange(startDate: Date, endDate: Date): number {
	let count = 0
	const current = new Date(startDate)

	while (current <= endDate) {
		const dayOfWeek = current.getDay()
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			// Not Sunday or Saturday
			count++
		}
		current.setDate(current.getDate() + 1)
	}

	return count
}

export function isWorkingDay(date: Date): boolean {
	const dayOfWeek = date.getDay()
	return dayOfWeek !== 0 && dayOfWeek !== 6 // Not Sunday or Saturday
}
