"use client"

import type { StatusData } from "@/types/dashboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Calendar, TrendingUp } from "lucide-react"

interface StatusCardsProps {
	statusData: StatusData[]
	totalEvents: number
}

export function StatusCards({ statusData, totalEvents }: StatusCardsProps) {
	const getStatusIcon = (status: string) => {
		switch (status) {
			case "Finalizado":
				return <CheckCircle className="h-6 w-6 text-green-500" />
			case "En ejecución":
				return <Clock className="h-6 w-6 text-yellow-500" />
			case "Planificación":
				return <Calendar className="h-6 w-6 text-blue-500" />
			default:
				return <TrendingUp className="h-6 w-6 text-gray-500" />
		}
	}

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Finalizado":
				return "from-green-500 to-green-600"
			case "En ejecución":
				return "from-yellow-500 to-yellow-600"
			case "Planificación":
				return "from-blue-500 to-blue-600"
			default:
				return "from-gray-500 to-gray-600"
		}
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
			{statusData.map((status) => (
				<Card key={status.name} className="relative overflow-hidden">
					<div className={`absolute inset-0 bg-gradient-to-br ${getStatusColor(status.name)} opacity-5`}></div>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{status.name}</CardTitle>
						{getStatusIcon(status.name)}
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold mb-2">{status.count}</div>
						<div className="space-y-2">
							<Progress value={status.percentage} className="h-2" />
							<p className="text-xs text-muted-foreground">
								{status.percentage.toFixed(1)}% del total ({totalEvents} eventos)
							</p>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	)
}
