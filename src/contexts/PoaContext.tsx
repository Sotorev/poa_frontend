"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from "next-auth/react";
import { getPoaByFacultyAndYear } from '@/services/apiService';
import { getFacultyByUserId } from '@/services/faculty/currentFaculty';
import { Poa } from '@/types/Poa';
import { useCurrentUser } from '@/hooks/use-current-user';

interface PoaContextType {
  poaId: number | null;
  poa: Poa | null;
  loading: boolean;
  error: string | null;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
}

const PoaContext = createContext<PoaContextType | undefined>(undefined);

export const PoaProvider = ({ children }: { children: ReactNode }) => {
  const user = useCurrentUser();
  const [poaId, setPoaId] = useState<number | null>(null);
  const [poa, setPoa] = useState<Poa | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    const fetchPoa = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Obtener la facultad del usuario
        const facultyId = await getFacultyByUserId(
          Number(user.userId),
          user.token
        );
        
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
  }, [user, selectedYear]);

  return (
    <PoaContext.Provider value={{ 
      poaId, 
      poa, 
      loading, 
      error, 
      selectedYear, 
      setSelectedYear: handleYearChange 
    }}>
      {children}
    </PoaContext.Provider>
  );
};

export const usePoa = () => {
  const context = useContext(PoaContext);
  if (context === undefined) {
    throw new Error('usePoa debe ser usado dentro de un PoaProvider');
  }
  return context;
};