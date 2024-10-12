// hooks/useStrategicAreas.ts
import { useEffect, useState } from 'react';
import axios from 'axios';

export interface StrategicArea {
  strategicAreaId: number;
  name: string;
  peiId: number;
  isDeleted: boolean;
}

export const useStrategicAreas = () => {
  const [areas, setAreas] = useState<StrategicArea[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await axios.get<StrategicArea[]>(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicareas`);
        setAreas(response.data);
      } catch (err) {
        setError('Error al obtener las áreas estratégicas');
      } finally {
        setLoading(false);
      }
    };

    fetchAreas();
  }, []);

  return { areas, loading, error };
};
