// src/components/poa/components/columns/ods-selector.tsx
'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, X, Check, Plus } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { ODS } from '@/types/ods';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getODS } from '@/services/apiService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Definir el esquema para la creación de ODS
export const createOdsSchema = z.object({
  name: z.string().min(1, 'El nombre del ODS es requerido'),
  description: z.string().optional().nullable(),
  isDeleted: z.boolean().optional(),
  colorHex: z.string().optional().nullable(),
  sortNo: z.number().optional().nullable(),
});

type CreateOdsForm = z.infer<typeof createOdsSchema>;

interface OdsSelectorProps {
  selectedODS: string[];
  onSelectODS: (ods: string[]) => void;
}

export function OdsSelector({ selectedODS, onSelectODS }: OdsSelectorProps) {
  const [odsList, setOdsList] = useState<ODS[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const user = useCurrentUser();

  // Configurar react-hook-form para agregar nuevos ODS
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateOdsForm>({
    resolver: zodResolver(createOdsSchema),
    defaultValues: {
      name: '',
      description: null,
      isDeleted: false,
      colorHex: null,
      sortNo: null,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getODS(user?.token || '');
        // Filtrar ODS no eliminados y ordenar por sortNo si está presente
        const activeODS = data.filter((ods) => !ods.isDeleted);
        activeODS.sort((a, b) => {
          if (a.sortNo !== null && b.sortNo !== null) {
            return (a.sortNo ?? 0) - (b.sortNo ?? 0);
          }
          return a.odsId - b.odsId; // Fallback a odsId si sortNo no está presente
        });
        setOdsList(activeODS);
      } catch (error) {
        console.error('Error al obtener ODS:', error);
        setError('No se pudieron cargar los ODS.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.token]);

  const filteredODS = useMemo(() => {
    return odsList.filter((ods) =>
      ods.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [odsList, searchTerm]);

  const handleSelectODS = (odsId: string) => {
    const updatedODS = selectedODS.includes(odsId)
      ? selectedODS.filter((id) => id !== odsId)
      : [...selectedODS, odsId];
    onSelectODS(updatedODS);
  };

  const handleRemoveODS = (odsId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const updatedODS = selectedODS.filter((id) => id !== odsId);
    onSelectODS(updatedODS);
  };

  // const onSubmit = async (data: CreateOdsForm) => {
  //   try {
  //     const odsData: ODSCreateInput = {
  //       name: data.name,
  //       description: data.description,
  //       isDeleted: data.isDeleted,
  //       colorHex: data.colorHex,
  //       sortNo: data.sortNo,
  //     };
  //     const newOds = await createODS(user?.token || '', odsData);
  //     setOdsList((prev) => [...prev, newOds].sort((a, b) => {
  //       if (a.sortNo !== null && b.sortNo !== null) {
  //         return a.sortNo - b.sortNo;
  //       }
  //       return a.odsId - b.odsId;
  //     }));
  //     onSelectODS([...selectedODS, newOds.odsId.toString()]);
  //     reset();
  //     setIsAddingNew(false);
  //   } catch (error) {
  //     console.error('Error al crear ODS:', error);
  //     setError('No se pudo crear el nuevo ODS.');
  //   }
  // };

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isAddingNew && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isAddingNew]);

  if (loading) return <div className="text-green-600">Cargando ODS...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-2">
      {/* Mostrar ODS seleccionados */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedODS.map((id) => {
          const ods = odsList.find((o) => o.odsId.toString() === id);
          if (!ods) return null;
          return (
            <TooltipProvider key={ods.odsId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: ods.colorHex || '#808080', color: 'white' }}
                  >
                    <span>{ods.odsId}</span>
                    <button
                      className="ml-1 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveODS(ods.odsId.toString(), e)}
                      aria-label={`Eliminar ${ods.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{ods.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Selector de ODS */}
      <Select
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setSearchTerm('');
          }
        }}
        onValueChange={handleSelectODS}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona ODS" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar ODS..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredODS.map((ods) => (
                <SelectItem
                  key={ods.odsId}
                  value={ods.odsId.toString()}
                  className="flex items-center hover:bg-gray-100"
                >
                  <Checkbox
                    checked={selectedODS.includes(ods.odsId.toString())}
                    onCheckedChange={() => handleSelectODS(ods.odsId.toString())}
                    className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                    style={{
                      borderColor: ods.colorHex || '#808080',
                      backgroundColor: selectedODS.includes(ods.odsId.toString()) ? ods.colorHex || '#808080' : 'transparent',
                    }}
                  />
                  <div
                    className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: ods.colorHex || '#808080' }}
                  >
                    {ods.odsId}
                  </div>
                  {ods.name}
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>

      {/* Agregar nuevo ODS
      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex items-center space-x-2">
            <Input
              placeholder="Nuevo ODS..."
              {...register('name')}
              className={`h-8 w-[240px] border ${
                errors.name ? 'border-red-500' : 'border-green-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            <Input
              placeholder="Color Hex (#000000)"
              {...register('colorHex')}
              className={`h-8 w-24 border ${
                errors.colorHex ? 'border-red-500' : 'border-green-300'
              } focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent`}
            />
            <Button
              type="submit"
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsAddingNew(false);
                reset();
              }}
              size="sm"
              variant="ghost"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button
            type="button"
            onClick={() => setIsAddingNew(true)}
            size="sm"
            variant="ghost"
            className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 px-0"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar nuevo ODS
          </Button>
        )}
      </div> */}

      {/* Mostrar errores de validación */}
      {error && (
        <span className="text-red-500 text-sm">{error}</span>
      )}
      {errors.name && (
        <span className="text-red-500 text-sm">{errors.name.message}</span>
      )}
      {errors.colorHex && (
        <span className="text-red-500 text-sm">{errors.colorHex.message}</span>
      )}
    </div>
  );
}
