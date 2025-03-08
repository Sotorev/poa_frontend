// src/components/poa/components/columns/responsables.tsx
'use client';

import React from 'react';
import { Input } from '@/components/ui/input';

// Types
import { Responsible } from '../formView/eventPlanningForm.schema';

interface ResponsibleComponentProps {
  responsible: Responsible[];
  onUpdateResponsible: (index: number, responsible: Responsible) => void;
  onAppendResponsible: (responsible: Responsible) => void;
}

export function ResponsibleComponent({
  responsible,
  onUpdateResponsible,
  onAppendResponsible
}: ResponsibleComponentProps) {

  const handleResponsibleChange = (role: "Principal" | "Ejecución" | "Seguimiento", value: string) => {
    const existingIndex = responsible.findIndex(r => r.responsibleRole === role);

    if (existingIndex >= 0) {
      onUpdateResponsible(existingIndex, { name: value, responsibleRole: role });
    } else {
      onAppendResponsible({ name: value, responsibleRole: role });
    }
  };

  return (
    <div className="space-y-2">
      <Input
        placeholder="Responsable de planificación"
        value={responsible.find((r) => r.responsibleRole === "Principal")?.name || ""}
        onChange={(e) => handleResponsibleChange("Principal", e.target.value)}
      />
      <Input
        placeholder="Responsable de ejecución"
        value={responsible.find((r) => r.responsibleRole === "Ejecución")?.name || ""}
        onChange={(e) => handleResponsibleChange("Ejecución", e.target.value)}
      />
      <Input
        placeholder="Responsable de seguimiento"
        value={responsible.find((r) => r.responsibleRole === "Seguimiento")?.name || ""}
        onChange={(e) => handleResponsibleChange("Seguimiento", e.target.value)}
      />
    </div>
  );
}
