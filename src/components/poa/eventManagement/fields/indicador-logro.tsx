// src/components/poa/components/columns/indicador-logro.tsx
'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface IndicadorLogroComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function IndicadorLogroComponent({ value, onChange }: IndicadorLogroComponentProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 border-green-300 focus:border-green-500 focus:ring-green-500"
      placeholder="Indicador de logro"
    />
  );
}