'use client'

import { useState, useEffect } from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, X, Search } from 'lucide-react'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Types
import { ApiEvent } from '@/types/interfaces'

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 5MB

const formSchema = z.object({
  eventId: z.string({
    required_error: "Debe seleccionar un evento",
  }),
  eventName: z.string({
    required_error: "El nombre del evento es requerido",
  }),
  actualExpenses: z.string().min(1, {
    message: "El gasto real es requerido",
  }),
  executionDate: z.date({
    required_error: "La fecha de ejecución es requerida",
  }),
  files: z.array(z.instanceof(File)).optional(),
})

type PoaEventTrackingFormProps = {
  events: ApiEvent[];
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  initialData?: z.infer<typeof formSchema>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function PoaEventTrackingForm({ events, onSubmit, initialData, open, onOpenChange }: PoaEventTrackingFormProps) {
  const [query, setQuery] = useState('')
  const [searchDate, setSearchDate] = useState<Date | undefined>(undefined)
  const [files, setFiles] = useState<File[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<ApiEvent[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      eventId: "",
      eventName: "",
      actualExpenses: "",
      executionDate: undefined,
      files: [],
    },
  })

  const resetForm = () => {
    form.reset({
      eventId: "",
      eventName: "",
      actualExpenses: "",
      executionDate: undefined,
      files: [],
    });
    setQuery('');
    setSearchDate(undefined);
    setFiles([]);
  };

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset(initialData);
        setQuery(initialData.eventName);
        setSearchDate(initialData.executionDate);
        setFiles(initialData.files || []);
      } else {
        resetForm();
      }
    }
  }, [open, initialData, form]);

  useEffect(() => {
    if (events) {
      const filtered = events.filter((event) => {
        const matchesQuery = event.name.toLowerCase().includes(query.toLowerCase());
        const matchesDate = !searchDate || (event.dates && event.dates.some(date => {
          const startDate = new Date(date.startDate);
          const endDate = new Date(date.endDate);
          return searchDate >= startDate && searchDate <= endDate;
        }));
        return matchesQuery && matchesDate;
      });
      setFilteredEvents(filtered);
    } else {
      setFilteredEvents([]);
    }
  }, [query, searchDate, events]);

  function handleSubmit(values: z.infer<typeof formSchema>) {
    onSubmit(values);
    onOpenChange(false);
  }

  const handleEventSelect = (event: ApiEvent) => {
    form.setValue('eventId', event.eventId.toString());
    form.setValue('eventName', event.name);
    setQuery(event.name);
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm();
        }
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] p-4 sm:p-6 md:p-8">
        <DialogHeader className="space-y-2 sm:space-y-3">
          <DialogTitle className="text-lg sm:text-xl md:text-2xl">
            Seguimiento de Evento POA
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Complete los detalles del seguimiento del evento POA
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3 sm:space-y-4">
            <FormField
              control={form.control}
              name="eventName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Evento</FormLabel>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Input
                        placeholder="Buscar un evento..."
                        value={query}
                        onChange={(e) => {
                          setQuery(e.target.value);
                          field.onChange(e.target.value);
                        }}
                        className="pr-8"
                      />
                      <Search className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          className={cn(
                            "h-9 w-9 shrink-0",
                            searchDate && "text-primary"
                          )}
                        >
                          <CalendarIcon className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                          mode="single"
                          selected={searchDate}
                          onSelect={setSearchDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  {searchDate && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Fecha seleccionada: {format(searchDate, "PPP", { locale: es })}
                    </p>
                  )}
                  {filteredEvents.length > 0 && query && (
                    <ul className="mt-1 border rounded-md divide-y max-h-32 overflow-y-auto">
                      {filteredEvents.map((event) => (
                        <li
                          key={event.eventId}
                          className="p-2 text-sm hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEventSelect(event)}
                        >
                          {event.name}
                        </li>
                      ))}
                    </ul>
                  )}
                  <FormDescription className="text-xs">
                    Busque y seleccione el evento al que desea dar seguimiento
                  </FormDescription>
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <FormField
                control={form.control}
                name="actualExpenses"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Gastos Reales</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-2.5 top-2 text-sm text-muted-foreground">Q</span>
                        <Input
                          placeholder="0.00"
                          type="number"
                          step="0.01"
                          className="pl-6"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription className="text-xs">
                      Ingrese el monto real gastado en la ejecución del evento
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="executionDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium">Fecha de Ejecución</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-9",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP", { locale: es })
                            ) : (
                              <span>Seleccione una fecha</span>
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
                          locale={es}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription className="text-xs">
                      Seleccione la fecha en que se ejecutó el evento
                    </FormDescription>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="files"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium">Evidencias</FormLabel>
                  <FormControl>
                    <Input
                      id="evidence"
                      type="file"
                      className="cursor-pointer h-9"
                      onChange={(e) => {
                        const newFiles = e.target.files
                          ? Array.from(e.target.files).filter(file => file.size <= MAX_FILE_SIZE)
                          : [];
                        setFiles(prevFiles => [...prevFiles, ...newFiles]);
                        field.onChange([...files, ...newFiles]);
                      }}
                      multiple
                    />
                  </FormControl>
                  <FormDescription className="text-xs">
                    Suba documentos, fotos o archivos que evidencien la ejecución del evento (máximo 5MB por archivo)
                  </FormDescription>
                  {files.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted px-2 py-1 rounded text-sm">
                          <span className="truncate text-xs">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7"
                            onClick={() => {
                              const updatedFiles = files.filter((_, i) => i !== index);
                              setFiles(updatedFiles);
                              field.onChange(updatedFiles);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  <FormMessage className="text-xs" />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="sm:w-auto"
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                className="sm:w-auto"
              >
                {initialData ? 'Actualizar Seguimiento' : 'Guardar Seguimiento'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

