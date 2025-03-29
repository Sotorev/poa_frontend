import { CreateEvidenceRequest, CreateUpdateEvidenceResponse, EventFinishedResponse, RestoreEvidenceRequest, RestoreEvidenceResponse, UpdateEvidenceRequest } from "./type.eventFinished"

const API_URL = process.env.NEXT_PUBLIC_API_URL

export async function getEventFinished(token: string): Promise<EventFinishedResponse> {
  const url = `${API_URL}/api/eventEvidence/events-with-evidences`
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



