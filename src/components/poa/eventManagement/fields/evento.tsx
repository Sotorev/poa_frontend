// src/components/poa/components/columns/evento.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface EventNameComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function EventNameComponent({ value, onChange }: EventNameComponentProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary text-black placeholder-primary"
      placeholder="Ingrese el nombre del evento"
    />
  );
}