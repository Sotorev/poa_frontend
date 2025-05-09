"use client";

import React, { useContext } from 'react';
import { PoaContext } from '@/contexts/PoaContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export const PoaInfo = () => {
  const { poa, poaId, loading, error, selectedYear } = useContext(PoaContext);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-[80%] mb-2" />
          <Skeleton className="h-4 w-[60%]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!poa) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No hay POA disponible</AlertTitle>
        <AlertDescription>
          No se encontró un POA para el año {selectedYear}. Por favor seleccione otro año o contacte al administrador.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>POA {selectedYear}</CardTitle>
        <CardDescription>ID: {poaId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Estado:</strong> {poa.status || 'No definido'}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default PoaInfo; 