// src/components/poa/components/columns/area-estrategica.tsx
'use client';

import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AreaEstrategicaComponentProps {
  areaEstrategica: string;
  error?: string;
}

export function AreaEstrategicaComponent({ areaEstrategica, error }: AreaEstrategicaComponentProps) {
  return (
    <div className="w-64 h-full">
      <p className="text-sm text-gray-500">Auto-selección al elegir objetivo estratégico</p>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full p-2 flex items-center">
              <label
                className={`block w-full h-8 p-2 bg-background border rounded-md text-sm ${
                  error ? 'border-red-500 text-red-500' : 'border-primary text-black'
                } truncate cursor-default overflow-hidden`}
              >
                {areaEstrategica}
              </label>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>{areaEstrategica}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {error && (
        <span className="text-red-500 text-sm mt-1 block">{error}</span>
      )}
    </div>
  );
}