// src/services/apiService.ts

import { FinancingSource } from '@/types/FinancingSource';
import { Campus } from '@/types/Campus';
import { Strategy } from '@/types/Strategy';
import { Intervention } from '@/types/Intervention';
import { ODS } from '@/types/ods';
import { Resource } from '@/types/Resource';
import { PurchaseType } from '@/types/PurchaseType';
import { StrategicObjective } from '@/types/StrategicObjective';
import { StrategicArea } from '@/types/StrategicArea';
import { User } from '@/types/User';
import { Poa } from '@/types/Poa';
import { ApiEvent } from '@/types/interfaces';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// **Funciones Existentes**

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

export async function getEstrategias(token: string): Promise<Strategy[]> {
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

export async function getIntervenciones(token: string): Promise<Intervention[]> {
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

export async function getTiposDeCompra(token: string): Promise<PurchaseType[]> {
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

export async function createPurchaseType(token: string, purchaseTypeData: Omit<PurchaseType, 'purchaseTypeId'>): Promise<PurchaseType> {
  const response = await fetch(`${API_URL}/api/purchasetypes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(purchaseTypeData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Error al crear el tipo de compra');
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

// **Nuevas Funciones Agregadas**

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

export async function getUserById(userId: number, token: string): Promise<User> {
  const response = await fetch(`${API_URL}/api/users/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`Error al obtener datos del usuario: ${response.statusText}`);
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

export async function createFullEvent(formData: FormData, token: string): Promise<any> {
  const response = await fetch(`${API_URL}/api/fullEvent`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al crear el evento: ${response.statusText}`);
  }

  return response.json();
}

export async function getFullEvents(token: string): Promise<ApiEvent[]> {
  const response = await fetch(`${API_URL}/api/fullevent/`, {
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

export async function deleteEvent(eventId: number, token: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/fullevent/${eventId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Error al eliminar el evento: ${response.statusText}`);
  }
}
