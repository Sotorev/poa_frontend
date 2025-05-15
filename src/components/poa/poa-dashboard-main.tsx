// src/components/poa/poa-dashboard-main.tsx

"use client"

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react'
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
  Pin,
  CheckCheck,
  Activity,
  Wallet
} from 'lucide-react'
import { Link } from "react-scroll"
import { cn } from "@/lib/utils"
import { FacultadDataSection } from './sections/sections-facultad-data-section'
import { FacultyStructureSection } from './sections/estructura-facultad-section'
import { EquipoResponsableSectionComponent } from './sections/equipo-responsable-section'
import { FodaSection } from './sections/foda-section'
import { OtrosDocumentos } from './sections/sections-otros-documentos'
import EventsViewerComponent from './sections/events-viewer/events-viewer'
import { CostReport } from './sections/cost-report'
import ApprovalStatusSection from './sections/approvalStatus'

// Types
import type { ApprovalStatus } from '@/types/ApprovalStatus'


// Imports for charge data
import { PoaApproval } from './sections/sections-dean-poa-approval'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getPoaApprovals } from '@/services/poa/aprovalStatus'
import { getPoaByFacultyAndYear } from '@/services/apiService'
import { PoaContext } from '@/contexts/PoaContext'

// Props
export interface SectionProps {
  name: string
  isActive: boolean
  poaId: number
  facultyId: number
  userId: number
  rolId: number
  isEditable: boolean
  onStatusChange?: () => void
}

const sections = [
  { name: "Agregar/confirmar datos de la facultad", icon: Building2, component: FacultadDataSection },
  { name: "Agregar/confirmar Estructura de la facultad", icon: LayoutDashboard, component: FacultyStructureSection },
  { name: "Agregar/confirmar equipo responsable POA", icon: UserCog, component: EquipoResponsableSectionComponent },
  { name: "Agregar/confirmar FODA", icon: BarChart2, component: FodaSection },
  { name: "Agregar/confirmar otros documentos", icon: FilePlus, component: OtrosDocumentos },
  { name: "Visualizar eventos", icon: ListTodo, component: EventsViewerComponent },
  { name: "Informe de costos del POA", icon: Wallet, component: CostReport },
  { name: "Estado de aprobación", icon: Activity, component: ApprovalStatusSection },
  { name: "Aprobar POA", icon: CheckCheck, component: PoaApproval }
]

