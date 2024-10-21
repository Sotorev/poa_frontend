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

const sampleEvents: PlanningEvent[] = [
  // ... (mantén los eventos de muestra aquí)
];

const fetchAportesPEI = async (eventId: string): Promise<PlanningEvent['aportesPEI']> => {
  // Simulating an API call
  await new Promise(resolve => setTimeout(resolve, 500));
  return sampleEvents.find(event => event.id === eventId)?.aportesPEI || {
    event: {
      eventId: 0,
      name: "Evento no encontrado",
      interventions: []
    }
  };
};

export default function EventsViewerComponent() {
  const [isMinimized, setIsMinimized] = useState(false);
  const [eventsInReview, setEventsInReview] = useState<PlanningEvent[]>(
    sampleEvents.filter(event => event.estado === 'revision')
  );
  const [approvedEvents, setApprovedEvents] = useState<PlanningEvent[]>(
    sampleEvents.filter(event => event.estado === 'aprobado')
  );
  const [rejectedEvents, setRejectedEvents] = useState<PlanningEvent[]>(
    sampleEvents.filter(event => event.estado === 'rechazado')
  );
  const [eventsWithCorrections, setEventsWithCorrections] = useState<PlanningEvent[]>(
    sampleEvents.filter(event => event.estado === 'correccion')
  );

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAportesPEI, setSelectedAportesPEI] = useState<PlanningEvent['aportesPEI'] | null>(null);
  const [isFinancialDialogOpen, setIsFinancialDialogOpen] = useState(false);
  const [selectedFinancialDetails, setSelectedFinancialDetails] = useState<PlanningEvent | null>(null);

  const [isProponentDialogOpen, setIsProponentDialogOpen] = useState(false);
  const [selectedProponentDetails, setSelectedProponentDetails] = useState<PlanningEvent | null>(null);

  const approveEvent = (id: string) => {
    const eventToApprove = eventsInReview.find(event => event.id === id) || eventsWithCorrections.find(event => event.id === id);
    if (eventToApprove) {
      const updatedEvent = { ...eventToApprove, estado: 'aprobado' as const };
      setEventsInReview(events => events.filter(event => event.id !== id));
      setEventsWithCorrections(events => events.filter(event => event.id !== id));
      setApprovedEvents(events => [...events, updatedEvent]);
      toast.success("Evento aprobado exitosamente");
    }
  };

  const rejectEvent = (id: string) => {
    const event = eventsInReview.find(event => event.id === id) || eventsWithCorrections.find(event => event.id === id);
    if (event) {
      const updatedEvent = { 
        ...event, 
        estado: 'rechazado' as const 
      };
      setEventsInReview(events => events.filter(event => event.id !== id));
      setEventsWithCorrections(events => events.filter(event => event.id !== id));
      setRejectedEvents(events => [...events, updatedEvent]);
      toast.error(`Evento rechazado definitivamente`);
    }
  };

  const requestCorrection = (id: string) => {
    const event = eventsInReview.find(event => event.id === id) || eventsWithCorrections.find(event => event.id === id);
    if (event) {
      const updatedEvent = { 
        ...event, 
        estado: 'correccion' as const 
      };
      setEventsInReview(events => events.filter(event => event.id !== id));
      setEventsWithCorrections(events => [...events, updatedEvent]);
      toast.info(`Se ha solicitado una corrección para el evento`);
    }
  };

  const cancelEvent = (id: string) => {
    const eventToCancel = approvedEvents.find(event => event.id === id) || 
                        rejectedEvents.find(event => event.id === id) || 
                        eventsWithCorrections.find(event => event.id === id);
    if (eventToCancel) {
      const updatedEvent = { ...eventToCancel, estado: 'revision' as const, comentarioDecano: '' };
      setApprovedEvents(events => events.filter(event => event.id !== id));
      setRejectedEvents(events => events.filter(event => event.id !== id));
      setEventsWithCorrections(events => events.filter(event => event.id !== id));
      setEventsInReview(events => [...events, updatedEvent]);
      toast.info("Evento cancelado y movido a eventos en revisión");
    }
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
                      onClick={async () => {
                        const aportesPEI = await fetchAportesPEI(event.id);
                        setSelectedAportesPEI(aportesPEI);
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
                              fetch(selectedFinancialDetails.detalle)
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
                    fetch(event.detalleProceso)
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
                          <p>{selectedProponentDetails.fechaCreacion}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold">Fecha de Edición:</h3>
                          <p>{selectedProponentDetails.fechaEdicion}</p>
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
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="mr-2" variant="ghost" onClick={() => approveEvent(event.id)}>
                            <CheckIcon className="h-4 w-4 text-green-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Aprobar evento</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button className="mr-2" variant="ghost" onClick={() => rejectEvent(event.id)}>
                            <XIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Rechazar evento</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" onClick={() => requestCorrection(event.id)}>
                            <RotateCcw className="h-4 w-4 text-yellow-500" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Solicitar corrección</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </>
                ) : (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={() => cancelEvent(event.id)} variant="ghost">
                          <RotateCcw className="h-4 w-4 text-yellow-500" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Cancelar</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  return (
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
  );
}