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
import { FinancingSource } from '@/types/FinancingSource';

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

export async function getFinancingSources(token: string): Promise<FinancingSource[]> {
  const response = await fetch(`${API_URL}/api/financingSource`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener fuentes de financiamiento: ${response.statusText}`);
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

export async function getFacultyByUserId(userId: number, token: string): Promise<number> {
  // Fetch User Data
  const responseUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, { 
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
   });
  if (!responseUser.ok) throw new Error(`Error al obtener datos del usuario: ${responseUser.statusText}`);
  const dataUser = await responseUser.json();
  return dataUser.facultyId;
}

export async function getPoaByFacultyAndYear(facultyId: number, token: string, year: number): Promise<Poa> {

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
export const downloadFileAux = async (url: string, nombreArchivo: string, token: string): Promise<File> => {
  try {
    const response = await fetch(`${API_URL}${url}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.statusText}`);
    }
    const blob = await response.blob();
    // Inferir el tipo de archivo desde el blob
    const tipo = blob.type || 'application/octet-stream';
    return new File([blob], nombreArchivo, { type: tipo });
  } catch (error) {
    throw new Error(`Error al descargar el archivo: ${error}`);
  }
};

/**
 * Función auxiliar para formatear los datos del evento antes de enviarlos al backend
 * @param eventData Datos del evento a formatear (puede ser parcial en caso de actualización)
 * @param isPlanned Indica si el evento es planificado
 * @returns Datos formateados para el backend
 */
const formatEventData = (eventData: Partial<FullEventRequest>, isPlanned: boolean) => {
  // Transformamos los datos al nuevo formato
  const { processDocuments, costDetailDocuments, ...restData } = eventData;

  // Objeto base con los datos parciales
  const formattedData: any = {
    ...restData
  };

  // Solo incluir propiedades si existen en el objeto original
  if (eventData.interventions) {
    formattedData.interventions = eventData.interventions.map(i => i.intervention);
  }
  
  if (eventData.ods) {
    formattedData.ods = eventData.ods.map(o => o.ods);
  }
  
  if (eventData.resources) {
    formattedData.resources = eventData.resources.map(r => ({ resourceId: r.resourceId }));
  }
  
  // Agregar naturaleza del evento solo si no está ya definida
  if (eventData.eventNature === undefined) {
    formattedData.eventNature = isPlanned ? 'Planificado' : 'Extraordinario';
  }
  
  // Asignar valores por defecto solo si no existen en los datos originales
  if (eventData.isDelayed === undefined) {
    formattedData.isDelayed = false;
  }
  
  if (eventData.statusId === undefined) {
    formattedData.statusId = 1;
  }
  
  

  // Formatear archivos solo si están definidos
  if (processDocuments) {
    formattedData.files = processDocuments.map(p => ({ fileId: p.fileId, isDeleted: p.isDeleted }));
  }
  
  if (costDetailDocuments) {
    formattedData.costDetails = costDetailDocuments.map(c => ({ costDetailId: c.costDetailId, isDeleted: c.isDeleted }));
  }

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
    eventData.costDetailDocuments.forEach((file: {file?: File, isDeleted?: boolean, costDetailId?: number}) => {
      if (file.file) {
        formData.append('costDetailDocuments', file.file);
      }
    });
  }
  // Agregar documentos de proceso
  if (eventData.processDocuments) {
    eventData.processDocuments.forEach((file: {file?: File, isDeleted?: boolean, fileId?: number}) => {
      if (file.file) {
        formData.append('processDocuments', file.file);
      }
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
 * @param eventData Datos actualizados del evento (puede ser parcial, solo con los campos modificados)
 * @param token Token de autenticación
 * @returns Respuesta del servidor con los datos actualizados
 */
export async function updateEvent(eventId: number, eventData: Partial<FullEventRequest>, token: string): Promise<ResponseFullEvent> {
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
    eventData.costDetailDocuments.forEach((file: {file?: File, isDeleted?: boolean, costDetailId?: number}, index: number) => {
      if (index < 10) {
        if (!file.isDeleted && file.file) {
          formData.append('costDetailDocuments', file.file);
        }
      }
    });
  }
  
  // Agregar documentos de proceso si existen y no están vacíos
  if (eventData.processDocuments && eventData.processDocuments.length > 0) {
    eventData.processDocuments.forEach((file: {file?: File, isDeleted?: boolean, fileId?: number}, index: number) => {
      if (index < 10) {
        if (!file.isDeleted && file.file) {
          formData.append('processDocuments', file.file);
        }
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

/**
 * Obtiene el estado de aprobación del POA
 * @param poaId ID del POA
 * @param token Token de autenticación
 * @returns Estado de aprobación del POA
 */
export async function getPoaApprovalStatus(poaId: number, token: string): Promise<boolean> {
  if (!API_URL) {
    throw new Error("La URL de la API no está definida.");
  }

  const response = await fetch(`${API_URL}/api/poas/status/${poaId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Error al obtener el estado de aprobación del POA.');
  }

  const data = await response.json();
  return data.isApproved;
}