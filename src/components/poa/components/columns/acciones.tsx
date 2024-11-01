// src/components/poa/components/columns/acciones.tsx
'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Send } from 'lucide-react';

interface AccionesComponentProps {
  // onEliminar: () => void;
  onEnviar: () => void;
}

export function AccionesComponent({ /*onEliminar,*/ onEnviar }: AccionesComponentProps) {
  return (
    <div className="flex flex-col space-y-2">
      {/* <Button variant="destructive" onClick={onEliminar}>
        <Trash2 className="h-4 w-4" />
      </Button> */}
      <Button variant="outline" onClick={onEnviar}>
        <Send className="h-4 w-4" />
      </Button>
    </div>
  );
}
