import React, { useState, useEffect } from 'react'; 
import { Table, TableBody, TableCell, TableHead, TableRow, TableHeader } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'react-toastify';
import { CheckIcon, XIcon, Link, RotateCcw, Download, X, ChevronDown, ChevronUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label";
import { saveAs } from 'file-saver';
// import { SectionProps } from '../poa-dashboard-main'; // Asegúrate de mantener esta importación si es necesaria
import { useForm } from 'react-hook-form';
import { SectionProps } from '../poa-dashboard-main';

// Interfaces para los datos de la API
interface ApiEventDate {
  eventDateId: number;
  eventId: number;
  startDate: string;
  endDate: string;
  isDeleted: boolean;
}

interface ApiEventFinancing {
  eventFinancingId: number;
  eventId: number;
  financingSourceId: number;
  amount: number;
  percentage: number;
  isDeleted: boolean;
}

interface ApiEventResource {
  eventResourceId: number;
  eventId: number;
  resourceId: number;
  isDeleted: boolean;
}

interface ApiEventResponsible {
  eventResponsibleId: number;
  eventId: number;
  responsibleRole: string;
  isDeleted: boolean;
  name: string;
}

interface ApiCampus {
  campusId: number;
  name: string;
  city: string;
  department: string;
  isDeleted: boolean;
  currentStudentCount: number | null;
}

interface ApiStrategicArea {
  strategicAreaId: number;
  name: string;
  peiId: number;
  isDeleted: boolean;
}

interface ApiStrategicObjective {
  strategicObjectiveId: number;
  description: string;
  strategicAreaId: number;
  isDeleted: boolean;
  strategicArea: ApiStrategicArea;
}

interface ApiStrategy {
  strategyId: number;
  description: string;
  strategicObjectiveId: number;
  completionPercentage: number;
  assignedBudget: number;
  executedBudget: number | null;
  isDeleted: boolean;
  strategicObjective: ApiStrategicObjective;
}

interface ApiInterventionEventIntervention {
  eventId: number;
  interventionId: number;
  isDeleted: boolean;
}

interface ApiIntervention {
  interventionId: number;
  name: string;
  isDeleted: boolean;
  strategyId: number;
  eventIntervention: ApiInterventionEventIntervention;
  strategy: ApiStrategy;
}

interface ApiOdsEventOds {
  eventId: number;
  odsId: number;
  isDeleted: boolean;
}

interface ApiOds {
  odsId: number;
  name: string;
  description: string | null;
  isDeleted: boolean;
  sortNo: number;
  colorHex: string;
  event_ods: ApiOdsEventOds;
}

interface ApiApprovalStatus {
  statusId: number;
  name: string;
  description: string;
  isDeleted: boolean;
}

interface ApiEventApproval {
  approvalId: number;
  eventId: number;
  approverUserId: number | null;
  approverRoleId: number;
  approvalStageId: number | null;
  approvalStatusId: number;
  comments: string;
  approvalDate: string;
  isDeleted: boolean;
  approvalStage: any | null;
  approvalStatus: ApiApprovalStatus;
}

interface ApiUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  roleId: number;
  facultyId: number;
  isDeleted: boolean;
}

interface ApiEvent {
  eventId: number;
  name: string;
  type: string;
  poaId: number;
  completionPercentage: number;
  campusId: number;
  eventNature: string;
  isDeleted: boolean;
  objective: string;
  isDelayed: boolean;
  achievementIndicator: string;
  purchaseType: string;
  totalCost: number;
  processDocumentPath: string | null;
  costDetailDocumentPath?: string | null;
  createdAt: string;
  updatedAt: string | null;
  userId: number;
  dates: ApiEventDate[];
  financings: ApiEventFinancing[];
  resources: ApiEventResource[];
  responsibles: ApiEventResponsible[];
  costDetails: any[]; // Ajusta según los datos reales
  campus: ApiCampus;
  interventions: ApiIntervention[];
  ods: ApiOds[];
  eventApprovals: ApiEventApproval[];
  user: ApiUser;
}

// Interfaces existentes
interface DateInterval {
  inicio: string;
  fin: string;
}

