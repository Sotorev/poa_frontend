// src/components/poa/components/columns/campus-selector.tsx

import React, { useState, useEffect, useContext } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Campus } from '@/types/Campus';
import { EventContext } from '../event.context';

interface CampusSelectorProps {
  onSelectCampus: (campusId: number) => void;
  selectedCampusId: number;
}

export function CampusSelector({ onSelectCampus, selectedCampusId }: CampusSelectorProps) {

  const { campuses } = useContext(EventContext)

  return (
    <Select onValueChange={(value) => onSelectCampus(Number.parseInt(value))} value={selectedCampusId?.toString()}>
      <SelectTrigger className=" border-green-300 focus:ring-green-500 focus:border-green-500">
        <SelectValue placeholder="Selecciona un campus" />
      </SelectTrigger>
      <SelectContent>
        {campuses.map((campus) => (
          <SelectItem
            key={campus.campusId}
            value={campus.campusId.toString()}
            className="text-green-700 hover:bg-green-50 focus:bg-green-100"
          >
            {campus.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
