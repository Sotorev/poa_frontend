import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { createFullEventSchema } from '@/schemas/event-schema';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type FormSchema = z.infer<typeof createFullEventSchema>;

interface EventResponsiblesProps {
  form: UseFormReturn<FormSchema>;
}

export function EventResponsibles({ form }: EventResponsiblesProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'responsibles'
  });

  const handleAddResponsible = () => {
    append({ 
      responsibleRole: 'Principal',
      name: '' 
    });
  };

  return (
    <div className="space-y-3">
      {fields.map((field, index) => (
        <div key={field.id} className="border rounded p-2 bg-white space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Responsable {index + 1}</span>
            {fields.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => remove(index)}
              >
                <TrashIcon className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Name */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Nombre</label>
            <FormField
              control={form.control}
              name={`responsibles.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input autoComplete="off"  placeholder="Nombre del responsable" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Rol</label>
            <FormField
              control={form.control}
              name={`responsibles.${index}.responsibleRole`}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Principal">Principal</SelectItem>
                        <SelectItem value="Ejecución">Ejecución</SelectItem>
                        <SelectItem value="Seguimiento">Seguimiento</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}

      {fields.length < 5 && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full text-xs"
          onClick={handleAddResponsible}
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Agregar Responsable
        </Button>
      )}
    </div>
  );
} 