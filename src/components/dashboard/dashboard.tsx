// src/components/dashboard/Dashboard.tsx

'use client'

import React from 'react'
import {
  BarChart,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Users,
  FileText,
  TrendingUp,
  Mail,
  Phone
} from 'lucide-react'
import { auth } from '@/auth'
import {
  StatCardProps,
  ChartCardProps,
  QuickActionButtonProps,
  User,
  Stats,
  ContactInfo
} from '@/types/dashboard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Definición de las propiedades que recibirá el componente DashboardComponent
interface DashboardComponentProps {
  user: User;
  stats: Stats;
}

export default async function Dashboard() {
  const session = await auth();
  if (!session) return null
  const user: User = session.user
  // Datos de ejemplo - reemplaza con datos reales de tu backend
  const stats: Stats = {
    completedProjects: 12,
    ongoingProjects: 5,
    delayedProjects: 2,
    upcomingDeadlines: 3,
    budgetUtilization: 75
  }

  return (
    <DashboardComponent user={user} stats={stats} />
  )
}

function DashboardComponent({ user, stats }: DashboardComponentProps) {
  // Datos de contacto - en un caso real, podrías obtener esto de una API
  const contactInfo: ContactInfo[] = [
    { name: 'Josué Robles', phone: '43308290', email: 'rubenrobles@umes.edu.gt' },
    { name: 'José Soto', phone: '46238343', email: 'manrev@umes.edu.gt' },
    { name: 'Keithleen Ruíz', phone: '41763482', email: 'ivana2003@umes.edu.gt' },
    { name: 'Geronimo Rodriguez', phone: '51634521', email: 'geronimorodriguez@umes.edu.gt' }
  ]

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Título Principal */}
        <h1 className="text-3xl font-bold text-primary mb-6">Panel de Control POA</h1>

        {/* Tarjeta de Bienvenida */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bienvenido, {user?.username}</CardTitle>
            <CardDescription>
              El Plan Operativo Anual (POA) es un documento que detalla los objetivos, estrategias y actividades de una facultad o unidad académica en alineación con el Plan Estratégico de la Universidad Mesoamericana.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Su propósito es establecer una hoja de ruta clara para el cumplimiento de metas académicas y administrativas, fomentando la eficiencia, el desarrollo profesional, y la mejora continua en áreas clave como la oferta académica, investigación, seguimiento estudiantil y organización interna.
            </p>
          </CardContent>
        </Card>

{/* 
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatCard icon={<CheckCircle className="h-8 w-8 text-green-500" />} title="Proyectos Completados" value={stats.completedProjects} />
          <StatCard icon={<Clock className="h-8 w-8 text-blue-500" />} title="Proyectos en Curso" value={stats.ongoingProjects} />
          <StatCard icon={<AlertTriangle className="h-8 w-8 text-yellow-500" />} title="Proyectos Retrasados" value={stats.delayedProjects} />
          <StatCard icon={<Calendar className="h-8 w-8 text-purple-500" />} title="Próximas Fechas Límite" value={stats.upcomingDeadlines} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          <ChartCard title="Progreso General" chart={<BarChart className="h-48 w-full text-primary" />} />
          <ChartCard title="Utilización del Presupuesto" chart={
            <div className="flex flex-col items-center justify-center h-48">
              <Progress value={stats.budgetUtilization} className="w-full mb-4" />
              <p className="text-2xl font-bold text-primary">{stats.budgetUtilization}%</p>
            </div>
          } />
          <Card>
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickActionButton icon={<FileText className="h-5 w-5" />} title="Crear Nuevo Informe" />
              <QuickActionButton icon={<Users className="h-5 w-5" />} title="Gestionar Usuarios" />
              <QuickActionButton icon={<TrendingUp className="h-5 w-5" />} title="Ver Estadísticas" />
            </CardContent>
          </Card>
        </div> */}

        {/* Tarjeta de Medios de Contacto */}
        <Card>
          <CardHeader>
            <CardTitle>Medios de contacto para asistencia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarFallback>{contact.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold">{contact.name}</h4>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Phone className="h-4 w-4 mr-1" /> {contact.phone}
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center">
                      <Mail className="h-4 w-4 mr-1" /> {contact.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}

function ChartCard({ title, chart }: ChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{chart}</CardContent>
    </Card>
  )
}

function QuickActionButton({ icon, title }: QuickActionButtonProps) {
  return (
    <Button variant="outline" className="w-full justify-start">
      {icon}
      <span className="ml-2">{title}</span>
    </Button>
  )
}
