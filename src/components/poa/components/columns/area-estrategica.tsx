// src/components/poa/components/columns/area-estrategica.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

interface AreaEstrategicaComponentProps {
  areaEstrategica: string;
  error?: string;
}

export function AreaEstrategicaComponent({ areaEstrategica, error }: AreaEstrategicaComponentProps) {
  return (
    <div>
      <Input
        value={areaEstrategica}
        readOnly
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
    </div>
  );
}
