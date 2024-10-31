// src/components/poa/components/columns/responsables.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ResponsablesComponentProps {
  responsablePlanificacion: string;
  responsableEjecucion: string;
  responsableSeguimiento: string;
  onChangeResponsablePlanificacion: (value: string) => void;
  onChangeResponsableEjecucion: (value: string) => void;
  onChangeResponsableSeguimiento: (value: string) => void;
}

export function ResponsablesComponent({
  responsablePlanificacion,
  responsableEjecucion,
  responsableSeguimiento,
  onChangeResponsablePlanificacion,
  onChangeResponsableEjecucion,
  onChangeResponsableSeguimiento,
}: ResponsablesComponentProps) {
  return (
    <div className="space-y-2">
      <Input
        placeholder="Responsable de planificación"
        value={responsablePlanificacion}
        onChange={(e) => onChangeResponsablePlanificacion(e.target.value)}
      />
      <Input
        placeholder="Responsable de ejecución"
        value={responsableEjecucion}
        onChange={(e) => onChangeResponsableEjecucion(e.target.value)}
      />
      <Input
        placeholder="Responsable de seguimiento"
        value={responsableSeguimiento}
        onChange={(e) => onChangeResponsableSeguimiento(e.target.value)}
      />
    </div>
  );
}
