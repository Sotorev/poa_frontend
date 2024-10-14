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
    />
  );
}
