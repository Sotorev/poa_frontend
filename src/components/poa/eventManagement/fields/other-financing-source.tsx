// src/components/poa/components/columns/umes-financing-source.tsx
'use client';

import React, { useState } from 'react';
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

const otherFinancingSourceSchema = z.object({
  financingSourceId: z.number({
    required_error: 'La fuente es requerida',
    invalid_type_error: 'La fuente debe ser un número',
  }),
  percentage: z
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

type OtherFinancingSourceForm = z.infer<typeof otherFinancingSourceSchema>;

interface OtherFinancingSource {
  financingSourceId: number;
  percentage: number;
  amount: number;
}

interface OtherFinancingSourceProps {
  contributions: OtherFinancingSource[];
  onChangeContributions: (contributions: OtherFinancingSource[]) => void;
  totalCost: number;
  financingSources: FinancingSource[]; // Nueva prop
}

export function OtherFinancingSourceComponent({
  contributions,
  onChangeContributions,
  totalCost,
  financingSources, // Usamos la nueva prop
}: OtherFinancingSourceProps) {
  const [isAdding, setIsAdding] = useState(false);
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OtherFinancingSourceForm>({
    resolver: zodResolver(otherFinancingSourceSchema),
    defaultValues: {
      financingSourceId: undefined,
      percentage: 0,
      amount: undefined,
    },
  });

  // Filtra aquí las fuentes de categoría "Otra"
  const filteredSources = financingSources.filter(
    (source) => source.category === 'Otra' && !source.isDeleted
  );

  const onSubmit = (data: OtherFinancingSourceForm) => {
    try {
      const newTotal = totalCost + data.amount;
      const percentage = (data.amount / newTotal) * 100;

      const newContribution: OtherFinancingSource = {
        financingSourceId: data.financingSourceId,
        percentage: percentage,
        amount: data.amount,
      };
      const newContributions = [...contributions, newContribution];
      onChangeContributions(newContributions);
      reset();
      setIsAdding(false);
    } catch (err) {
      console.error(err);
      alert(`Error al agregar el aporte: ${(err as Error).message}`);
    }
  };

  const handleRemoveAporte = (index: number) => {
    const newContributions = contributions.filter((_, i) => i !== index);
    onChangeContributions(newContributions);
  };

  return (
    <div className="space-y-4">
      {!isAdding && (
        <Button onClick={() => setIsAdding(true)} className="text-sm">
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
                  {filteredSources.map((source) => (
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
        {contributions.map((contribution, index) => {
          const fuente = filteredSources.find(source => source.financingSourceId === contribution.financingSourceId)?.name || contribution.financingSourceId;
          return (
            <div key={index} className="flex items-center justify-between bg-green-100 p-2 rounded-md">
              <span className="text-green-800">
                {fuente}: {contribution.percentage}% - Q{contribution.amount.toFixed(2)}
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
