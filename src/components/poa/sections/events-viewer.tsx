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
import { SectionProps } from '../poa-dashboard-main';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Zod schemas
const EventDateSchema = z.object({
  eventDateId: z.number(),
  eventId: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  isDeleted: z.boolean()
});

const EventFinancingSchema = z.object({
  eventFinancingId: z.number(),
  eventId: z.number(),
  financingSourceId: z.number(),
  amount: z.number(),
  percentage: z.number(),
  isDeleted: z.boolean()
});

const EventResourceSchema = z.object({
  eventResourceId: z.number(),
  eventId: z.number(),
  resourceId: z.number(),
  isDeleted: z.boolean()
});

const EventResponsibleSchema = z.object({
  eventResponsibleId: z.number(),
  eventId: z.number(),
  responsibleRole: z.string(),
  isDeleted: z.boolean(),
  name: z.string()
});

const EventSchema = z.object({
  eventId: z.number(),
  name: z.string(),
  type: z.string(),
  poaId: z.number(),
  completionPercentage: z.number(),
  campusId: z.number(),
  eventNature: z.string(),
  isDeleted: z.boolean(),
  objective: z.string(),
  isDelayed: z.boolean(),
  achievementIndicator: z.string(),
  purchaseType: z.string(),
  totalCost: z.number(),
  processDocumentPath: z.string().nullable(),
  costDetailDocumentPath: z.string().nullable().optional(), // Assuming this field exists
  createdAt: z.string(),
  updatedAt: z.string().nullable(),
  userId: z.number(),
  dates: z.array(EventDateSchema),
  financings: z.array(EventFinancingSchema),
  resources: z.array(EventResourceSchema),
  responsibles: z.array(EventResponsibleSchema),
  costDetails: z.array(z.any()), // Adjust as per actual data
  campus: z.object({
    campusId: z.number(),
    name: z.string(),
    city: z.string(),
    department: z.string(),
    isDeleted: z.boolean(),
    currentStudentCount: z.number().nullable()
  }),
  interventions: z.array(z.object({
    interventionId: z.number(),
    name: z.string(),
    isDeleted: z.boolean(),
    strategyId: z.number(),
    eventIntervention: z.object({
      eventId: z.number(),
      interventionId: z.number(),
      isDeleted: z.boolean()
    }),
    strategy: z.object({
      strategyId: z.number(),
      description: z.string(),
      strategicObjectiveId: z.number(),
      completionPercentage: z.number(),
      assignedBudget: z.number(),
      executedBudget: z.number().nullable(),
      isDeleted: z.boolean(),
      strategicObjective: z.object({
        strategicObjectiveId: z.number(),
        description: z.string(),
        strategicAreaId: z.number(),
        isDeleted: z.boolean(),
        strategicArea: z.object({
          strategicAreaId: z.number(),
          name: z.string(),
          peiId: z.number(),
          isDeleted: z.boolean()
        })
      })
    })
  })),
  ods: z.array(z.object({
    odsId: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    isDeleted: z.boolean(),
    sortNo: z.number(),
    colorHex: z.string(),
    event_ods: z.object({
      eventId: z.number(),
      odsId: z.number(),
      isDeleted: z.boolean()
    })
  })),
  eventApprovals: z.array(z.object({
    approvalId: z.number(),
    eventId: z.number(),
    approverUserId: z.number(),
    approverRoleId: z.number(),
    approvalStageId: z.number().nullable(),
    approvalStatusId: z.number(),
    comments: z.string(),
    approvalDate: z.string(),
    isDeleted: z.boolean(),
    approvalStage: z.any().nullable(),
    approvalStatus: z.object({
      statusId: z.number(),
      name: z.string(),
      description: z.string(),
      isDeleted: z.boolean()
    })
  })),
  user: z.object({
    userId: z.number(),
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
    username: z.string(),
    password: z.string(),
    roleId: z.number(),
    facultyId: z.number(),
    isDeleted: z.boolean()
  })
});

const EventsResponseSchema = z.array(EventSchema);

// Interfaces
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

// Map API data to PlanningEvent
function mapApiEventToPlanningEvent(apiEvent: z.infer<typeof EventSchema>): PlanningEvent {
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
    detalle: apiEvent.costDetailDocumentPath || '', // Adjust field name as per actual data
    responsables: {
      principal: apiEvent.responsibles.find(r => r.responsibleRole === 'Principal')?.name || '',
      ejecucion: apiEvent.responsibles.find(r => r.responsibleRole === 'Ejecución')?.name || '',
      seguimiento: apiEvent.responsibles.find(r => r.responsibleRole === 'Seguimiento')?.name || ''
    },
    recursos: apiEvent.resources.map(r => `Recurso ${r.resourceId}`).join(', '), // Adjust as per actual data
    indicadorLogro: apiEvent.achievementIndicator,
    detalleProceso: apiEvent.processDocumentPath || '',
    comentarioDecano: '', // Adjust as per actual data
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
            // Include authentication headers if necessary
          }
        });
        const data = await response.json();
        const eventsData = EventsResponseSchema.parse(data);

        const mappedEvents = eventsData.map(event => mapApiEventToPlanningEvent(event));

        // Separate events into different statuses
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

  // The following functions are placeholders; approval functionality is pending implementation
  const approveEvent = (id: string) => {
    // Leave this pending
  };

  const rejectEvent = (id: string) => {
    // Leave this pending
  };

  const requestCorrection = (id: string) => {
    // Leave this pending
  };

  const cancelEvent = (id: string) => {
    // Leave this pending
  };

  const renderEventTable = (events: PlanningEvent[], isPending: boolean, approveEvent: (id: string) => void, showCorrectionsButton: boolean = false, showComments: boolean = true) => (
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
                                  // Include authentication headers if necessary
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
                        // Include authentication headers if necessary
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
                    {/* Approval functionality pending implementation */}
                  </>
                ) : (
                  <>
                    {/* Action buttons for non-pending events */}
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
