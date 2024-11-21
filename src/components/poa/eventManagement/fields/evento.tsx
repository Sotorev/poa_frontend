// src/components/poa/components/columns/evento.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface EventoComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventoComponent({ value, onChange }: EventoComponentProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 border-green-300 focus:border-green-500 focus:ring-green-500 text-green-700 placeholder-green-400"
      placeholder="Ingrese el evento"
    />
  );
}