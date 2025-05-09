"use client";

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { getPoaByFacultyAndYear } from '@/services/apiService';
import { getFacultyByUserId } from '@/services/faculty/currentFaculty';
import { Poa } from '@/types/Poa';
import { useCurrentUser } from '@/hooks/use-current-user';

// Tipos

interface PoaContextType {
  poaId: number | null;
  poa: Poa | null;
  loading: boolean;
  error: string | null;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  facultyId: number | null;
  poas: Poa[];
}

const defaultPoaContext: PoaContextType = {
  poaId: null,
  poa: null,
  loading: false,
  error: null,
  selectedYear: new Date().getFullYear(),
  setSelectedYear: () => { /* no-op */ },
  facultyId: null,
  poas: [],
};

interface poas {
  poaId: number
  year: number
  facultyId: number
  userId: number
  submissionDate?: string
  status: string
  completionPercentage: number
  assignedBudget: number
  executedBudget: number
  peiId: number
  submissionStatus?: string
  isDeleted: boolean
}

const getPoasByFacultyId = async (facultyId: number, token: string): Promise<Poa[]> => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Error fetching POAs');
  }

  // filtrar por facultyId
  const poas = await response.json();

  // Ordenar por año de forma descendente y filtrar por facultyId
  const filteredPoas = poas.filter((poa: poas) => poa.facultyId === facultyId).sort((a: poas, b: poas) => b.year - a.year);
  return filteredPoas;
}

export const PoaContext = createContext<PoaContextType>(defaultPoaContext);

export const PoaProvider = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser();
  const [poaId, setPoaId] = useState<number | null>(null);
  const [poa, setPoa] = useState<Poa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [poas, setPoas] = useState<Poa[]>([]);

  // Inicializar el año desde localStorage o usar el año anterior como valor predeterminado
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const savedYear = localStorage.getItem('selectedPoaYear');
      return savedYear ? parseInt(savedYear) : new Date().getFullYear() - 1;
    }
    return new Date().getFullYear() - 1;
  });

  // Guardar el año en localStorage cuando cambie
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    localStorage.setItem('selectedPoaYear', year.toString());
  };

  // Efecto para obtener la facultad del usuario actual
  useEffect(() => {
    const fetchFaculty = async () => {
      if (!user) return;

      try {
        // Obtener la facultad del usuario
        const faculty = await getFacultyByUserId(
          Number(user.userId),
          user.token
        );
        setFacultyId(faculty);
      } catch (err) {
        console.error("Error al obtener la facultad:", err);
        setError(err instanceof Error ? err.message : "Error al obtener la facultad");
      }
    };

    fetchFaculty();
  }, [user]);

  // Efecto para obtener todos los POAs de la facultad
  useEffect(() => {
    const fetchPoas = async () => {
      if (!facultyId || !user) return;

      try {
        setLoading(true);
        const poasData = await getPoasByFacultyId(facultyId, user.token);

        // agregar el año actual a la lista de años si no existe
        const currentYear = new Date().getFullYear();
        const currentYearExists = poasData.some((poa) => Number(poa.year) === currentYear);

        if (!currentYearExists) {
          poasData.unshift({
            poaId: 0,
            year: currentYear.toString(),
            facultyId: facultyId,
            userId: user.userId,
            status: "No definido",
            completionPercentage: 0,
            assignedBudget: 0,
            executedBudget: 0,
            peiId: 0,
            isDeleted: false,
          });
        }

        setPoas(poasData);
      } catch (err) {
        console.error("Error al cargar los POAs:", err);
        setError(err instanceof Error ? err.message : "Error al cargar los POAs");
      } finally {
        setLoading(false);
      }
    };

    fetchPoas();
  }, [facultyId, user]);

  useEffect(() => {
    const fetchPoa = async () => {
      if (!user || !facultyId) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener el POA por facultad y año
        const poaData = await getPoaByFacultyAndYear(
          facultyId,
          selectedYear,
          user.token
        );

        setPoa(poaData);
        setPoaId(poaData.poaId);
      } catch (err) {
        console.error("Error al cargar el POA:", err);
        setError(err instanceof Error ? err.message : "Error al cargar el POA");
        setPoa(null);
        setPoaId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPoa();
  }, [user, selectedYear, facultyId]);

  return (
    <PoaContext.Provider value={{
      poaId,
      poa,
      loading,
      error,
      selectedYear,
      setSelectedYear: handleYearChange,
      facultyId,
      poas
    }}>
      {children}
    </PoaContext.Provider>
  );
};