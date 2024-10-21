'use client'

import React, { useState, useEffect, useRef } from 'react'
import { WelcomeVicechancellor } from './sections/welcome-vicechancellor'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Home, Building2, LayoutDashboard, UserCog, BarChart2, ListTodo, Pin } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Link } from "react-scroll"
import { cn } from "@/lib/utils"
import { FacultadDataSection } from './sections/sections-facultad-data-section'
import { FacultyStructureSection } from './sections/estructura-facultad-section'
import { EquipoResponsableSectionComponent } from './sections/equipo-responsable-section'
import { FodaSection } from './sections/foda-section'
import EventsViewerComponent from './sections/events-viewer'
import PoaActions from './sections/poa-actions'
import { useAuth } from '@/contexts/auth-context'

export interface SectionProps {
  name: string
  isActive: boolean
  userId: number
  rolId: number
  isEditable: boolean
  poaId: number
  facultyId: number
}

const sections = [
  { name: "Bienvenida", icon: Home, component: WelcomeVicechancellor },
  { name: "Agregar/confirmar datos de la facultad", icon: Building2, component: FacultadDataSection },
  { name: "Agregar/confirmar Estructura de la facultad", icon: LayoutDashboard, component: FacultyStructureSection },
  { name: "Agregar/confirmar equipo responsable POA", icon: UserCog, component: EquipoResponsableSectionComponent },
  { name: "Agregar/confirmar FODA", icon: BarChart2, component: FodaSection },
  { name: "Visualizar eventos", icon: ListTodo, component: EventsViewerComponent },
  { name: "Acciones", icon: Pin, component: PoaActions },
]

export function PoaAcademicApproval() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarFixed, setIsSidebarFixed] = useState(false)
  const [poaId, setPoaId] = useState<number | null>(null)
  const [facultyId, setFacultyId] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const { user, loading } = useAuth()

  const [userId, setUserId] = useState<number>()
  const [rolId, setRolId] = useState<number>()

  // Fetch para obtener el userId y rolId
  useEffect(() => {
    const fetchUserData = async () => {
      if (loading) {
        console.log("Cargando información del usuario...")
        return
      }

      if (!user) {
        console.log("No estás autenticado.")
        alert("No estás autenticado.")
        return
      }

      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario')
        }

        const userData = await userResponse.json()
        setUserId(userData.userId)
        setRolId(userData.roleId)

      } catch (error: any) {
        console.error("Error al obtener los datos del usuario:", error)
      }
    }

    fetchUserData()
  }, [user, loading])

  const handleSetActive = (to: string) => {
    setActiveSection(to)
    setTimeout(() => {
      setActiveSection(null)
    }, 1000)
  }

  const handleSelectFaculty = (selectedFacultyId: number, selectedPoaId: number) => {
    setFacultyId(selectedFacultyId)
    setPoaId(selectedPoaId)
  }

  return (
    <main className="flex bg-green-50 min-h-screen">
      <TooltipProvider>
        <aside 
          ref={sidebarRef}
          className={`fixed left-0 top-0 h-full bg-green-900 shadow-lg transition-all duration-300 ease-in-out z-50 flex flex-col justify-between ${
            isSidebarFixed || isSidebarVisible ? 'w-16 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <ScrollArea className="flex-grow">
            <nav className="p-2 flex flex-col items-center space-y-4">
              {sections.map((section) => (
                <Tooltip key={section.name}>
                  <TooltipTrigger asChild>
                    <div>
                      <Link
                        to={section.name}
                        spy={true}
                        smooth={true}
                        offset={-70}
                        duration={500}
                        onClick={() => handleSetActive(section.name)}
                      >
                        <Button
                          variant={activeSection === section.name ? "secondary" : "ghost"}
                          size="icon"
                          className={cn(
                            "w-12 h-12 rounded-lg transition-colors duration-200",
                            isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0',
                            activeSection === section.name ? 'bg-green-600 text-white' : 'text-green-300 hover:bg-green-800'
                          )}
                        >
                          {React.createElement(section.icon, { className: "h-6 w-6" })}
                          <span className="sr-only">{section.name}</span>
                        </Button>
                      </Link>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-green-800 text-white py-1 px-2 text-sm rounded">
                    <p>{section.name}</p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </nav>
          </ScrollArea>
        </aside>
      </TooltipProvider>
      <div 
        ref={mainRef}
        className={`flex-1 p-6 overflow-auto transition-all duration-300 ${
          isSidebarFixed || isSidebarVisible ? 'ml-16' : 'ml-0'
        }`}
      >
        {/* Renderizar WelcomeVicechancellor solo una vez */}
        <WelcomeVicechancellor onSelectFaculty={handleSelectFaculty} />

        {/* Renderizar las secciones solo si facultyId y poaId no son null */}
        {(facultyId !== null && poaId !== null && userId !== undefined && rolId !== undefined) && sections.map((section) => (
          <section.component
            key={section.name}
            name={section.name}
            isActive={activeSection === section.name}
            poaId={poaId}
            facultyId={facultyId}
            userId={userId}
            rolId={rolId}
            isEditable={false}
            onSelectFaculty={handleSelectFaculty}
          />
        ))}
      </div>
    </main>
  )
}
