// src/components/poa/PoaDashboardMain.tsx
"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { 
  Building2, 
  LayoutDashboard, 
  UserCog, 
  BarChart2, 
  FilePlus, 
  ListTodo,
  Pin
} from 'lucide-react'
import { Link } from "react-scroll"
import { cn } from "@/lib/utils"
import { FacultadDataSection } from './sections/sections-facultad-data-section'
import { EstructuraFacultadSection } from './sections/sections-estructura-facultad-section'
import { EquipoResponsableSection } from './sections/sections-equipo-responsable-section'
import { JustificacionSection } from './sections/sections-justificacion-section'
import { FODASection } from './sections/sections-foda-section'
import { OtrosDocumentos } from './sections/sections-otros-documentos'
import { VisualizarIntervencionesSection } from './sections/visualizar-intervenciones-section'
import { useAuth } from '@/contexts/auth-context'

const sections = [
  { name: "Agregar/confirmar datos de la facultad", icon: Building2, component: FacultadDataSection },
  { name: "Agregar/confirmar Estructura de la facultad", icon: LayoutDashboard, component: EstructuraFacultadSection },
  { name: "Agregar/confirmar equipo responsable POA", icon: UserCog, component: EquipoResponsableSection },
  { name: "Agregar/confirmar FODA", icon: BarChart2, component: FODASection },
  //{ name: "Agregar otros documentos", icon: FilePlus, component: OtrosDocumentos },
  { name: "Visualizar intervenciones", icon: ListTodo, component: VisualizarIntervencionesSection }
]

export function PoaDashboardMain() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarFixed, setIsSidebarFixed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)

  const { user, loading } = useAuth()

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

  const [poaId, setPoaId] = useState<string | null>(null); // Estado para almacenar el poaId

  const handleCreatePoa = async () => {
    if (loading) {
      console.log("Cargando información del usuario...");
      return;
    }
  
    if (!user) {
      console.log("No estás autenticado.");
      alert("No estás autenticado.");
      return;
    }
  
    try {
      const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.userId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!userResponse.ok) {
        throw new Error('Error al obtener datos del usuario');
      }
  
      const userData = await userResponse.json();
      const faculty = userData.faculty;
  
      if (!faculty) {
        throw new Error('El usuario no tiene una facultad asignada');
      }
  
      const facultyId = faculty.facultyId; // Obtener el facultyId
      const currentYear = new Date().getFullYear();
      const payload = {
        facultyId: facultyId,
        year: currentYear,
        peiId: 1,
      };

      // Mostrar el payload en la consola
console.log("Payload enviado:", JSON.stringify(payload));
  
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
  
      const responseData = await response.json();
      //mostrar respuesta en la consola
      console.log("Response data:", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.message || 'Error al crear el POA.');
      }
  
      alert("POA creado exitosamente.");
      
      const poaId = responseData.poaId; // Obtener el poaId del response
      setPoaId(poaId); // Guardar el poaId en el estado
  
    } catch (error: any) {
      console.error("Error al crear el POA:", error);
      alert(`Error: ${error.message}`);
    }
  };
  
  

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
        {/* Botón para crear POA */}
        <div className="mb-4">
          <Button onClick={handleCreatePoa} disabled={loading}>
            Iniciar POA
          </Button>
        </div>

        {/* Renderizar las secciones */}
        {sections.map((section) => (
          <section.component
            key={section.name}
            name={section.name}
            isActive={activeSection === section.name}
            poaId={poaId} // Pasar el poaId a cada sección
          />
        ))}
 <div className="mb-32"></div>

{/* Botón para enviar POA */}
<div className="mt-6 flex justify-end">
  <Button /*onClick={handleEnviarPOA}*/>
    Enviar POA
  </Button>
</div>
</div>
</main>
)
}