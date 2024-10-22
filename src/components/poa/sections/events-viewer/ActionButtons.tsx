import React from 'react';
import { Button } from "@/components/ui/button";
import { PlanningEvent } from '@/types/interfaces';

interface ActionButtonsProps {
  event: PlanningEvent;
  isPending: boolean;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  onRequestCorrection: (id: string) => void;
  onRevert: (id: string) => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  event,
  isPending,
  onApprove,
  onReject,
  onRequestCorrection,
  onRevert
}) => {
  if (isPending) {
    return (
      <div className="flex space-x-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => onApprove(event.id)}
        >
          Aprobado
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onReject(event.id)}
        >
          Rechazado
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => onRequestCorrection(event.id)}
        >
          Aprobado con Correcciones
        </Button>
      </div>
    );
  } else {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => onRevert(event.id)}
      >
        Regresar a Pendiente
      </Button>
    );
  }
};

export default ActionButtons;
