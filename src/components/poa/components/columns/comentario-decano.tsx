// src/components/poa/components/columns/comentario-decano.tsx
'use client';

import React from 'react';
import { Label } from '@/components/ui/label';

interface ComentarioDecanoComponentProps {
  comentario: string;
}

export function ComentarioDecanoComponent({ comentario }: ComentarioDecanoComponentProps) {
  return (
    <Label>{comentario}</Label>
  );
}
