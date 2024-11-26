import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from 'lucide-react';
import DownloadButton from './DownloadButton';
import { PlanningEvent } from '@/types/interfaces';
import { getFinancingSources } from '@/services/apiService';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FinancialDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: PlanningEvent;
}

const fetchFinancing = async (user: any) => {
  try {
    const financing = await getFinancingSources(user?.token || '');
    console.log("financing", financing);

    const otherFinancing = financing.filter(
      (source) => source.category === 'Otra' && !source.isDeleted
    );

    console.log("otherFinancing at fetch", otherFinancing);

    const umesFinancing = financing.filter(
      (source) => source.category === 'UMES' && !source.isDeleted
    );

    return { otherFinancing, umesFinancing };

  } catch (err) {
    console.error(err);
    return { otherFinancing: [], umesFinancing: [] };
  }
};

const FinancialDetailsDialog: React.FC<FinancialDetailsDialogProps> = ({ isOpen, onClose, event }) => {
  const [financing, setFinancing] = React.useState<{ otherFinancing: any[]; umesFinancing: any[]; }>({ otherFinancing: [], umesFinancing: [] });
  const user = useCurrentUser();

  React.useEffect(() => {
    const loadFinancing = async () => {
      const result = await fetchFinancing(user);
      console.log("result", result);
      if (result) {
        setFinancing(result);
      }
    };
    loadFinancing();
  }, []);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(amount);
  };

  const calculatePercentage = (part: number, total: number): string => {
    if (total === 0) return '0.00';
    return ((part / total) * 100).toFixed(2);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="bg-[#014A2D] text-white p-4 sticky top-0 z-10">
          <DialogTitle className="text-xl font-semibold">Detalles Financieros</DialogTitle>
        </DialogHeader>
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 z-20"
        >
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Cerrar</span>
        </button>
        
        <ScrollArea className="h-[calc(90vh-4rem)] px-4 py-0 pb-4">
          <div className="space-y-2">
            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Aporte UMES</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.aporteUMES.map((aporte, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-muted/60 p-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="font-medium text-muted-foreground">
                      {financing.umesFinancing
                        .filter((financingSource) => financingSource.financingSourceId === aporte.financingSourceId)
                        .map((source) => source.name)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(aporte.amount)}</span>
                      <span className="rounded-full bg-[#014A2D]/10 px-2 py-0.5 text-xs font-medium text-[#014A2D]">
                        {calculatePercentage(aporte.amount, event.costoTotal)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Aporte Otros</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {event.aporteOtros.map((aporte, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md bg-muted/60 p-2 text-sm transition-colors hover:bg-muted"
                  >
                    <span className="font-medium text-muted-foreground">
                      {financing.otherFinancing
                        .filter((financingSource) => financingSource.financingSourceId === aporte.financingSourceId)
                        .map((source) => source.name)}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{formatCurrency(aporte.amount)}</span>
                      <span className="rounded-full bg-[#014A2D]/10 px-2 py-0.5 text-xs font-medium text-[#014A2D]">
                        {calculatePercentage(aporte.amount, event.costoTotal)}%
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border">
              <CardContent className="pt-4">
                <div className="space-y-4">
                    <div>
                    <p className="text-lg font-semibold mb-1">
                      Tipo de Compra: <span className="text-md text-[#014A2D]">{event.tipoCompra}</span>
                    </p>
                    </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-1">Detalle de Presupuesto</h3>
                    <DownloadButton
                      eventId={Number(event.id)}
                      path="downloadCostDetailDocument"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FinancialDetailsDialog;