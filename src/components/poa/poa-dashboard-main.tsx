"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Building2, 
  LayoutDashboard, 
  Users, 
  UserCog, 
  FileText, 
  BarChart2, 
  FilePlus, 
  ListTodo,
  Pin
} from 'lucide-react'
import { Link } from "react-scroll"
import { cn } from "@/lib/utils"
import { FacultadDataSection } from '../sections-facultad-data-section'
import { EstructuraFacultadSection } from '../sections-estructura-facultad-section'
import { EquipoResponsableSection } from '../sections-equipo-responsable-section'
import { FODASection } from '../sections-foda-section'
import { OtrosDocumentos } from '../sections-otros-documentos'
import { VisualizarIntervencionesSection } from '../visualizar-intervenciones-section'

const sections = [
  { name: "Agregar/confirmar datos de la facultad", icon: Building2, component: FacultadDataSection },
  { name: "Agregar/confirmar Estructura de la facultad", icon: LayoutDashboard, component: EstructuraFacultadSection },
  { name: "Agregar/confirmar equipo responsable POA", icon: UserCog, component: EquipoResponsableSection },
  { name: "Agregar/confirmar FODA", icon: BarChart2, component: FODASection },
  { name: "Agregar otros documentos", icon: FilePlus, component: OtrosDocumentos },
  { name: "Visualizar intervenciones", icon: ListTodo, component: VisualizarIntervencionesSection }
]

export function PoaDashboardMain() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarFixed, setIsSidebarFixed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (sidebarRef.current && !isSidebarFixed) {
        const sidebarWidth = sidebarRef.current.offsetWidth
        setIsSidebarVisible(event.clientX <= sidebarWidth + 20)
      }
    }

    document.addEventListener('mousemove', handleMouseMove)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [isSidebarFixed])

  const handleSetActive = (to: string) => {
    setActiveSection(to)
    setTimeout(() => {
      setActiveSection(null)
    }, 1000)
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
        {sections.map((section) => (
          <section.component
            key={section.name}
            name={section.name}
            isActive={activeSection === section.name}
          />
        ))}
        <div className="mb-32"></div>
      </div>
    </main>
  )
}