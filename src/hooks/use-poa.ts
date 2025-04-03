"use client";

import { usePoa as usePoaContext } from "@/contexts/PoaContext";

/**
 * Hook para acceder al contexto del POA actual
 * Proporciona acceso al ID del POA, el objeto completo del POA,
 * el estado de carga, errores y la funcionalidad para cambiar el año
 */
export const usePoa = () => {
  return usePoaContext();
};

export default usePoa; 