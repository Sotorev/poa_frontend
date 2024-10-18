// src/components/poa/components/columns/campus-selector.tsx
'use client'

import React, { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Campus {
  id: string;
  name: string;
}

const campuses: Campus[] = [
  { id: '1', name: 'Campus Central' },
  { id: '2', name: 'Campus Norte' },
  { id: '3', name: 'Campus Sur' },
  { id: '4', name: 'Campus Este' }, 
  { id: '5', name: 'Campus Oeste' },
]

interface CampusSelectorProps {
  onSelectCampus: (campusId: string) => void;
}

export function CampusSelector({ onSelectCampus }: CampusSelectorProps) {
  const [selectedCampus, setSelectedCampus] = useState<string>('')

  const handleCampusChange = (value: string) => {
    setSelectedCampus(value)
    onSelectCampus(value)
  }

  return (
    <Select onValueChange={handleCampusChange} value={selectedCampus}>
      <SelectTrigger className="w-[200px] border-green-300 focus:ring-green-500 focus:border-green-500">
        <SelectValue placeholder="Selecciona un campus" />
      </SelectTrigger>
      <SelectContent>
        {campuses.map((campus) => (
          <SelectItem 
            key={campus.id} 
            value={campus.id}
            className="text-green-700 hover:bg-green-50 focus:bg-green-100"
          >
            {campus.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
