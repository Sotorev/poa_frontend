"use client"

import type { GanttItem } from "@/types/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock, Calendar } from "lucide-react"

interface EventAlertsProps {
	upcomingEvents: GanttItem[]
	overdueEvents: GanttItem[]
}

export function EventAlerts({ upcomingEvents, overdueEvents }: EventAlertsProps) {
	return (
		<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
			{/* Upcoming Events */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-yellow-600">
						<Clock className="h-5 w-5" />
						Eventos Próximos a Vencer
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{upcomingEvents.length === 0 ? (
						<p className="text-sm text-muted-foreground">No hay eventos próximos a vencer</p>
					) : (
						upcomingEvents.map((event) => (
							<Alert key={event.id} className="border-yellow-200 bg-yellow-50">
								<Calendar className="h-4 w-4" />
								<AlertDescription>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-sm">{event.name}</p>
											<p className="text-xs text-muted-foreground">
												Vence en {event.daysUntilDeadline} día{event.daysUntilDeadline !== 1 ? "s" : ""}
											</p>
										</div>
										<Badge variant="outline">{event.status}</Badge>
									</div>
								</AlertDescription>
							</Alert>
						))
					)}
				</CardContent>
			</Card>

			{/* Overdue Events */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2 text-red-600">
						<AlertTriangle className="h-5 w-5" />
						Eventos Retrasados
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{overdueEvents.length === 0 ? (
						<p className="text-sm text-muted-foreground">No hay eventos retrasados</p>
					) : (
						overdueEvents.map((event) => (
							<Alert key={event.id} variant="destructive">
								<AlertTriangle className="h-4 w-4" />
								<AlertDescription>
									<div className="flex items-center justify-between">
										<div>
											<p className="font-medium text-sm">{event.name}</p>
											<p className="text-xs">
												Retrasado por {Math.abs(event.daysUntilDeadline)} día
												{Math.abs(event.daysUntilDeadline) !== 1 ? "s" : ""}
											</p>
										</div>
										<Badge variant="destructive">{event.status}</Badge>
									</div>
								</AlertDescription>
							</Alert>
						))
					)}
				</CardContent>
			</Card>
		</div>
	)
}
