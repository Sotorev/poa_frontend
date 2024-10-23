'use client'

import React, { useState, useEffect } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/auth-context'

interface FacultyData {
  poaId: number;
  year: number;
  facultyId: number;
  faculty: {
    name: string;
  };
}

const facultyDataSchema = z.object({
  poaId: z.number(),
  year: z.number(),
  facultyId: z.number(),
  faculty: z.object({
    name: z.string(),
  }),
});

const facultiesSchema = z.array(facultyDataSchema);

interface WelcomeVicechancellorProps {
  onSelectFaculty: (facultyId: number, poaId: number) => void;
}

export function WelcomeVicechancellor({ onSelectFaculty }: WelcomeVicechancellorProps) {
  const { user, loading } = useAuth();
  const [fullName, setFullName] = useState("Usuario");
  const [faculties, setFaculties] = useState<FacultyData[]>([]);
  const [loadingFaculties, setLoadingFaculties] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');

  // Fetch para obtener el nombre del usuario
  useEffect(() => {
    const fetchUserData = async () => {
      if (loading) {
        console.log("Cargando información del usuario...");
        return;
      }

      if (!user) {
        console.log("No estás autenticado.");
        alert("No estás autenticado.");
        return;
      }

      try {
        const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${user.userId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!userResponse.ok) {
          throw new Error('Error al obtener datos del usuario');
        }

        const userData = await userResponse.json();
        const userFullName = `${userData.firstName} ${userData.lastName}`;
        setFullName(userFullName); // Guardar el nombre completo en el estado

      } catch (error: any) {
        console.error("Error al obtener los datos del usuario:", error);
      }
    };

    fetchUserData();
  }, [user, loading]);

  // Fetch para obtener las facultades y el año del POA
  useEffect(() => {
    const fetchFaculties = async () => {
      setLoadingFaculties(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/closed`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error al obtener facultades: ${response.statusText}`);
        }
        const data = await response.json();
        const parsedData = facultiesSchema.parse(data); // Validar la respuesta de la API
        setFaculties(parsedData);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos de facultades.");
          console.error(err.errors);
        } else {
          setError((err as Error).message);
        }
        toast.error(`Error al cargar facultades: ${(err as Error).message}`);
      } finally {
        setLoadingFaculties(false);
      }
    };

    fetchFaculties();
  }, []);

  const handleFacultyChange = (value: string) => {
    setSelectedFaculty(value);
    const selected = faculties.find(faculty => faculty.facultyId.toString() === value);
    if (selected) {
      onSelectFaculty(selected.facultyId, selected.poaId); // Enviar facultyId y poaId
    }
  };

  if (loadingFaculties) return <div>Cargando facultades...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Bienvenido, {fullName}</h1>
      <div className="max-w-xs mx-auto">
        <Select onValueChange={handleFacultyChange} value={selectedFaculty}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecciona una facultad" />
          </SelectTrigger>
          <SelectContent>
            {faculties.map((faculty) => (
              <SelectItem 
                key={faculty.facultyId} 
                value={faculty.facultyId.toString()}
              >
                {faculty.faculty.name} - {faculty.year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
