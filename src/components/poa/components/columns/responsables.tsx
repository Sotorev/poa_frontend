// src/components/poa/components/columns/responsables.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface ResponsablesComponentProps {
  responsablePlanificacion: string;
  responsableEjecucion: string;
  responsableFinalizacion: string;
  onChangeResponsablePlanificacion: (value: string) => void;
  onChangeResponsableEjecucion: (value: string) => void;
  onChangeResponsableFinalizacion: (value: string) => void;
}

export function ResponsablesComponent({
  responsablePlanificacion,
  responsableEjecucion,
  responsableFinalizacion,
  onChangeResponsablePlanificacion,
  onChangeResponsableEjecucion,
  onChangeResponsableFinalizacion,
}: ResponsablesComponentProps) {
  return (
    <div className="space-y-2">
      <Input
        placeholder="Responsable Planificación"
        value={responsablePlanificacion}
        onChange={(e) => onChangeResponsablePlanificacion(e.target.value)}
      />
      <Input
        placeholder="Responsable Ejecución"
        value={responsableEjecucion}
        onChange={(e) => onChangeResponsableEjecucion(e.target.value)}
      />
      <Input
        placeholder="Responsable Finalización"
        value={responsableFinalizacion}
        onChange={(e) => onChangeResponsableFinalizacion(e.target.value)}
      />
    </div>
  );
}
