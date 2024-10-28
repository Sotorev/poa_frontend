// src/components/poa/components/columns/campus-selector.tsx

import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getCampuses } from '@/services/apiService';
import { Campus } from '@/types/Campus';

interface CampusSelectorProps {
  onSelectCampus: (campusId: string) => void;
  selectedCampusId: string;
}

export function CampusSelector({ onSelectCampus, selectedCampusId }: CampusSelectorProps) {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = useCurrentUser();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCampuses(user?.token || '');
        const activeCampuses = data.filter((campus) => !campus.isDeleted);
        setCampuses(activeCampuses);
      } catch (err) {
        setError('No se pudieron cargar los campus.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.token]);

  if (loading) return <div>Cargando campus...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Select onValueChange={onSelectCampus} value={selectedCampusId}>
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
  );
}
