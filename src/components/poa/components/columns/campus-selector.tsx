// src/components/poa/components/columns/campus-selector.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useCurrentUser } from '@/hooks/use-current-user';

interface Campus {
  campusId: number;
  name: string;
  city: string;
  department: string;
  isDeleted: boolean;
  currentStudentCount: number | null;
}

const campusSchema = z.object({
  campusId: z.number(),
  name: z.string(),
  city: z.string(),
  department: z.string(),
  isDeleted: z.boolean(),
  currentStudentCount: z.number().nullable(),
});

const campusesSchema = z.array(campusSchema);

interface CampusSelectorProps {
  onSelectCampus: (campusId: string) => void;
}

export function CampusSelector({ onSelectCampus }: CampusSelectorProps) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCampus, setSelectedCampus] = useState<string>('');
  const user = useCurrentUser();

  useEffect(() => {
    const fetchCampuses = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campus/`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          },
        });
        if (!response.ok) {
          throw new Error(`Error al obtener campus: ${response.statusText}`);
        }
        const data = await response.json();
        const parsedData = campusesSchema.parse(data);
        const activeCampuses = parsedData.filter(campus => !campus.isDeleted);
        setCampuses(activeCampuses);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos de campus.");
          console.error(err.errors);
        } else {
          setError((err as Error).message);
        }
        toast.error(`Error al cargar campus: ${(err as Error).message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchCampuses();
  }, []);

  const handleCampusChange = (value: string) => {
    setSelectedCampus(value)
    onSelectCampus(value)
  }

  if (loading) return <div>Cargando campus...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Select onValueChange={handleCampusChange} value={selectedCampus}>
      <SelectTrigger className="w-[200px] border-green-300 focus:ring-green-500 focus:border-green-500">
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
  )
}