interface PlanningEvent {
  id: string;
  areaEstrategica: string;
  objetivoEstrategico: string;
  estrategias: string;
  intervencion: string;
  ods: string;
  tipoEvento: 'actividad' | 'proyecto';
  evento: string;
  objetivo: string;
  fechas: DateInterval[];
  costoTotal: number;
  aporteUMES: number;
  aporteOtros: number;
  tipoCompra: string;
  detalle: string;
  responsables: {
    principal: string;
    ejecucion: string;
    seguimiento: string;
  };
  recursos: string;
  indicadorLogro: string;
  detalleProceso: string;
  comentarioDecano: string;
  propuestoPor: string;
  fechaCreacion: string;
  fechaEdicion: string;
  estado: 'revision' | 'aprobado' | 'rechazado' | 'correccion';
  aportesPEI: {
    event: {
      eventId: number;
      name: string;
      interventions: Array<{
        interventionId: number;
        name: string;
        strategies: Array<{
          strategyId: number;
          description: string;
          strategicObjective: {
            strategicObjectiveId: number;
            description: string;
            strategicArea: {
              strategicAreaId: number;
              name: string;
            };
          };
        }>;
      }>;
    };
  };
  campus: string;
  naturalezaEvento: string;
}

// Función para mapear datos de la API a PlanningEvent
function mapApiEventToPlanningEvent(apiEvent: ApiEvent): PlanningEvent {
  const estadoMap: { [key: string]: 'revision' | 'aprobado' | 'rechazado' | 'correccion' } = {
    'Pendiente': 'revision',
    'Aprobado': 'aprobado',
    'Rechazado': 'rechazado',
    'Corrección': 'correccion'
  };

  const estado = estadoMap[apiEvent.eventApprovals[0]?.approvalStatus?.name || 'Pendiente'] || 'revision';

  return {
    id: String(apiEvent.eventId),
    areaEstrategica: apiEvent.interventions[0]?.strategy?.strategicObjective?.strategicArea?.name || '',
    objetivoEstrategico: apiEvent.interventions[0]?.strategy?.strategicObjective?.description || '',
    estrategias: apiEvent.interventions[0]?.strategy?.description || '',
    intervencion: apiEvent.interventions[0]?.name || '',
    ods: apiEvent.ods.map(ods => ods.name).join(', '),
    tipoEvento: apiEvent.type === 'Actividad' ? 'actividad' : 'proyecto',
    evento: apiEvent.name,
    objetivo: apiEvent.objective,
    fechas: apiEvent.dates.map(date => ({
      inicio: date.startDate,
      fin: date.endDate
    })),
    costoTotal: apiEvent.totalCost,
    aporteUMES: apiEvent.financings.find(f => f.financingSourceId === 1)?.amount || 0,
    aporteOtros: apiEvent.financings.filter(f => f.financingSourceId !== 1).reduce((sum, f) => sum + f.amount, 0),
    tipoCompra: apiEvent.purchaseType,
    detalle: apiEvent.costDetailDocumentPath || '', // Ajusta el nombre del campo según los datos reales
    responsables: {
      principal: apiEvent.responsibles.find(r => r.responsibleRole === 'Principal')?.name || '',
      ejecucion: apiEvent.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || '',
      seguimiento: apiEvent.responsibles.find(r => r.responsibleRole === 'Seguimiento')?.name || ''
    },
    recursos: apiEvent.resources.map(r => `Recurso ${r.resourceId}`).join(', '), // Ajusta según los datos reales
    indicadorLogro: apiEvent.achievementIndicator,
    detalleProceso: apiEvent.processDocumentPath || '',
    comentarioDecano: '', // Ajusta según los datos reales
    propuestoPor: `${apiEvent.user.firstName} ${apiEvent.user.lastName}`,
    fechaCreacion: apiEvent.createdAt,
    fechaEdicion: apiEvent.updatedAt || '',
    estado: estado,
    aportesPEI: {
      event: {
        eventId: apiEvent.eventId,
        name: apiEvent.name,
        interventions: apiEvent.interventions.map(intervention => ({
          interventionId: intervention.interventionId,
          name: intervention.name,
          strategies: [{
            strategyId: intervention.strategy.strategyId,
            description: intervention.strategy.description,
            strategicObjective: {
              strategicObjectiveId: intervention.strategy.strategicObjective.strategicObjectiveId,
              description: intervention.strategy.strategicObjective.description,
              strategicArea: {
                strategicAreaId: intervention.strategy.strategicObjective.strategicArea.strategicAreaId,
                name: intervention.strategy.strategicObjective.strategicArea.name
              }
            }
          }]
        }))
      }
    },
    campus: apiEvent.campus.name,
    naturalezaEvento: apiEvent.eventNature
  };
}

