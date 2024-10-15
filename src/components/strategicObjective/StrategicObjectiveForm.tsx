// components/StrategicObjectiveForm.tsx
'use client';

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StrategicObjectiveSchema, StrategicObjective } from "@/schemas/strategicObjectiveSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";

type FormData = Omit<StrategicObjective, 'strategicObjectiveId' | 'isDeleted'>;

interface StrategicObjectiveFormProps {
  onSuccess: (newObjetivo: StrategicObjective) => void;
}

export const StrategicObjectiveForm: React.FC<StrategicObjectiveFormProps> = ({ onSuccess }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(
      StrategicObjectiveSchema.omit({ strategicObjectiveId: true, isDeleted: true })
    ),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicobjectives`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: data.description,
          strategicAreaId: data.strategicAreaId,
          isDeleted: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const createdObjetivo: StrategicObjective = await response.json();
      reset();
      onSuccess(createdObjetivo);
    } catch (error) {
      console.error("Error al agregar el objetivo estratégico:", error);
      // Aquí puedes agregar manejo de errores más sofisticado, como mostrar una notificación al usuario.
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="description" className="block text-sm font-medium">Descripción</label>
        <Input id="description" {...register("description")} />
        {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
      </div>
      
      <div>
        <label htmlFor="strategicAreaId" className="block text-sm font-medium">Área Estratégica ID</label>
        <Input 
          type="number" 
          id="strategicAreaId" 
          {...register("strategicAreaId", { valueAsNumber: true })} 
        />
        {errors.strategicAreaId && <p className="text-red-500 text-sm">{errors.strategicAreaId.message}</p>}
      </div>

      <Button type="submit">Agregar Objetivo Estratégico</Button>
    </form>
  );
};
