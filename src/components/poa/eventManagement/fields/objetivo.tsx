// src/components/poa/components/columns/objetivo.tsx
'use client';

import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface ObjetivoComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function ObjetivoComponent({ value, onChange }: ObjetivoComponentProps) {
  return (
    <Textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-64 border-green-300 focus:border-green-500 focus:ring-green-500 text-green-700 placeholder-green-400"
      placeholder="Ingrese el objetivo"
    />
  );
}