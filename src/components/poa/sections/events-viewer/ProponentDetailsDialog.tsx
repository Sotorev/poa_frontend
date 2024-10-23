//ProponentDetailsDialog.tsx

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { PlanningEvent } from '@/types/interfaces';

interface ProponentDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlanningEvent;
}

const ProponentDetailsDialog: React.FC<ProponentDetailsDialogProps> = ({ isOpen, onClose, event }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        <DialogHeader className="bg-[#014A2D] text-white p-4 rounded-t-lg">
          <DialogTitle>Detalles del Proponente</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">Propuesto por:</h3>
            <p>{event.propuestoPor}</p>
          </div>
          <div>
            <h3 className="font-semibold">Fecha de Creación:</h3>
            <p>{new Date(event.fechaCreacion).toLocaleDateString('es-ES')}</p>
          </div>
          <div>
            <h3 className="font-semibold">Fecha de Edición:</h3>
            <p>{event.fechaEdicion ? new Date(event.fechaEdicion).toLocaleDateString('es-ES') : 'N/A'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProponentDetailsDialog;
