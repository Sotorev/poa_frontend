// src/components/poa/components/columns/objetivo.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface ObjetivoComponentProps {
  value: string;
  onChange: (value: string) => void;
}

export function ObjetivoComponent({ value, onChange }: ObjetivoComponentProps) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
