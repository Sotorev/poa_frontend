'use client'

import { withAuth } from './auth/withAuth'
import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
	BarChart,
	CheckCircle,
	AlertTriangle,
	Clock,
	Calendar,
	Users,
	FileText,
	TrendingUp
} from 'lucide-react'

export  function Dashboard() {
	const { user } = useAuth()

	// Placeholder data - replace with actual data from your backend
	const stats = {
		completedProjects: 12,
		ongoingProjects: 5,
		delayedProjects: 2,
		upcomingDeadlines: 3,
		totalUsers: 50,
		totalDocuments: 120,
		budgetUtilization: 75
	}

	return (
		<div className="p-6 bg-gray-100 min-h-screen">
			<h1 className="text-3xl font-bold text-[#007041] mb-6">Panel de Control POA</h1>

			<div className="mb-6">
				<h2 className="text-xl font-semibold text-gray-800 mb-2">Bienvenido, {user?.username}</h2>
				<p className="text-gray-600">Aquí tiene un resumen del estado actual del Plan Operativo Anual.</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard icon={<CheckCircle className="h-8 w-8 text-green-500" />} title="Proyectos Completados" value={stats.completedProjects} />
				<StatCard icon={<Clock className="h-8 w-8 text-blue-500" />} title="Proyectos en Curso" value={stats.ongoingProjects} />
				<StatCard icon={<AlertTriangle className="h-8 w-8 text-yellow-500" />} title="Proyectos Retrasados" value={stats.delayedProjects} />
				<StatCard icon={<Calendar className="h-8 w-8 text-purple-500" />} title="Próximas Fechas Límite" value={stats.upcomingDeadlines} />
			</div>

			<div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				<ChartCard title="Progreso General" chart={<BarChart className="h-48 w-full text-[#007041]" />} />
				<ChartCard title="Utilización del Presupuesto" chart={
					<div className="flex items-center justify-center h-48">
						<div className="relative h-32 w-32">
							<svg className="h-full w-full" viewBox="0 0 36 36">
								<path
									d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
									fill="none"
									stroke="#E5E7EB"
									strokeWidth="3"
								/>
								<path
									d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
									fill="none"
									stroke="#007041"
									strokeWidth="3"
									strokeDasharray={`${stats.budgetUtilization}, 100`}
								/>
							</svg>
							<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-[#007041]">
								{stats.budgetUtilization}%
							</div>
						</div>
					</div>
				} />
				<div className="bg-white rounded-lg shadow p-6">
					<h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
					<div className="space-y-2">
						<QuickActionButton icon={<FileText className="h-5 w-5" />} title="Crear Nuevo Informe" />
						<QuickActionButton icon={<Users className="h-5 w-5" />} title="Gestionar Usuarios" />
						<QuickActionButton icon={<TrendingUp className="h-5 w-5" />} title="Ver Estadísticas" />
					</div>
				</div>
			</div>
		</div>
	)
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: number }) {
	return (
		<div className="bg-white rounded-lg shadow p-6 flex items-center">
			{icon}
			<div className="ml-4">
				<h3 className="text-lg font-semibold text-gray-800">{value}</h3>
				<p className="text-sm text-gray-600">{title}</p>
			</div>
		</div>
	)
}

function ChartCard({ title, chart }: { title: string, chart: React.ReactNode }) {
	return (
		<div className="bg-white rounded-lg shadow p-6">
			<h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
			{chart}
		</div>
	)
}

function QuickActionButton({ icon, title }: { icon: React.ReactNode, title: string }) {
	return (
		<button className="w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded text-gray-700 transition duration-150">
			<span className="flex items-center">
				{icon}
				<span className="ml-2">{title}</span>
			</span>
			<span>→</span>
		</button>
	)
}

export default withAuth(Dashboard, {
	requiredPermissions: [{ module: 'PEI', action: 'Edit' }],
	requiredRoles: ['Vice Chancellor', 'Pedagogical Coordinator']
})