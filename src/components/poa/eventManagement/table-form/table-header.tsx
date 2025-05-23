import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import React from 'react';
export function TableFormHeader() {
  return (
    <TableHeader className="bg-slate-100 sticky top-0 z-10">
      <TableRow>
        <TableHead className="px-16 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Nombre
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Indicador de Logro
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Objetivo del evento
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Objetivo estratégico
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Estrategias
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Intervenciones
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          ODS
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Fechas
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Responsables
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Campus
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Tipo de Compra
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Financiamiento
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Costo Total
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Recursos institucionales
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap border-r">
          Documentos de Costo
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap">
          Documentos de Proceso
        </TableHead>
        <TableHead className="px-4 py-3 text-left font-medium text-sm text-gray-700 whitespace-nowrap">
          Acciones
        </TableHead>
        </TableRow>
    </TableHeader>
  );
} 