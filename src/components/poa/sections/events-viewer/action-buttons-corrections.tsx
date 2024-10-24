'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PlanningEvent } from '@/types/interfaces';
import { Pencil, Trash2 } from 'lucide-react';

interface ActionButtonsCorrectionsProps {
  event: PlanningEvent;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ActionButtonsCorrectionsComponent({
  event,
  onEdit,
  onDelete
}: ActionButtonsCorrectionsProps) {
  return (
    <TooltipProvider>
      <div className="flex space-x-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onEdit(event.id)}
              className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 transition-colors"
            >
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Editar evento</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Editar evento</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => onDelete(event.id)}
              className="border-green-700 text-green-800 hover:bg-green-100 hover:text-green-900 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Eliminar evento</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Eliminar evento</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}