export default function EventsViewerComponent({ name, isActive, poaId, facultyId, isEditable }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [eventsInReview, setEventsInReview] = useState<PlanningEvent[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<PlanningEvent[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<PlanningEvent[]>([]);
  const [eventsWithCorrections, setEventsWithCorrections] = useState<PlanningEvent[]>([]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAportesPEI, setSelectedAportesPEI] = useState<PlanningEvent['aportesPEI'] | null>(null);
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedFinancialDetails, setSelectedFinancialDetails] = useState<PlanningEvent | null>(null);

  const [isProponentDialogOpen, setIsProponentDialogOpen] = useState(false);
  const [selectedProponentDetails, setSelectedProponentDetails] = useState<PlanningEvent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          headers: {
            'Content-Type': 'application/json'
            // Incluye encabezados de autenticación si es necesario
          }
        });
        const data: ApiEvent[] = await response.json();

        const mappedEvents = data.map(event => mapApiEventToPlanningEvent(event));

        // Separar eventos en diferentes estados
        const eventsInReviewData = mappedEvents.filter(event => event.estado === 'revision');
        const approvedEventsData = mappedEvents.filter(event => event.estado === 'aprobado');
        const rejectedEventsData = mappedEvents.filter(event => event.estado === 'rechazado');
        const eventsWithCorrectionsData = mappedEvents.filter(event => event.estado === 'correccion');

        setEventsInReview(eventsInReviewData);
        setApprovedEvents(approvedEventsData);
        setRejectedEvents(rejectedEventsData);
        setEventsWithCorrections(eventsWithCorrectionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Error al cargar los eventos');
      }
    };

    fetchData();
  }, [poaId]);

  // Las siguientes funciones son marcadores de posición; la funcionalidad de aprobación está pendiente de implementación
  const approveEvent = (id: string) => {
    // Deja esto pendiente
  };

  const rejectEvent = (id: string) => {
    // Deja esto pendiente
  };

  const requestCorrection = (id: string) => {
    // Deja esto pendiente
  };

  const cancelEvent = (id: string) => {
    // Deja esto pendiente
  };

  const renderEventTable = (
    events: PlanningEvent[], 
    isPending: boolean, 
    approveEvent: (id: string) => void, 
    showCorrectionsButton: boolean = false, 
    showComments: boolean = true
  ) => (
    <div className="overflow-x-auto">
      <Table className="w-full table-auto min-w-[1000px]">
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-normal break-words">Tipo de Evento</TableHead>
            <TableHead className="whitespace-normal break-words">Evento</TableHead>
            <TableHead className="whitespace-normal break-words">Objetivo</TableHead>
            <TableHead className="whitespace-normal break-words">Indicador de Logro</TableHead>
            <TableHead className="whitespace-normal break-words">Naturaleza del Evento</TableHead>
            <TableHead className="whitespace-normal break-words">Campus</TableHead>
            <TableHead className="whitespace-normal break-words">Fechas</TableHead>
            <TableHead className="whitespace-normal break-words">Aportes al PEI</TableHead>
            <TableHead className="whitespace-normal break-words">Costo Total</TableHead>
            <TableHead className="whitespace-normal break-words">Detalles Financieros</TableHead>
            <TableHead className="whitespace-normal break-words">Responsables</TableHead>
            <TableHead className="whitespace-normal break-words">Recursos</TableHead>
            <TableHead className="whitespace-normal break-words">Detalle de Planificación</TableHead>
            <TableHead className="whitespace-normal break-words">Detalles del Proponente</TableHead>
            {showComments && <TableHead className="whitespace-normal break-words">Comentarios</TableHead>}
            <TableHead className="whitespace-normal break-words">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="whitespace-normal break-words">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="cursor-help font-semibold">
                        {event.tipoEvento === 'actividad' ? 'A' : 'P'}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{event.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </TableCell>
              <TableCell className="whitespace-normal break-words">{event.evento}</TableCell>
              <TableCell className="whitespace-normal break-words">{event.objetivo}</TableCell>
              <TableCell className="whitespace-normal break-words">{event.indicadorLogro}</TableCell>
              <TableCell className="whitespace-normal break-words">{event.naturalezaEvento}</TableCell>
              <TableCell className="whitespace-normal break-words">{event.campus}</TableCell>
              <TableCell className="whitespace-normal break-words">
                {event.fechas.map((intervalo, index) => (
                  <div key={index} className="mb-2">
                    <p className="font-semibold text-[#014A2D]">
                      {index === 0 ? "Primera vez" : index === 1 ? "Segunda vez" : `${index + 1}ª vez`}
                    </p>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">I: {new Date(intervalo.inicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Inicio: {new Date(intervalo.inicio).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <br />
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help">F: {new Date(intervalo.fin).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Fin: {new Date(intervalo.fin).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                ))}
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-[#014A2D] text-white hover:bg-opacity-90"
                      onClick={() => {
                        setSelectedAportesPEI(event.aportesPEI);
                        setIsDialogOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <button
                      onClick={() => setIsDialogOpen(false)}
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </button>
                    <DialogHeader className="bg-[#014A2D] text-white p-4 rounded-t-lg">
                      <DialogTitle>Aportes al PEI</DialogTitle>
                    </DialogHeader>
                    {selectedAportesPEI ? (
                      <div className="mt-4">
                        <h2 className="text-xl font-bold mb-4">Evento: {selectedAportesPEI.event.name}</h2>
                        {selectedAportesPEI.event.interventions.map((intervention) => {
                          const strategy = intervention.strategies[0];
                          const { strategicObjective } = strategy;
                          return (
                            <div key={intervention.interventionId} className="mb-6 p-4 border rounded-lg">
                              <h3 className="text-lg font-semibold mb-2 text-[#014A2D]">Área Estratégica: {strategicObjective.strategicArea.name}</h3>
                              <div className="ml-4 mb-4">
                                <h4 className="text-md font-medium mb-2">Objetivo Estratégico: {strategicObjective.description}</h4>
                                <div className="ml-4 mb-2">
                                  <p><strong>Estrategia:</strong> {strategy.description}</p>
                                </div>
                                <div className="ml-4">
                                  <p><strong>Intervención:</strong> {intervention.name}</p>
                                
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-40">
                        <p>Cargando datos...</p>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell className="whitespace-normal break-words">${event.costoTotal.toLocaleString()}</TableCell>
              <TableCell className="whitespace-normal break-words">
                <Dialog open={isFinancialDialogOpen} onOpenChange={setIsFinancialDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-[#014A2D] text-white hover:bg-opacity-90"
                      onClick={() => {
                        setSelectedFinancialDetails(event);
                        setIsFinancialDialogOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <button
                      onClick={() => setIsFinancialDialogOpen(false)}
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </button>
                    <DialogHeader className="bg-[#014A2D] text-white p-4 rounded-t-lg">
                      <DialogTitle>Detalles Financieros</DialogTitle>
                    </DialogHeader>
                    {selectedFinancialDetails && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h3 className="font-semibold">Aporte UMES:</h3>
                          <p>${selectedFinancialDetails.aporteUMES.toLocaleString()} ({((selectedFinancialDetails.aporteUMES / selectedFinancialDetails.costoTotal) * 100).toFixed(2)}%)</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Aporte Otros:</h3>
                          <p>${selectedFinancialDetails.aporteOtros.toLocaleString()} ({((selectedFinancialDetails.aporteOtros / selectedFinancialDetails.costoTotal) * 100).toFixed(2)}%)</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Tipo de Compra:</h3>
                          <p>{selectedFinancialDetails.tipoCompra}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Detalle de Presupuesto:</h3>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                            onClick={() => {
                              fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/downloadCostDetailDocument/${selectedFinancialDetails.id}`, {
                                headers: {
                                  // Incluye encabezados de autenticación si es necesario
                                }
                              })
                                .then(response => response.blob())
                                .then(blob => {
                                  saveAs(blob, `presupuesto_${selectedFinancialDetails.id}.pdf`);
                                })
                                .catch(error => {
                                  console.error('Error al descargar el archivo:', error);
                                  toast.error('Error al descargar el archivo. Por favor, intente de nuevo.');
                                });
                            }}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Descargar Documento
                          </Button>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                <TooltipProvider>
                  <div className="space-y-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <span className="font-semibold">Principal:</span>
                          <br />
                          {event.responsables.principal}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Responsable principal del evento</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <span className="font-semibold">Ejecución:</span>
                          <br />
                          {event.responsables.ejecucion}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Encargado de la ejecución del evento</p>
                      </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <span className="font-semibold">Seguimiento:</span>
                          <br />
                          {event.responsables.seguimiento}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Responsable del seguimiento y control del evento</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </TooltipProvider>
              </TableCell>
              <TableCell className="whitespace-normal break-words">{event.recursos}</TableCell>
              <TableCell className="whitespace-normal break-words">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-gray-100 text-gray-800 hover:bg-gray-200"
                  onClick={() => {
                    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/downloadProcessDocument/${event.id}`, {
                      headers: {
                        // Incluye encabezados de autenticación si es necesario
                      }
                    })
                      .then(response => response.blob())
                      .then(blob => {
                        saveAs(blob, `detalle_planificacion_${event.id}.pdf`);
                      })
                      .catch(error => {
                        console.error('Error al descargar el archivo:', error);
                        toast.error('Error al descargar el archivo. Por favor, intente de nuevo.');
                      });
                  }}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Descargar
                </Button>
              </TableCell>
              <TableCell className="whitespace-normal break-words">
                <Dialog open={isProponentDialogOpen} onOpenChange={setIsProponentDialogOpen}>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="bg-[#014A2D] text-white hover:bg-opacity-90"
                      onClick={() => {
                        setSelectedProponentDetails(event);
                        setIsProponentDialogOpen(true);
                      }}
                    >
                      Ver
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <button
                      onClick={() => setIsProponentDialogOpen(false)}
                      className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
                    >
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </button>
                    <DialogHeader className="bg-[#014A2D] text-white p-4 rounded-t-lg">
                      <DialogTitle>Detalles del Proponente</DialogTitle>
                    </DialogHeader>
                    {selectedProponentDetails && (
                      <div className="mt-4 space-y-4">
                        <div>
                          <h3 className="font-semibold">Propuesto por:</h3>
                          <p>{selectedProponentDetails.propuestoPor}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Fecha de Creación:</h3>
                          <p>{new Date(selectedProponentDetails.fechaCreacion).toLocaleDateString('es-ES')}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Fecha de Edición:</h3>
                          <p>{selectedProponentDetails.fechaEdicion ? new Date(selectedProponentDetails.fechaEdicion).toLocaleDateString('es-ES') : 'N/A'}</p>
                        </div>
                      </div>
                    )}
                  </DialogContent>
                </Dialog>
              </TableCell>
              {showComments && (
                <TableCell className="whitespace-normal break-words">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-[#014A2D] text-white hover:bg-opacity-90"
                  >
                    Abrir
                  </Button>
                </TableCell>
              )}
              <TableCell className="whitespace-normal break-words">
                {isPending ? (
                  <>
                    {/* Funcionalidad de aprobación pendiente de implementación */}
                  </>
                ) : (
                  <>
                    {/* Botones de acción para eventos no pendientes */}
                  </>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div id={name} className={`mb-6 ${isActive ? 'ring-2 ring-green-400' : ''}`}>
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300">
          <div className="p-4 bg-green-50 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Revisión de eventos</h2>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
                {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          {!isMinimized && (
            <div className="p-4 bg-white">
              <div className="container mx-auto space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Pendientes</h2>
                  {renderEventTable(eventsInReview, true, approveEvent)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Aprobados</h2>
                  {renderEventTable(approvedEvents, false, approveEvent)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos Rechazados</h2>
                  {renderEventTable(rejectedEvents, false, approveEvent, false, true)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold mb-4 text-[#014A2D]">Eventos con Solicitud de Correcciones</h2>
                  {renderEventTable(eventsWithCorrections, false, approveEvent, false, true)}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
