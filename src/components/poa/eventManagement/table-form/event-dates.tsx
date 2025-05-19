import React from 'react';
import { UseFormReturn, useFieldArray } from 'react-hook-form';
import { z } from 'zod';
import { createFullEventSchema } from '@/schemas/event-schema';
import { FormField, FormItem, FormControl, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';

type FormSchema = z.infer<typeof createFullEventSchema>;

interface EventDatesProps {
  form: UseFormReturn<FormSchema>;
}

export function EventDates({ form }: EventDatesProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'dates',
  });
  const handleAddDate = () => {
    append({ startDate: undefined!, endDate: undefined!, statusId: 1, executionStartDate: null, executionEndDate: null });
  };

  return (
    <div className="space-y-3">
      {/* Event type indicator */}
		  <Badge variant={fields.length === 1 ? 'default' : 'default'}>
        {fields.length === 1 ? 'Proyecto' : 'Actividad'}
      </Badge>
      {fields.map((field, index) => (
        <div key={field.id} className="border rounded p-2 bg-white space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium">Fecha {index + 1}</span>
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

          {/* Start Date */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Fecha de Inicio</label>
            <FormField
              control={form.control}
              name={`dates.${index}.startDate`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            form.formState.errors.dates?.[index]?.startDate && "border-destructive"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <label className="text-xs text-gray-500">Fecha de Fin</label>
            <FormField
              control={form.control}
              name={`dates.${index}.endDate`}
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground",
                            form.formState.errors.dates?.[index]?.endDate && "border-destructive"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: es })
                          ) : (
                            <span>Seleccionar fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
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
          onClick={handleAddDate}
        >
          <PlusIcon className="h-3 w-3 mr-1" />
          Agregar Fecha
        </Button>
      )}
    </div>
  );
} 