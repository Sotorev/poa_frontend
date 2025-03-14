// src/components/poa/components/columns/objetivo.tsx
'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ObjectiveComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function ObjectiveComponent({ value, onChange }: ObjectiveComponentProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary text-black placeholder-primary"
      placeholder="Ingrese el objetivo del evento"
    />
  );
}