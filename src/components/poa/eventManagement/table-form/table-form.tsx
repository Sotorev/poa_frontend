"use client"

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { createFullEventSchema } from '@/schemas/event-schema';
import { useState, useEffect, useContext } from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { EventRow } from './event-row';
import { TableFormHeader } from './table-header';
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody } from '@/components/ui/table';
import { useCurrentUser } from '@/hooks/use-current-user';
import { EventContext } from '../context.event';

type FormSchema = z.infer<typeof createFullEventSchema>;

// Define an empty event template - with proper types for validation
const emptyEvent: Partial<FormSchema> = {
  name: '',
  type: 'Actividad',
  objective: '',
  poaId: 1, // Default POA ID, should be updated with actual value
  campusId: 0,
  eventNature: 'Planificado',
  isDelayed: false,
  achievementIndicator: '',
  purchaseTypeId: 0,
  totalCost: 0,
  dates: [{
    startDate: undefined!,
    endDate: undefined!,
    statusId: 1,
    executionEndDate: null,
    executionStartDate: null
  }],
  responsibles: [{ responsibleRole: 'Principal', name: '' }],
  financings: [],
  resources: [],
  interventions: [], // Will be properly converted before submission
  ods: [], // Will be properly converted before submission
  userId: 1 // Default user ID, will be updated with actual user
};

function TableForm() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [costDetailFiles, setCostDetailFiles] = useState<File[]>([]);
  const [processFiles, setProcessFiles] = useState<File[]>([]);
  const [documentUploadResetKey, setDocumentUploadResetKey] = useState(0);
  const currentUser = useCurrentUser();
  const eventContext = useContext(EventContext);

  const form = useForm<FormSchema>({
    resolver: zodResolver(createFullEventSchema),
    defaultValues: {
      ...emptyEvent,
    } as FormSchema
  });

  useEffect(() => {
    form.setValue('poaId', eventContext.poaId || 1);
  }, [eventContext.poaId, form]);

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsSubmitting(true);
      
      // Derive type based on number of dates
      data.type = data.dates && data.dates.length > 1 ? 'Actividad' : 'Proyecto';

      // Create a mutable copy of the data to transform
      const dataToSubmit = { ...data };
      dataToSubmit.userId = currentUser?.userId || 1;
      dataToSubmit.poaId = eventContext.poaId || 1;

      // Create FormData
      const formData = new FormData();
      
      // Add JSON data
      formData.append('data', JSON.stringify(dataToSubmit));
      
      // Add file uploads
      costDetailFiles.forEach((file) => {
        formData.append('costDetailDocuments', file);
      });
      
      processFiles.forEach((file) => {
        formData.append('processDocuments', file);
      });
    
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al enviar los datos del evento');
      }
      
      // Handle success
      toast({
        title: 'Éxito',
        description: 'El evento se ha guardado correctamente.',
      });
      
      // Reset form and state
      form.reset(emptyEvent as FormSchema);
      setCostDetailFiles([]);
      setProcessFiles([]);
      setDocumentUploadResetKey(prevKey => prevKey + 1);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al guardar el evento',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCostDetailFiles = (files: File[]) => {
    setCostDetailFiles(files);
  };

  const handleProcessFiles = (files: File[]) => {
    setProcessFiles(files);
  };

  return (
    <div className="w-full overflow-x-auto">      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="border rounded-md">
            <div className="bg-slate-50 p-4 sticky top-0 z-10">
              <h2 className="text-lg font-semibold">Registro de Evento</h2>
              <p className="text-sm text-gray-500">Complete los datos del evento</p>
            </div>
            
            <div className="overflow-x-auto">
              <Table className="w-full min-w-[1200px]">
                <TableFormHeader />
                <TableBody>
                  <EventRow 
                    form={form}
                    index={0}
                    onCostDetailFilesChange={handleCostDetailFiles}
                    onProcessFilesChange={handleProcessFiles}
                    documentUploadResetKey={documentUploadResetKey}
                  />
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 flex justify-end">
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="ml-2"
              >
                {isSubmitting ? 'Guardando...' : 'Guardar Evento'}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}

export { TableForm }