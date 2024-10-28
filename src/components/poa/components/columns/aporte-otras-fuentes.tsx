// src/components/poa/components/columns/aporte-otras-fuentes.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FinancingSource } from '@/types/FinancingSource';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getFinancingSources } from '@/services/apiService';

const aporteOtrasFuentesSchema = z.object({
  financingSourceId: z.number({
    required_error: 'La fuente es requerida',
    invalid_type_error: 'La fuente debe ser un número',
  }),
  porcentaje: z
    .number({
      required_error: 'El porcentaje es requerido',
      invalid_type_error: 'El porcentaje debe ser un número',
    })
    .min(0, 'El porcentaje no puede ser negativo')
    .max(100, 'El porcentaje no puede superar 100'),
  amount: z
    .number({
      required_error: 'El monto es requerido',
      invalid_type_error: 'El monto debe ser un número',
    })
    .nonnegative('El monto no puede ser negativo'),
});

type AporteOtrasFuentesForm = z.infer<typeof aporteOtrasFuentesSchema>;

interface AporteOtrasFuentes {
  financingSourceId: number;
  porcentaje: number;
  amount: number;
}

interface AporteOtrasFuentesProps {
  aportes: AporteOtrasFuentes[];
  onChangeAportes: (aportes: AporteOtrasFuentes[]) => void;
}

export function AporteOtrasFuentesComponent({ aportes, onChangeAportes }: AporteOtrasFuentesProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AporteOtrasFuentesForm>({
    resolver: zodResolver(aporteOtrasFuentesSchema),
    defaultValues: {
      financingSourceId: undefined,
      porcentaje: undefined,
      amount: undefined,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getFinancingSources(user?.token || '');
        const filteredData = data.filter(
          (source) => source.category === 'Otra' && !source.isDeleted
        );
        setFinancingSources(filteredData);
      } catch (err) {
        console.error(err);
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.token]);

  const onSubmit = (data: AporteOtrasFuentesForm) => {
    try {
      const nuevoAporte: AporteOtrasFuentes = {
        financingSourceId: data.financingSourceId,
        porcentaje: data.porcentaje,
        amount: data.amount,
      };
      const newAportes = [...aportes, nuevoAporte];
      onChangeAportes(newAportes);
      reset();
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert(`Error al agregar el aporte: ${(err as Error).message}`);
    }
  };

  const handleRemoveAporte = (index: number) => {
    const newAportes = aportes.filter((_, i) => i !== index);
    onChangeAportes(newAportes);
  };

  if (loading) return <div className="text-green-600">Cargando fuentes de financiamiento...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-4">
      <Label className="text-sm font-medium text-green-700">Aporte Otras Fuentes</Label>
      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} variant="outline" className="text-sm text-green-600 border-green-300 hover:bg-green-50">
          Agregar aporte
        </Button>
      )}
      {isAdding && (
        <form onSubmit={handleSubmit(onSubmit)} className="flex space-x-2 items-end">
          <div>
            <Label className="text-green-700">Fuente</Label>
            <Select onValueChange={(value) => setValue('financingSourceId', parseInt(value))}>
              <SelectTrigger className="w-[200px] border-green-300 focus:ring-green-500">
                <SelectValue placeholder="Seleccionar fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {financingSources.map((source) => (
                    <SelectItem key={source.financingSourceId} value={source.financingSourceId.toString()}>
                      {source.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {errors.financingSourceId && (
              <span className="text-red-500 text-sm">{errors.financingSourceId.message}</span>
            )}
          </div>
          <div>
            <Label className="text-green-700">Porcentaje</Label>
            <Input
              type="number"
              placeholder="Porcentaje"
              {...register("porcentaje", { valueAsNumber: true })}
              className={`w-24 ${errors.porcentaje ? "border-red-500" : "border-green-300"}`}
            />
            {errors.porcentaje && (
              <span className="text-red-500 text-sm">{errors.porcentaje.message}</span>
            )}
          </div>
          <div>
            <Label className="text-green-700">Monto</Label>
            <Input
              type="number"
              placeholder="Monto"
              {...register("amount", { valueAsNumber: true })}
              className={`w-24 ${errors.amount ? "border-red-500" : "border-green-300"}`}
            />
            {errors.amount && (
              <span className="text-red-500 text-sm">{errors.amount.message}</span>
            )}
          </div>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
            Agregar
          </Button>
          <Button type="button" onClick={() => { reset(); setIsAdding(false); }} className="text-green-600 hover:text-green-700">
            <X className="h-4 w-4" />
          </Button>
        </form>
      )}

      <div className="space-y-2">
        {aportes.map((aporte, index) => {
          const fuente = financingSources.find(source => source.financingSourceId === aporte.financingSourceId)?.name || aporte.financingSourceId;
          return (
            <div key={index} className="flex items-center justify-between bg-green-100 p-2 rounded-md">
              <span className="text-green-800">
                {fuente}: {aporte.porcentaje}% - Q{aporte.amount.toFixed(2)}
              </span>
              <Button onClick={() => handleRemoveAporte(index)} variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-200">
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
