// src/components/poa/sections/events-viewer/EventTable.tsx

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CommentThread } from '../../eventManagement/fields/comment-thread';
import EventRow from './EventRow';
import { PlanningEvent } from '@/types/interfaces';

interface EventTableProps {
  events: PlanningEvent[];
  isPending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestCorrection: (id: string) => void;
  onRevert: (id: string) => void;
  showCorrectionsActions?: boolean; // Nueva prop
  onEdit?: (id: string) => void;       // Nueva prop
  onDelete?: (id: string) => void;     // Nueva prop
  showComments?: boolean;
  showActions?: boolean;
}

const EventTable: React.FC<EventTableProps> = ({
  events,
  isPending,
  onApprove,
  onReject,
  onRequestCorrection,
  onRevert,
  showCorrectionsActions = false, // Valor por defecto
  onEdit,
  onDelete,
  showComments = true,
  showActions = true
}) => {
  const [showCommentThread, setShowCommentThread] = React.useState(false);
  const [currentEntityId, setCurrentEntityId] = React.useState<number | null>(null);
  const [currentEntityName, setCurrentEntityName] = React.useState<string>("");

  return (
    <div className="overflow-x-auto">
      {showCommentThread && currentEntityId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <CommentThread
            isOpen={showCommentThread}
            onClose={() => setShowCommentThread(false)}
            entityId={currentEntityId}
            entityName={currentEntityName}
          />
        </div>
      )}
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
            <TableHead className="whitespace-normal break-words">Detalles del Formulador</TableHead>
            {showComments && <TableHead className="whitespace-normal break-words">Comentarios</TableHead>}
            {showActions && <TableHead className="whitespace-normal break-words">Acciones</TableHead>}
            {showCorrectionsActions && <TableHead className="whitespace-normal break-words">Acciones de Corrección</TableHead>} {/* Nueva celda de encabezado */}
          </TableRow>
        </TableHeader>
        <TableBody>
          <>
            {events.map(event => (
              <EventRow
                key={event.id}
                event={event}
                isPending={isPending}
                onApprove={onApprove}
                onReject={onReject}
                onRequestCorrection={onRequestCorrection}
                onRevert={onRevert}
                showComments={showComments}
                showActions={showActions}
                showCorrectionsActions={showCorrectionsActions} // Pasar nueva prop
                onEdit={onEdit}                                       // Pasar nueva prop
                onDelete={onDelete}                                   // Pasar nueva prop
                setShowCommentThread={setShowCommentThread}
                setCurrentEntityId={setCurrentEntityId}
                setCurrentEntityName={setCurrentEntityName}
              />
            ))}
          </>
        </TableBody>
      </Table>
    </div>
  );
};

export default EventTable;
