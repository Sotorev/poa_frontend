import type { EventFinishedRequest, EventFinishedResponse, EventToFinish } from "@/components/poa/finalizacion/type.eventFinished"

// Función para obtener eventos disponibles para marcar como finalizados
export async function getAvailableEventsToFinish(token: string): Promise<EventToFinish[]> {
  try {
    const response = await fetch("/api/events/available", {
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
export async function getFinishedEvents(token: string): Promise<EventFinishedResponse[]> {
  try {
    const response = await fetch("/api/events/finished", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Error al obtener eventos finalizados")
    }

    return await response.json()
  } catch (error) {
    console.error("Error al obtener eventos finalizados:", error)
    throw error
  }
}

// Función para marcar un evento como finalizado
export async function markEventAsFinished(data: EventFinishedRequest, token: string): Promise<EventFinishedResponse> {
  try {
    // Crear un FormData para enviar archivos
    const formData = new FormData()
    formData.append("eventId", data.eventId.toString())
    formData.append("completionDate", data.completionDate)

    // Agregar documentos de prueba
    data.testDocuments.forEach((file, index) => {
      formData.append(`testDocuments`, file)
    })

    const response = await fetch("/api/events/finish", {
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
    formData.append("completionDate", data.completionDate)

    // Agregar documentos de prueba
    data.testDocuments.forEach((file, index) => {
      formData.append(`testDocuments`, file)
    })

    const response = await fetch(`/api/events/${eventId}/finish`, {
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
    const response = await fetch(`/api/events/${eventId}/revert`, {
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
    const response = await fetch(`/api/documents/${documentId}/download`, {
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

