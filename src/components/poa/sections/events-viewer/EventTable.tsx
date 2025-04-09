// src/components/poa/sections/events-viewer/EventTable.tsx

import React, { useContext, useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CommentThread } from '../../eventManagement/fields/comment-thread';
import EventRow from './EventRow';

// Types
import { FinancingSource } from '@/types/FinancingSource'; // Nueva importación
import { PlanningEvent } from '@/types/interfaces';

// Charge Data
import { EventContext } from '../../eventManagement/context.event';

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
  const [showCommentThread, setShowCommentThread] = useState(false);
  const [currentEntityId, setCurrentEntityId] = useState<number | null>(null);
  const [currentEntityName, setCurrentEntityName] = useState<string>("");
  const [otherFinancing, setOtherFinancing] = useState<FinancingSource[]>(); 
  const [umesFinancing, setUmesFinancing] = useState<FinancingSource[]>();

  const { financingSources } = useContext(EventContext)

  useEffect(() => {
    setUmesFinancing(financingSources?.filter(source => source.category === 'UMES'));
    setOtherFinancing(financingSources?.filter(source => source.category === 'Otra'));
  }, [financingSources]);

  return (
    <div className="max-h-[500px] overflow-y-auto overflow-x-auto">
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
      <div className="relative">
        <Table className="relative w-full table-auto min-w-[1000px]">
          <TableHeader className="sticky top-0 z-10 bg-white shadow-sm">
            <TableRow>
              <TableHead className="whitespace-normal break-words bg-green-50">Tipo de Evento</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Evento</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Objetivo</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Indicador de Logro</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Naturaleza del Evento</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Campus</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">ODS</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Fechas</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Aportes al PEI</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Costo Total</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Detalles Financieros</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Responsables</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Recursos</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Detalle de Planificación</TableHead>
              <TableHead className="whitespace-normal break-words bg-green-50">Detalles del Formulador</TableHead>
              {showComments && <TableHead className="whitespace-normal break-words bg-green-50">Comentarios</TableHead>}
              {showActions && <TableHead className="whitespace-normal break-words bg-green-50">Acciones</TableHead>}
              {showCorrectionsActions && <TableHead className="whitespace-normal break-words bg-green-50">Acciones de Corrección</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            <>
              {events.map(event => (
                <EventRow
                  otherFinancing={otherFinancing || []} 
                  umesFinancing={umesFinancing || []}
                  key={event.id}
                  event={event}
                  isPending={isPending}
                  onApprove={onApprove}
                  onReject={onReject}
                  onRequestCorrection={onRequestCorrection}
                  onRevert={onRevert}
                  showComments={showComments}
                  showActions={showActions}
                  showCorrectionsActions={showCorrectionsActions}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  setShowCommentThread={setShowCommentThread}
                  setCurrentEntityId={setCurrentEntityId}
                  setCurrentEntityName={setCurrentEntityName}
                />
              ))}
            </>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default EventTable;