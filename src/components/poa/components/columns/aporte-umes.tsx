// src/components/poa/components/columns/aporte-umes.tsx
'use client';

import React, { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Plus, Check, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFinancingSourceSchema, CreateFinancingSourceInput } from "@/schemas/financingSourceSchema";
import { z } from "zod";
import { FinancingSource } from "@/types/FinancingSource";

// Definir el esquema para el formulario de aportes
const aporteUmesSchema = z.object({
  fuente: z.string().min(1, "La fuente es requerida"),
  porcentaje: z
    .number({
      required_error: "El porcentaje es requerido",
      invalid_type_error: "El porcentaje debe ser un número",
    })
    .min(0, "El porcentaje no puede ser negativo")
    .max(100, "El porcentaje no puede superar 100"),
});

type AporteUmesForm = z.infer<typeof aporteUmesSchema>;

interface AporteUMES {
  fuente: string;
  porcentaje: number;
}

interface AporteUmesProps {
  aportes: AporteUMES[];
  onChangeAportes: (aportes: AporteUMES[]) => void;
}

interface FinancingSourceWithFrontend extends FinancingSource {
  id: string;
}

export function AporteUmes({ aportes, onChangeAportes }: AporteUmesProps) {
  const [options, setOptions] = useState<FinancingSourceWithFrontend[]>([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Configurar react-hook-form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AporteUmesForm>({
    resolver: zodResolver(aporteUmesSchema),
    defaultValues: {
      fuente: "",
      porcentaje: 0,
    },
  });

  // Fetch de fuentes de financiamiento con category "UMES"
  useEffect(() => {
    const fetchFinancingSources = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/financingSource`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Error al obtener fuentes de financiamiento: ${response.statusText}`);
        }

        const data: FinancingSource[] = await response.json();
        // Filtrar por category "UMES"
        const filteredData = data.filter(source => source.category === "UMES" && !source.isDeleted);

        // Mapear a FinancingSourceWithFrontend
        const mappedSources: FinancingSourceWithFrontend[] = filteredData.map((source) => ({
          ...source,
          id: source.financingSourceId.toString(),
        }));

        setOptions(mappedSources);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancingSources();
  }, []);

  // Función para manejar el envío del formulario de agregar aporte
  const onSubmit = async (data: AporteUmesForm) => {
    try {
      // Verificar si la fuente ya existe en las opciones
      let existingSource = options.find(source => source.name.toLowerCase() === data.fuente.toLowerCase());

      if (!existingSource) {
        // Crear una nueva fuente de financiamiento en el backend
        const createResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/financingSource`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            name: data.fuente,
            category: "UMES",
          } as CreateFinancingSourceInput),
        });

        if (!createResponse.ok) {
          const errorData = await createResponse.json();
          throw new Error(errorData.message || "Error al crear la fuente de financiamiento");
        }

        const createdSource: FinancingSource = await createResponse.json();
        existingSource = {
          ...createdSource,
          id: createdSource.financingSourceId.toString(),
        };

        // Actualizar las opciones
        setOptions(prev => [...prev, existingSource as FinancingSourceWithFrontend]);
      }

      // Agregar el nuevo aporte
      const newAportes = [...aportes, { fuente: existingSource.name, porcentaje: data.porcentaje }];
      onChangeAportes(newAportes);

      // Resetear el formulario
      reset();
      setIsAddingNew(false);
    } catch (err) {
      console.error(err);
      alert(`Error al agregar el aporte: ${(err as Error).message}`);
    }
  };

  // Función para manejar la eliminación de un aporte
  const handleRemoveAporte = (fuente: string) => {
    const newAportes = aportes.filter(aporte => aporte.fuente !== fuente);
    onChangeAportes(newAportes);
  };

  if (loading) return <div>Cargando fuentes de financiamiento...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-gray-700">Aporte UMES</Label>
      <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
        <Select
          value={undefined}
          onValueChange={(value) => {
            // Manejar selección externa si es necesario
          }}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Seleccionar fuente" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {options.map(option => (
                <SelectItem key={option.id} value={option.name}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Input
          type="number"
          placeholder="Porcentaje"
          {...register("porcentaje", { valueAsNumber: true })}
          className={`w-24 ${
            errors.porcentaje ? "border-red-500" : "border-green-300"
          }`}
        />
        <Button type="submit" disabled={!!errors.porcentaje}>
          Agregar
        </Button>
      </form>

      {/* Mostrar errores de validación */}
      {errors.fuente && (
        <span className="text-red-500 text-sm">{errors.fuente.message}</span>
      )}
      {errors.porcentaje && (
        <span className="text-red-500 text-sm">{errors.porcentaje.message}</span>
      )}

      {/* Agregar nueva fuente */}
      {isAddingNew ? (
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2">
          <Input
            placeholder="Nueva fuente..."
            {...register("fuente")}
            className={`w-[200px] ${
              errors.fuente ? "border-red-500" : "border-green-300"
            }`}
          />
          <Input
            type="number"
            placeholder="Porcentaje"
            {...register("porcentaje", { valueAsNumber: true })}
            className={`w-24 ${
              errors.porcentaje ? "border-red-500" : "border-green-300"
            }`}
          />
          <Button type="submit">
            <Check className="h-4 w-4" />
          </Button>
          <Button type="button" onClick={() => { reset(); setIsAddingNew(false); }}>
            <X className="h-4 w-4" />
          </Button>
        </form>
      ) : (
        <Button onClick={() => setIsAddingNew(true)} variant="outline" className="text-sm">
          <Plus className="h-4 w-4 mr-2" /> Agregar nueva fuente
        </Button>
      )}

      {/* Lista de aportes */}
      <div className="space-y-2">
        {aportes.map(aporte => (
          <div key={aporte.fuente} className="flex items-center justify-between bg-green-100 p-2 rounded-md">
            <span className="text-green-800">{aporte.fuente}: {aporte.porcentaje}%</span>
            <Button onClick={() => handleRemoveAporte(aporte.fuente)} variant="ghost" size="sm">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
