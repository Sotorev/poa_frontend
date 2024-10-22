import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PlanningEvent } from '@/types/interfaces';

interface AportesPEIDialogProps {
  isOpen: boolean;
  onClose: () => void;
  aportesPEI: PlanningEvent['aportesPEI'] | null;
}

const AportesPEIDialog: React.FC<AportesPEIDialogProps> = ({ isOpen, onClose, aportesPEI }) => {
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
          <DialogTitle>Aportes al PEI</DialogTitle>
        </DialogHeader>
        {aportesPEI ? (
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-4">Evento: {aportesPEI.event.name}</h2>
            {aportesPEI.event.interventions.map(intervention => (
              <div key={intervention.interventionId} className="mb-6 p-4 border rounded-lg">
                <h3 className="text-lg font-semibold mb-2 text-[#014A2D]">
                  Área Estratégica: {intervention.strategies[0].strategicObjective.strategicArea.name}
                </h3>
                <div className="ml-4 mb-4">
                  <h4 className="text-md font-medium mb-2">
                    Objetivo Estratégico: {intervention.strategies[0].strategicObjective.description}
                  </h4>
                  <div className="ml-4 mb-2">
                    <p><strong>Estrategia:</strong> {intervention.strategies[0].description}</p>
                  </div>
                  <div className="ml-4">
                    <p><strong>Intervención:</strong> {intervention.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40">
            <p>Cargando datos...</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AportesPEIDialog;
