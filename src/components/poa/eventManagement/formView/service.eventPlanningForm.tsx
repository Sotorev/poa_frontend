// src/components/poa/eventManagement/formView/eventPlanningForm.service.tsx

// Types
import { StrategicObjective } from '@/types/StrategicObjective';
import { StrategicArea } from '@/types/StrategicArea';
import { Strategy } from '@/types/Strategy';
import { Intervention } from '@/types/Intervention';
import { ODS } from '@/types/ods';
import { Resource } from '@/types/Resource';
import { Campus } from '@/types/Campus';
import { PurchaseType } from '@/types/PurchaseType';
import { Poa } from '@/types/Poa';
import { ResponseFullEvent } from './type.eventPlanningForm';
import { FullEventRequest, UpdateEventRequest } from './schema.eventPlanningForm';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getFullEvents(token: string): Promise<ResponseFullEvent[]> {
  const response = await fetch(`${API_URL}/api/events`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener eventos: ${response.statusText}`);
  }

  return response.json();
}

export async function getStrategicObjectives(token: string): Promise<StrategicObjective[]> {
  const response = await fetch(`${API_URL}/api/strategicobjectives`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener objetivos estratégicos: ${response.statusText}`);
  }

  return response.json();
}

export async function getStrategicAreas(token: string): Promise<StrategicArea[]> {
  const response = await fetch(`${API_URL}/api/strategicareas`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener áreas estratégicas: ${response.statusText}`);
  }
  return response.json();
}

export async function getStrategies(token: string): Promise<Strategy[]> {
  const response = await fetch(`${API_URL}/api/strategies`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener estrategias: ${response.statusText}`);
  }

  const data: Strategy[] = await response.json();

  return data;
}

export async function getInterventions(token: string): Promise<Intervention[]> {
  const response = await fetch(`${API_URL}/api/interventions`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener intervenciones: ${response.statusText}`);
  }

  const data: Intervention[] = await response.json();

  return data;
}

export async function getODS(token: string): Promise<ODS[]> {
  const response = await fetch(`${API_URL}/api/ods`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener ODS: ${response.statusText}`);
  }

  return response.json();
}

export async function getResources(token: string): Promise<Resource[]> {
  const response = await fetch(`${API_URL}/api/institutionalResources`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener recursos: ${response.statusText}`);
  }

  return response.json();
}

export async function getCampuses(token: string): Promise<Campus[]> {
  const response = await fetch(`${API_URL}/api/campus/`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener campus: ${response.statusText}`);
  }

  return response.json();
}

export async function getPurchaseTypes(token: string): Promise<PurchaseType[]> {
  const response = await fetch(`${API_URL}/api/purchasetypes`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener tipos de compra: ${response.statusText}`);
  }

  return response.json();
}

export async function getPoaByFacultyAndYear(facultyId: number, year: number, token: string): Promise<Poa> {
  const response = await fetch(`${API_URL}/api/poas/${facultyId}/${year}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener POA: ${response.statusText}`);
  }
  return response.json();
}

// Función auxiliar para descargar y convertir archivos a objetos File
export const downloadFileAux = async (url: string, nombreArchivo: string, token: string): Promise<File | null> => {
    try {
      const response = await fetch(`${API_URL}${url}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        return null;
      }
      const blob = await response.blob();
      // Inferir el tipo de archivo desde el blob
      const tipo = blob.type || 'application/octet-stream';
      return new File([blob], nombreArchivo, { type: tipo });
    } catch (error) {
      return null;
    }
  };

/**
 * Función auxiliar para formatear los datos del evento antes de enviarlos al backend
 * @param eventData Datos del evento a formatear
 * @returns Datos formateados para el backend
 */
const formatEventData = (eventData: FullEventRequest, isPlanned: boolean) => {
  // Transformamos los datos al nuevo formato
  const { processDocuments, costDetailDocuments, ...restData } = eventData;
  
  const formattedData = {
    ...restData,
    interventions: eventData.interventions.map(i => i.intervention),
    ods: eventData.ods.map(o => o.ods),
    resources: eventData.resources ? eventData.resources.map(r => ({ resourceId: r.resourceId })) : [],
    // Agregar naturaleza del evento si esta planificado o es extraordinario
    eventNature: isPlanned ? 'Planificado' : 'Extraordinario',
    isDelayed: eventData.isDelayed || false,
    statusId: eventData.statusId || 1
  };

  return formattedData;
};

/**
 * Crea un nuevo evento en el sistema
 * @param eventData Datos del evento a crear
 * @param token Token de autenticación
 * @returns Respuesta del servidor con los datos del evento creado
 */
export async function createEvent(eventData: FullEventRequest, token: string): Promise<ResponseFullEvent> {
  if (!API_URL) {
    throw new Error("La URL de la API no está definida.");
  }

  const url = `${API_URL}/api/fullEvent/`;
  const formattedData = formatEventData(eventData, true);
  const formData = new FormData();

  // Agregar los datos del evento como JSON string

  formData.append('data', JSON.stringify(formattedData));
  // Agregar documentos de detalle de costos
  if (eventData?.costDetailDocuments) {
    eventData.costDetailDocuments.forEach((file: File) => {
      formData.append('costDetailDocuments', file);
    });
  }
  // Agregar documentos de proceso
  if (eventData.processDocuments) {
    eventData.processDocuments.forEach((file: File) => {
      formData.append('processDocuments', file);
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al crear el evento: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Actualiza un evento existente en el sistema
 * @param eventId ID del evento a actualizar
 * @param eventData Datos actualizados del evento
 * @param token Token de autenticación
 * @returns Respuesta del servidor con los datos actualizados
 */
export async function updateEvent(eventId: number, eventData: FullEventRequest, token: string): Promise<ResponseFullEvent> {
  if (!API_URL) {
    throw new Error("La URL de la API no está definida.");
  }

  const url = `${API_URL}/api/fullevent/${eventId}`;
  const formattedData = formatEventData(eventData, true);
  const formData = new FormData();

  // Agregar los datos del evento como JSON string
  formData.append('data', JSON.stringify(formattedData));
  // Agregar documentos de detalle de costos si existen y no están vacíos
  if (eventData.costDetailDocuments && eventData.costDetailDocuments.length > 0) {
    eventData.costDetailDocuments.forEach((file: File, index: number) => {
      if (index < 10) { // Máximo 10 archivos
        formData.append('costDetailDocuments', file);
      }
    });
  }
  // Agregar documentos de proceso si existen y no están vacíos
  if (eventData.processDocuments && eventData.processDocuments.length > 0) {
    eventData.processDocuments.forEach((file: File, index: number) => {
      if (index < 10) { // Máximo 10 archivos
        formData.append('processDocuments', file);
      }
    });
  }

  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al actualizar el evento: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Elimina un evento del sistema
 * @param eventId ID del evento a eliminar
 * @param token Token de autenticación
 * @returns Respuesta del servidor
 */
export async function deleteEvent(eventId: number, token: string): Promise<any> {
  if (!API_URL) {
    throw new Error("La URL de la API no está definida.");
  }

  const url = `${API_URL}/api/fullevent/${eventId}`;
  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al eliminar el evento: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}

/**
 * Obtiene un evento específico por su ID
 * @param eventId ID del evento a obtener
 * @param token Token de autenticación
 * @returns Datos completos del evento
 */
export async function getEventById(eventId: number, token: string): Promise<ResponseFullEvent> {
  if (!API_URL) {
    throw new Error("La URL de la API no está definida.");
  }

  const url = `${API_URL}/api/fullevent/${eventId}`;
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al obtener el evento: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}