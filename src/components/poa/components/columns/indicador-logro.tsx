// src/components/poa/components/columns/indicador-logro.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface IndicadorLogroComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function IndicadorLogroComponent({ value, onChange }: IndicadorLogroComponentProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
