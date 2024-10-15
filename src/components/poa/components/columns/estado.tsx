// src/components/poa/components/columns/estado.tsx
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

interface EstadoComponentProps {
  estado: 'En revisión' | 'Aprobado' | 'Rechazado';
}

export function EstadoComponent({ estado }: EstadoComponentProps) {
  let colorClass = '';
  if (estado === 'En revisión') colorClass = 'text-blue-500';
  else if (estado === 'Aprobado') colorClass = 'text-green-500';
  else if (estado === 'Rechazado') colorClass = 'text-red-500';

  return (
    <Label className={colorClass}>
      {estado.charAt(0).toUpperCase() + estado.slice(1)}
    </Label>
  );
}