export function PoaDashboardMain() {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const [isSidebarVisible, setIsSidebarVisible] = useState(false)
  const [isSidebarFixed, setIsSidebarFixed] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const mainRef = useRef<HTMLDivElement>(null)
  const [facultyId, setFacultyId] = useState<number>() // Estado para almacenar el facultyId
  const [poaId, setPoaId] = useState<number>(); // Estado para almacenar el poaId
  const user = useCurrentUser();
  const [userId, setUserId] = useState<number>(); // Estado para almacenar el userId
  const [rolId, setRolId] = useState<number>(); // Estado para almacenar el rolId
  const [approvalStatuses, setApprovalStatuses] = useState<ApprovalStatus[]>([]);
  const [isPoaApproved, setIsPoaApproved] = useState<boolean>(false);
  const { selectedYear } = useContext(PoaContext); // Obtener el año seleccionado del contexto

  /**
   * Obtiene y establece los estados de aprobación del POA.
   * Realiza una llamada asíncrona para obtener las aprobaciones del POA usando el token del usuario y el ID del POA.
   * Actualiza el estado de las aprobaciones si la solicitud es exitosa.
   * 
   * @remarks
   * Esta función requiere tanto un objeto usuario válido con token como un poaId definido para funcionar correctamente.
   * 
   * @throws {Error} Registra el error en la consola si falla la obtención del estado de aprobación
   * 
   * @async
   * @returns {Promise<void>}
   */
  const handleSetStatusApproval = async () => {
    try {

      if (user && poaId !== undefined) {
        const approvals = await getPoaApprovals(user.token, poaId);
        setApprovalStatuses(approvals);
      }
    }
    catch (error) {
      console.error('Error al obtener los estados de aprobación:', error);
    }
  }

  useEffect(() => {
    handleSetStatusApproval();
  }, [user, poaId]);

  // Obtener si el POA fue aprobado para deshabilitar formularios
  useEffect(() => {
    const fetchPoaApprovalFlag = async () => {
      if (user?.token && poaId !== undefined) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/status/${poaId}`, {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (!response.ok) {
            throw new Error('Error al obtener el estado de aprobación del POA.');
          }
          const data = await response.json();
          setIsPoaApproved(data.isApproved);
        } catch (error) {
          console.error('Error al obtener el estado de aprobación del POA:', error);
        }
      }
    };
    fetchPoaApprovalFlag();
  }, [user, poaId]);

  useEffect(() => {
    if (!user) {
      alert("No estás autenticado.");
      return;
    }
    const fetchFacultyId = async () => {
      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.userId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        });

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await userResponse.json();
        const faculty = userData.faculty;
        const userId = userData.userId;
        const rolId = userData.roleId;

        if (!faculty) {
          throw new Error('El usuario no tiene una facultad asignada');
        }

        const fetchedFacultyId = faculty.facultyId; // Obtener el facultyId
        setFacultyId(fetchedFacultyId); // Guardar el facultyId en el estado
        setUserId(userId);  // Guardar userId
        setRolId(rolId);  // Guardar rolId

        // Asegurarse de que facultyId no sea null antes de llamar a getPoaByFacultyAndYear
        if (fetchedFacultyId) {
          handleGetPoa(fetchedFacultyId);
        }

      } catch (error: any) {
        console.error("Error al obtener el facultyId:", error);
      }
    }

    fetchFacultyId()
  }, [user, selectedYear])

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


  const handleReloadData = useCallback(() => {
    if (facultyId && user?.token) {
      getPoaByFacultyAndYear(facultyId, selectedYear, user.token);
    }
  }, [facultyId, user, selectedYear]);

  // Obtener el POA actual si ya fue creado

  const handleGetPoa = async (facultyId: number) => {
    if (!user?.token) return;

    const poa = await getPoaByFacultyAndYear(facultyId, selectedYear, user.token);
    setPoaId(poa.poaId);
  }

  const handleCreatePoa = async () => {
    try {
      // Obtener el peiId desde la ruta proporcionada
      const peiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/pei/current`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
      });

      if (!peiResponse.ok) {
        throw new Error('Error al obtener el PEI.');
      }

      const peiData = await peiResponse.json();
      const peiId = peiData.peiId; // Obtener el peiId del response

      const currentYear = new Date().getFullYear();
      const payload = {
        facultyId: facultyId,
        year: currentYear,
        peiId: peiId, // Usar el peiId obtenido dinámicamente
        userId: userId,
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Error al crear el POA.');
      }

      alert("POA creado exitosamente.");

      const newPoaId = responseData.poaId; // Obtener el poaId del response
      setPoaId(newPoaId); // Guardar el poaId en el estado

    } catch (error: any) {
      alert("Ya creaste el POA para este año");
    }
  };

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
    <main className="flex bg-gray-100 min-h-screen">
      <TooltipProvider>
        <aside
          ref={sidebarRef}
          className={`fixed left-0 top-0 h-full bg-primary shadow-lg transition-all duration-300 ease-in-out z-50 flex flex-col justify-between ${isSidebarFixed || isSidebarVisible ? 'w-16 opacity-100' : 'w-0 opacity-0'
            }`}
        >
          <ScrollArea className="flex-grow">
            <nav className="p-2 flex flex-col items-center space-y-4">
              {sections.map((section) => (
                <Tooltip key={section.name}>
                  <TooltipTrigger asChild>
                    <div>
                      <Link
                        className='text-white hover:text-primary'
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
                            activeSection === section.name ? 'bg-primary text-white' : 'text-white'
                          )}
                        >
                          {React.createElement(section.icon, { className: "h-6 w-6" })}
                          <span className="sr-only">{section.name}</span>
                        </Button>
                      </Link>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-primary text-white py-1 px-2 text-sm rounded">
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
                  className={`w-8 h-8 rounded-lg hover:bg-primary transition-colors duration-200 ${isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <Pin className={`h-4 w-4 text-white`} />
                  <span className="sr-only">Fijar barra lateral</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-primary text-white py-1 px-2 text-sm rounded">
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
        {/* Botones para crear POA y exportar PDF */}
        <div className="mb-4 flex space-x-2">
          <Button onClick={handleCreatePoa} disabled={!facultyId}>
            Iniciar nuevo POA
          </Button>
          <Button onClick={handleExportPdf} disabled={!facultyId || !poaId}>
            Exportar a PDF
          </Button>
        </div>

        {/* Renderizar las secciones */}
        {poaId && !isNaN(poaId) && facultyId !== undefined && sections.map((section) => (
          <section.component
            key={section.name}
            name={section.name}
            isActive={activeSection === section.name}
            poaId={poaId} // Pasar el poaId a cada sección
            facultyId={facultyId} // Pasar el facultyId a cada sección
            userId={userId ?? 0} // Pasar el userId a cada sección
            rolId={rolId ?? 0} // Pasar el rolId a cada sección
            isEditable={!isPoaApproved} // Pasar la prop isEditable combinada
            aprovalStatuses={approvalStatuses} // Pasar el estado de aprobación
            onStatusChange={section.name === "Aprobar POA" ? handleReloadData : undefined} // Pasar la función de recarga de datos
          />
        ))}
        <div className="mb-32"></div>

      </div>
    </main>
  )
}
