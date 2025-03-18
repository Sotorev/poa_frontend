import type { EventFinishedRequest, EventFinishedResponse } from "@/components/poa/finalizacion/type.eventFinished"
import { getFullEvents } from "@/services/apiService"
import { ResponseExecutedEvent } from "@/types/eventExecution.type"
const API_URL = process.env.NEXT_PUBLIC_API_URL

// Función para obtener eventos disponibles para marcar como finalizados
// CUANDLO LA API ESTA LISTO HAY QUE MODIFICAR EL TIPO DE RESPUESTA
export async function getAvailableEventsToFinish(token: string, poaId: number): Promise<ResponseExecutedEvent[]> {
  try {
    const response = await fetch(`${API_URL}/api/fullexecution/fullexecution/poa/${poaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Error al obtener eventos disponibles")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener eventos disponibles:", error)
    throw error
  }
}

// Función para obtener eventos finalizados
export async function getFinishedEvents(token: string, poaId: number): Promise<EventFinishedResponse[]> {
  try {
    // const response = await fetch(`${API_URL}/api/events/finished`, {
    //   headers: {
    //     Authorization: `Bearer ${token}`,
    //   },
    // })

    const events = await getFullEvents(token, poaId)

    if (!events) throw new Error("No se encontraron eventos finalizados")

    const response = events.filter((event) => event.statusId === 3).map((event): EventFinishedResponse => {
      return {
        eventId: event.eventId,
        name: event.name,
        completionDate: event.dates.map(d => ({eventExecutionDateId: d.eventDateId, endDate: d.endDate})),
        evidenceDocuments: event.files.map((f) => {return{ documentId: f.fileId, fileName: f.fileName, fileId: f.fileId.toString(), fileUrl: f.filePath, uploadDate: f.uploadedAt}})
      }
    })

    if (!response) {
      throw new Error("Error al obtener eventos finalizados")
    }

    return response
  } catch (error) {
    console.error("Error al obtener eventos finalizados:", error)
    throw error
  }
}

// Función para marcar un evento como finalizado
export async function markEventAsFinished(event: EventFinishedRequest, token: string): Promise<EventFinishedResponse> {
  try {
    // Crear un FormData para enviar archivos
    // en la data enviar algo asi: 
/*     eventId: 51,
    eventExecutionDates: [
        {
          eventExecutionDateId: 1,
          endDate: "2024-01-15"
        }
      ]
    } */

    const eventExecutionDates = event.endDate.map((date) => ({
      eventExecutionDateId: date.eventExecutionDateId,
      endDate: date.endDate
    }))
    
    const data = {
      eventId: event.eventId,
      eventExecutionDates: eventExecutionDates
    }

    const formData = new FormData()
    formData.append("data", JSON.stringify(data))

    // Agregar documentos de prueba
    event.evidences.forEach((file, index) => {
      formData.append(`evidence`, file)
    })

    const response = await fetch(`${API_URL}/api/eventEvidence/evidenceexecution`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Error al marcar evento como finalizado")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al marcar evento como finalizado:", error)
    throw error
  }
}

// Función para editar un evento finalizado
export async function updateFinishedEvent(
  eventId: number,
  data: EventFinishedRequest,
  token: string,
): Promise<EventFinishedResponse> {
  try {
    // Crear un FormData para enviar archivos
    const formData = new FormData()
    formData.append("completionDate", JSON.stringify(data.endDate))

    // Agregar documentos de prueba
    data.evidences.forEach((file, index) => {
      formData.append(`evidence`, file)
    })

    const response = await fetch(`${API_URL}/api/events/${eventId}/finish`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Error al actualizar evento finalizado")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al actualizar evento finalizado:", error)
    throw error
  }
}

// Función para revertir un evento finalizado a "en ejecución"
export async function revertFinishedEvent(eventId: number, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/events/${eventId}/revert`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      throw new Error("Error al revertir evento finalizado")
    }
  } catch (error) {
    console.error("Error al revertir evento finalizado:", error)
    throw error
  }
}

// Función para descargar un documento de prueba
export async function downloadTestDocument(documentId: string, fileName: string, token: string): Promise<void> {
  try {
    const response = await fetch(`${API_URL}/api/documents/${documentId}/download`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Error al descargar documento")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (error) {
    console.error("Error al descargar documento:", error)
    throw error
  }
}

