// components/FinancialDetailsDialog.tsx
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import DownloadButton from './DownloadButton';
import { PlanningEvent } from '@/types/interfaces';

interface FinancialDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlanningEvent;
}

const FinancialDetailsDialog: React.FC<FinancialDetailsDialogProps> = ({ isOpen, onClose, event }) => {
  
  // Función para formatear moneda en quetzales
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount);
  };

  // Función para calcular el porcentaje con dos decimales
  const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return '0.00';
    return ((part / total) * 100).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Cerrar</span>
        </button>
        <DialogHeader className="bg-[#014A2D] text-white p-4 rounded-t-lg">
          <DialogTitle>Detalles Financieros</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-semibold">Aporte UMES:</h3>
            <p>
              {formatCurrency(event.aporteUMES)} (
              {calculatePercentage(event.aporteUMES, event.costoTotal)}%)
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Aporte Otros:</h3>
            <p>
              {formatCurrency(event.aporteOtros)} (
              {calculatePercentage(event.aporteOtros, event.costoTotal)}%)
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Tipo de Compra:</h3>
            <p>{event.tipoCompra}</p>
          </div>
          <div>
            <h3 className="font-semibold">Detalle de Presupuesto:</h3>
            <DownloadButton 
              eventId={Number(event.id)} 
              path="downloadCostDetailDocument" // Especificar la ruta personalizada
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialDetailsDialog;
