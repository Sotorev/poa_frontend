import { CreateEvidenceRequest, CreateUpdateEvidenceResponse, EventFinishedResponse, RestoreEvidenceRequest, RestoreEvidenceResponse, UpdateEvidenceRequest } from "./type.eventFinished"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getEventFinished(poaId: number, token: string): Promise<EventFinishedResponse> {
  const url = `${API_URL}/api/eventEvidence/poa/${poaId}/events-with-evidences`
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Error al obtener el evento: ${errorData.message || response.statusText}`);
  }

  return await response.json();
}
export const createEvidence = async (evidence: CreateEvidenceRequest, token: string): Promise<CreateUpdateEvidenceResponse> => {
  // Parsear a formData
  const formData = new FormData()
  formData.append('data', JSON.stringify(evidence.data))
  evidence.evidence.forEach((file) => {
    formData.append('evidence', file)
  })

  // Enviar a la API
  const response = await fetch(`${API_URL}/api/eventEvidence/evidenceexecution`, {
    method: "POST",
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return response.json()
}

export const updateEvidence = async (evidence: UpdateEvidenceRequest, token: string): Promise<CreateUpdateEvidenceResponse> => {
  // Parsear a formData
  const formData = new FormData()
  formData.append('data', JSON.stringify(evidence.data))
  evidence.evidence.forEach((file) => {
    formData.append('evidence', file)
  })

  // Enviar a la API
  const response = await fetch(`${API_URL}/api/eventEvidence/evidenceexecution`, {
    method: "PUT",
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  return response.json()
}

export const restoreEvidence = async (evidence: RestoreEvidenceRequest, token: string): Promise<RestoreEvidenceResponse> => {
  const response = await fetch(`${API_URL}/api/eventEvidence/reset-event`, {
    method: "POST",
    body: JSON.stringify(evidence),
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  return response.json()
}

export const downloadEvidence = async (evidenceId: number, fileName: string, token: string): Promise<void> => {
  const response = await fetch(`${API_URL}/api/eventEvidence/evidences/${evidenceId}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Error al descargar evidencia');
  }
  
  // Convertir la respuesta a blob
  const blob = await response.blob();
  
  // Crear URL para el blob
  const url = window.URL.createObjectURL(blob);
  
  // Crear un elemento de enlace temporal
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  
  // Añadir al DOM, disparar click para abrir diálogo de guardado y limpiar
  document.body.appendChild(a);
  a.click();
  
  // Esperar un poco antes de limpiar para asegurar que el diálogo de descarga se abra
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, 100);
}; 



