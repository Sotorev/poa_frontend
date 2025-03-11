// src/components/poa/components/columns/campus-selector.tsx

import React, { useContext } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventContext } from '../event.context';

interface CampusSelectorProps {
  onSelectCampus: (campusId: number) => void;
  selectedCampusId: number;
}

export function CampusSelector({ onSelectCampus, selectedCampusId }: CampusSelectorProps) {

  const { campuses } = useContext(EventContext)

  return (
    <Select onValueChange={(value) => onSelectCampus(Number.parseInt(value))} value={selectedCampusId?.toString()}>
      <SelectTrigger className=" border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
        <SelectValue placeholder="Selecciona un campus" />
      </SelectTrigger>
      <SelectContent>
        {campuses.map((campus) => (
          <SelectItem
            key={campus.campusId}
            value={campus.campusId.toString()}
            className="text-primary hover:bg-primary/10 focus:bg-primary/10"
          >
            {campus.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
