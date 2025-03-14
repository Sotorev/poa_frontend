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
      className="w-64 border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary text-black placeholder-primary"
      placeholder="Indicador de logro"
    />
  );
}