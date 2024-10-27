'use client'

import React, { useState, useEffect, useRef } from 'react'
import { WelcomeVicechancellor } from './sections/welcome-vicechancellor'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Building2, 
  LayoutDashboard, 
  UserCog, 
  BarChart2, 
  ListTodo,
  Pin,
  CheckCheck
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Link } from "react-scroll"
import { cn } from "@/lib/utils"
import { FacultadDataSection } from './sections/sections-facultad-data-section'
import { FacultyStructureSection } from './sections/estructura-facultad-section'
import { EquipoResponsableSectionComponent } from './sections/equipo-responsable-section'
import { FodaSection } from './sections/foda-section'
import EventsViewerViceChancellorComponent from './sections/events-viewer/events-viewer-vicechancellor'
import PoaActions from './sections/poa-actions'
import { useCurrentUser } from '@/hooks/use-current-user'
export interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
  facultyId: number
  userId: number
  rolId: number
  isEditable: boolean
}

const sections = [
  { name: "Agregar/confirmar datos de la facultad", icon: Building2, component: FacultadDataSection },
  { name: "Agregar/confirmar Estructura de la facultad", icon: LayoutDashboard, component: FacultyStructureSection },
  { name: "Agregar/confirmar equipo responsable POA", icon: UserCog, component: EquipoResponsableSectionComponent },
  { name: "Agregar/confirmar FODA", icon: BarChart2, component: FodaSection },
  { name: "Visualizar eventos", icon: ListTodo, component: EventsViewerViceChancellorComponent },
  { name: "Acciones", icon: CheckCheck, component: PoaActions },
]

export function PoaAcademicApproval() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true) // Siempre visible para depuración
  const [isSidebarFixed, setIsSidebarFixed] = useState(false)
  const [poaId, setPoaId] = useState<number | null>(null)
  const [facultyId, setFacultyId] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [userId, setUserId] = useState<number>()
  const [rolId, setRolId] = useState<number>()
  const [roleName, setRoleName] = useState<string>()
  const user = useCurrentUser();

  // Fetch para obtener el userId y rolId
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user?.userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        })

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario')
        }

        const userData = await userResponse.json()
        setUserId(userData.userId)
        setRolId(userData.roleId)
        setRoleName(userData.role.roleName)

      } catch (error: any) {
        console.error("Error al obtener los datos del usuario:", error)
      }
    }

    fetchUserData()
  }, [user])

  // Manejar la activación de una sección
  const handleSetActive = (to: string) => {
    setActiveSection(to)
    setTimeout(() => {
      setActiveSection(null)
    }, 1000)
  }

  // Manejar la selección de una facultad desde WelcomeVicechancellor
  const handleSelectFaculty = (selectedFacultyId: number, selectedPoaId: number) => {
    setFacultyId(selectedFacultyId)
    setPoaId(selectedPoaId)
  }

  // Manejar el movimiento del mouse para mostrar/ocultar el sidebar
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (sidebarRef.current && !isSidebarFixed) {
        const sidebarWidth = sidebarRef.current.offsetWidth
        const shouldShow = event.clientX <= sidebarWidth + 20
        setIsSidebarVisible(shouldShow)
        console.log(`MouseX: ${event.clientX}, SidebarWidth: ${sidebarWidth}, Show: ${shouldShow}`)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isSidebarFixed])

  // Verificación de estados
  useEffect(() => {
    console.log("Estados actuales:")
    console.log("facultyId:", facultyId)
    console.log("poaId:", poaId)
    console.log("userId:", userId)
    console.log("rolId:", rolId)
    console.log("roleName:", roleName)
  }, [facultyId, poaId, userId, rolId, roleName])

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
          <div className="p-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarFixed(!isSidebarFixed)}
                  className={`w-8 h-8 rounded-lg hover:bg-green-800 transition-colors duration-200 ${
                    isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <Pin className={`h-4 w-4 ${isSidebarFixed ? 'text-green-400' : 'text-green-300'}`} />
                  <span className="sr-only">Fijar barra lateral</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-green-800 text-white py-1 px-2 text-sm rounded">
                <p>{isSidebarFixed ? 'Desfijar barra lateral' : 'Fijar barra lateral'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
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
        {(facultyId !== null && poaId !== null && userId !== undefined && rolId !== undefined) && (
          <div className="space-y-8">
            {sections.map((section) => (
              <section.component
                key={section.name}
                name={section.name}
                isActive={activeSection === section.name}
                poaId={poaId}
                facultyId={facultyId}
                userId={userId}
                rolId={rolId}
                isEditable={false}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
