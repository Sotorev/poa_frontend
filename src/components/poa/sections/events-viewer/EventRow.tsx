// components/EventsViewer/EventRow.tsx
import React, { useState } from 'react';
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { X } from 'lucide-react';
import ActionButtons from './ActionButtons';
import AportesPEIDialog from './AportesPEIDialog';
import FinancialDetailsDialog from './FinancialDetailsDialog';
import ProponentDetailsDialog from './ProponentDetailsDialog';
import { PlanningEvent } from '@/types/interfaces';
import { toast } from 'react-toastify';
import DownloadButton from './DownloadButton'; // Asegúrate de importar DownloadButton

interface EventRowProps {
  event: PlanningEvent;
  isPending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestCorrection: (id: string) => void;
  onRevert: (id: string) => void;
  showComments: boolean;
  setShowCommentThread: (show: boolean) => void;
  setCurrentEntityId: (id: number | null) => void;
  setCurrentEntityName: (name: string) => void;
}

const EventRow: React.FC<EventRowProps> = ({
  event,
  isPending,
  onApprove,
  onReject,
  onRequestCorrection,
  onRevert,
  showComments,
  setShowCommentThread,
  setCurrentEntityId,
  setCurrentEntityName
}) => {
  const [isAportesPEIOpen, setIsAportesPEIOpen] = useState(false);
  const [isFinancialDetailsOpen, setIsFinancialDetailsOpen] = useState(false);
  const [isProponentDetailsOpen, setIsProponentDetailsOpen] = useState(false);

  return (
    <TableRow>
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
                  <span className="cursor-help">
                    I: {new Date(intervalo.inicio).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Inicio: {new Date(intervalo.inicio).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <br />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-help">
                    F: {new Date(intervalo.fin).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Fin: {new Date(intervalo.fin).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </TableCell>
      <TableCell className="whitespace-normal break-words">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#014A2D] text-white hover:bg-opacity-90"
          onClick={() => setIsAportesPEIOpen(true)}
        >
          Ver
        </Button>
        <AportesPEIDialog 
          isOpen={isAportesPEIOpen} 
          onClose={() => setIsAportesPEIOpen(false)} 
          aportesPEI={event.aportesPEI} 
        />
      </TableCell>
      <TableCell className="whitespace-normal break-words">Q{event.costoTotal.toLocaleString()}</TableCell>
      <TableCell className="whitespace-normal break-words">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#014A2D] text-white hover:bg-opacity-90"
          onClick={() => setIsFinancialDetailsOpen(true)}
        >
          Ver
        </Button>
        <FinancialDetailsDialog 
          isOpen={isFinancialDetailsOpen} 
          onClose={() => setIsFinancialDetailsOpen(false)} 
          event={event}
        />
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
        <DownloadButton eventId={Number(event.id)} />
      </TableCell>
      <TableCell className="whitespace-normal break-words">
        <Button 
          variant="outline" 
          size="sm" 
          className="bg-[#014A2D] text-white hover:bg-opacity-90"
          onClick={() => setIsProponentDetailsOpen(true)}
        >
          Ver
        </Button>
        <ProponentDetailsDialog 
          isOpen={isProponentDetailsOpen} 
          onClose={() => setIsProponentDetailsOpen(false)} 
          event={event} 
        />
      </TableCell>
      {showComments && (
        <TableCell className="whitespace-normal break-words">
          <Button
            onClick={() => {
              const eventId = Number(event.id);
              if (!isNaN(eventId)) {
                setCurrentEntityId(eventId);
                setCurrentEntityName(event.evento);
                setShowCommentThread(true);
              } else {
                toast.warn("Debe enviar la actividad primero para poder mostrar comentarios.");
              }
            }}
            disabled={!event.id}
          >
            Mostrar Comentarios
          </Button>
        </TableCell>
      )}
      <TableCell className="whitespace-normal break-words">
        <ActionButtons 
          event={event} 
          isPending={isPending} 
          onApprove={onApprove} 
          onReject={onReject} 
          onRequestCorrection={onRequestCorrection} 
          onRevert={onRevert}
        />
      </TableCell>
    </TableRow>
  );
};

export default EventRow;
