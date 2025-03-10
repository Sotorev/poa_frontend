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
import { ResponseFullEvent } from './eventPlanningForm.type';

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