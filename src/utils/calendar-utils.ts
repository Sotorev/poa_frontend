import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isWithinInterval,
} from "date-fns"
import { es } from "date-fns/locale"
import type { CalendarEvent } from "../types/event"

/**
 * Obtiene todos los días que debe mostrar el calendario para un mes
 */
export function getCalendarDays(date: Date) {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Lunes como primer día
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  return eachDayOfInterval({ start: calendarStart, end: calendarEnd })
}

/**
 * Formatea la fecha como nombre del mes y año (ej: "mayo 2024")
 */
export function formatMonthYear(date: Date): string {
  return format(date, "MMMM yyyy", { locale: es })
}

/**
 * Filtra eventos que ocurren en un día específico
 */
export function getEventsForDay(events: CalendarEvent[], day: Date): CalendarEvent[] {
  return events.filter((event) => {
    return isWithinInterval(day, { start: event.startDate, end: event.endDate })
  })
}

/**
 * Avanza al mes siguiente
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}

/**
 * Retrocede al mes anterior
 */
export function getPreviousMonth(date: Date): Date {
  return subMonths(date, 1)
}

/**
 * Comprueba si un día pertenece al mes actual mostrado
 */
export function isCurrentMonth(day: Date, currentDate: Date): boolean {
  return isSameMonth(day, currentDate)
}

/**
 * Comprueba si un evento comienza en el día especificado
 */
export function isEventStart(event: CalendarEvent, day: Date): boolean {
  return isSameDay(event.startDate, day)
}

/**
 * Comprueba si un evento termina en el día especificado
 */
export function isEventEnd(event: CalendarEvent, day: Date): boolean {
  return isSameDay(event.endDate, day)
}

/**
 * Formatea un rango de fechas para mostrar
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  if (isSameDay(startDate, endDate)) {
    return format(startDate, "d 'de' MMMM, yyyy", { locale: es })
  }

  return `${format(startDate, "d 'de' MMMM", { locale: es })} - ${format(endDate, "d 'de' MMMM, yyyy", { locale: es })}`
}