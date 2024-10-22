import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { PlanningEvent } from '@/types/interfaces';

interface FinancialDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlanningEvent;
  handleDownload: (url: string, filename: string) => void;
}

const FinancialDetailsDialog: React.FC<FinancialDetailsDialogProps> = ({ isOpen, onClose, event, handleDownload }) => {
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
          <DialogTitle>Detalles Financieros</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">Aporte UMES:</h3>
            <p>${event.aporteUMES.toLocaleString()} ({((event.aporteUMES / event.costoTotal) * 100).toFixed(2)}%)</p>
          </div>
          <div>
            <h3 className="font-semibold">Aporte Otros:</h3>
            <p>${event.aporteOtros.toLocaleString()} ({((event.aporteOtros / event.costoTotal) * 100).toFixed(2)}%)</p>
          </div>
          <div>
            <h3 className="font-semibold">Tipo de Compra:</h3>
            <p>{event.tipoCompra}</p>
          </div>
          <div>
            <h3 className="font-semibold">Detalle de Presupuesto:</h3>
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-gray-100 text-gray-800 hover:bg-gray-200"
              onClick={() => handleDownload(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/downloadCostDetailDocument/${event.id}`, `presupuesto_${event.id}.pdf`)}
            >
              <Download className="w-4 h-4 mr-2" />
              Descargar Documento
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialDetailsDialog;
