// src/components/poa/PoaAcademicApproval.tsx
'use client'

import React, { useState, useEffect, useRef, useMemo } from 'react'
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
  CheckCheck,
  Wallet,
  WalletMinimal,
  Percent
} from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Link } from "react-scroll"
import { cn } from "@/lib/utils"
import { FacultadDataSection } from './sections/sections-facultad-data-section'
import { FacultyStructureSection } from './sections/estructura-facultad-section'
import { EquipoResponsableSectionComponent } from './sections/equipo-responsable-section'
import { FodaSection } from './sections/foda-section'
import EventsViewerViceChancellorComponent from './sections/events-viewer/events-viewer-vicechancellor'
import { CostReport } from './sections/cost-report'
import { ResourceManagementComponent } from './sections/resource-management'
import { PoaActions } from './sections/poa-actions'
import { useCurrentUser } from '@/hooks/use-current-user'

export interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
  facultyId: number
  userId: number
  rolId: number
  isEditable: boolean
  roleName: string
}

interface Section {
  name: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  component: React.ComponentType<SectionProps>
  roles: string[]
}

const allSections: Section[] = [
  {
    name: "Gestión de Recursos",
    icon: WalletMinimal,
    component: ResourceManagementComponent,
    roles: ["Tesorería", "Administrador"]
  },
  {
    name: "Datos de la facultad",
    icon: Building2,
    component: FacultadDataSection,
    roles: ["Vicerrector académico", "Vicerrector administrativo", "Administrador", "Rector", "Tesorería"]
  },
  {
    name: "Estructura de la facultad",
    icon: LayoutDashboard,
    component: FacultyStructureSection,
    roles: ["Vicerrector académico", "Administrador", "Rector", "Tesorería"]
  },
  {
    name: "Equipo responsable POA",
    icon: UserCog,
    component: EquipoResponsableSectionComponent,
    roles: ["Vicerrector académico", "Administrador", "Rector", "Tesorería"]
  },
  {
    name: "FODA",
    icon: BarChart2,
    component: FodaSection,
    roles: ["Vicerrector académico", "Administrador", "Rector", "Tesorería"]
  },
  {
    name: "Eventos",
    icon: ListTodo,
    component: EventsViewerViceChancellorComponent,
    roles: ["Vicerrector académico", "Vicerrector administrativo", "Administrador", "Rector", "Tesorería"]
  },
  {
    name: "Reporte de costos de eventos del POA",
    icon: Percent,
    component: CostReport,
    roles: ["Vicerrector académico", "Vicerrector administrativo", "Administrador", "Rector", "Tesorería"]
  },
  {
    name: "Acciones",
    icon: CheckCheck,
    component: PoaActions,
    roles: ["Vicerrector académico", "Vicerrector administrativo", "Administrador"]
  },
]

// Función para normalizar nombres de sección
const normalizeSectionName = (name: string) => name.replace(/\s+/g, '-').toLowerCase();

export function PoaAcademicApproval() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(true)
  const [isSidebarFixed, setIsSidebarFixed] = useState(false)
  const [poaId, setPoaId] = useState<number | null>(null)
  const [facultyId, setFacultyId] = useState<number | null>(null)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [userId, setUserId] = useState<number>()
  const [rolId, setRolId] = useState<number>()
  const [roleName, setRoleName] = useState<string>()
  const user = useCurrentUser();

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

  const handleSetActive = (normalizedName: string) => {
    setActiveSection(normalizedName)
    setTimeout(() => {
      setActiveSection(null)
    }, 1000)
  }

  const handleSelectFaculty = (selectedFacultyId: number, selectedPoaId: number) => {
    setFacultyId(selectedFacultyId)
    setPoaId(selectedPoaId)
  }

  const availableSections = useMemo(() => {
    if (!roleName) return []

    return allSections.filter(section => section.roles.includes(roleName))
  }, [roleName])

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

  // Función para exportar el POA a PDF
  const handleExportPdf = async () => {
    if (!facultyId) {
      alert("No se ha establecido el ID de la facultad.");
      return;
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reports/poa/poa-report/${poaId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
          'Authorization': `Bearer ${user?.token}`
        },
      });

      if (!response.ok) {
        throw new Error('Error al exportar el reporte a PDF.');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `POA_Report_Faculty_${facultyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      if (link.parentNode) {
        link.parentNode.removeChild(link);
      }
    } catch (error) {
      console.error('Error al exportar el PDF:', error);
      alert("Error al exportar el reporte a PDF.");
    }
  };

  return (
    <main className="flex bg-green-50 min-h-screen">
      <TooltipProvider>
        <aside
          ref={sidebarRef}
          className={`fixed left-0 top-0 h-full bg-green-900 shadow-lg transition-all duration-300 ease-in-out z-50 flex flex-col justify-between ${isSidebarFixed || isSidebarVisible ? 'w-16 opacity-100' : 'w-0 opacity-0'
            }`}
        >
          <ScrollArea className="flex-grow">
            <nav className="p-2 flex flex-col items-center space-y-4">
              {availableSections.map((section) => {
                const normalizedName = normalizeSectionName(section.name)
                return (
                  <Tooltip key={section.name}>
                    <TooltipTrigger asChild>
                      <div>
                        <Link
                          to={normalizedName}
                          spy={true}
                          smooth={true}
                          offset={-70}
                          duration={500}
                          onClick={() => handleSetActive(normalizedName)}
                        >
                          <Button
                            variant={activeSection === normalizedName ? "secondary" : "ghost"}
                            size="icon"
                            className={cn(
                              "w-12 h-12 rounded-lg transition-colors duration-200",
                              isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0',
                              activeSection === normalizedName ? 'bg-green-600 text-white' : 'text-green-300 hover:bg-green-800'
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
                )
              })}
            </nav>
          </ScrollArea>
          <div className="p-2 flex justify-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarFixed(!isSidebarFixed)}
                  className={`w-8 h-8 rounded-lg hover:bg-green-800 transition-colors duration-200 ${isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0'
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
        className={`flex-1 p-6 overflow-auto transition-all duration-300 ${isSidebarFixed || isSidebarVisible ? 'ml-16' : 'ml-0'
          }`}
      >
        {/* Renderizar WelcomeVicechancellor solo una vez */}
        <WelcomeVicechancellor onSelectFaculty={handleSelectFaculty} />

        {/* Renderizar las secciones solo si facultyId y poaId no son null */}
        {(facultyId !== null && poaId !== null && userId !== undefined && rolId !== undefined && roleName) && (


          <div className="space-y-8">
            {/* Botones para crear POA y exportar PDF */}
            <div className="mb-4 flex space-x-2">
              <Button onClick={handleExportPdf} disabled={!facultyId || !poaId}>
                Exportar a PDF
              </Button>
            </div>

            {availableSections.map((section) => {
              const normalizedName = normalizeSectionName(section.name)
              return (
                <div key={section.name} id={normalizedName}>
                  <section.component
                    name={section.name}
                    isActive={activeSection === normalizedName}
                    poaId={poaId}
                    facultyId={facultyId}
                    userId={userId}
                    rolId={rolId}
                    isEditable={section.name === "Gestión de Recursos"}
                    roleName={roleName}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
