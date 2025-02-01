// utils/downloadFile.ts
import { currentUser } from "@/lib/auth";
import { toast } from "react-toastify";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

/**
 * Descarga un archivo desde una ruta específica del servidor.
 * 
 * @param path - La ruta del endpoint para descargar el archivo. Por defecto es "downloadProcessDocument"
 * @param name - El nombre con el que se guardará el archivo descargado
 * @returns Una promesa que se resuelve cuando el archivo se ha descargado exitosamente
 * 
 * @throws {Error} Si la URL de la API no está configurada
 * @throws {Error} Si hay un problema con la respuesta del servidor
 * @throws {Error} Si no se recibe ningún archivo
 * 
 * @remarks
 * Esta función realiza los siguientes pasos:
 * 1. Verifica la autenticación del usuario actual
 * 2. Realiza una petición GET al servidor
 * 3. Convierte la respuesta en un blob
 * 4. Crea un enlace temporal para descargar el archivo
 * 5. Limpia los recursos después de la descarga
 */
export const downloadFile = async (
  path: string = "downloadProcessDocument",
  name: string
): Promise<void> => {
  const user = await currentUser();
  if (!apiUrl) {
    toast.error("La URL de la API no está configurada.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/fullevent/${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al abrir el archivo: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("No se recibió ningún archivo.");
    }

    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crear un enlace para descargar el archivo
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();

    // Limpiar el objeto URL y remover el enlace después de un tiempo para liberar memoria
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);

    toast.success("Archivo descargado exitosamente.");
  } catch (error: any) {
    console.error("Error al descargar el archivo:", error);
    toast.error(
      error.message ||
        "Error al descargar el archivo. Por favor, intenta de nuevo."
    );
  }
};

/**
 * Descarga un archivo desde una URL específica con autenticación sin mostrar el cuadro de dialogo.
 * 
 * @param url - La URL desde donde se descargará el archivo
 * @param nombreArchivo - El nombre que se asignará al archivo descargado
 * @param token - Token de autenticación para la petición. Puede ser undefined
 * 
 * @returns Promesa que resuelve a un objeto File si es exitoso, o null si la descarga falla
 */
export const descargarArchivo = async (
  url: string,
  nombreArchivo: string,
  token: string | undefined
): Promise<File | null> => {
  try {
    const response = await fetch(`${apiUrl}${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      return null;
    }
    const blob = await response.blob();
    const tipo = blob.type || "application/octet-stream";
    return new File([blob], nombreArchivo, { type: tipo });
  } catch (error) {
    return null;
  }
};

/**
 * Descarga un archivo desde una ruta específica del servidor.
 * 
 * @param path - La ruta del endpoint para descargar el archivo. Por defecto es "/files/:fileId/download"
 * @param name - El nombre con el que se guardará el archivo descargado
 * @returns Una promesa que se resuelve cuando el archivo se ha descargado exitosamente
 * 
 * @throws {Error} Si la URL de la API no está configurada
 * @throws {Error} Si hay un problema con la respuesta del servidor
 * @throws {Error} Si no se recibe ningún archivo
 * 
 * @remarks
 * Esta función realiza los siguientes pasos:
 * 1. Verifica la autenticación del usuario actual
 * 2. Realiza una petición GET al servidor
 * 3. Convierte la respuesta en un blob
 * 4. Crea un enlace temporal para descargar el archivo
 * 5. Limpia los recursos después de la descarga
 */
export const downloadFileExecutedEvent = async (
  path: string,
  name: string
): Promise<void> => {
  const user = await currentUser();
  if (!apiUrl) {
    toast.error("La URL de la API no está configurada.");
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/fullexecution${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error al abrir el archivo: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error("No se recibió ningún archivo.");
    }

    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Crear un enlace para descargar el archivo
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();

    // Limpiar el objeto URL y remover el enlace después de un tiempo para liberar memoria
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);

    toast.success("Archivo descargado exitosamente.");
  } catch (error: any) {
    console.error("Error al descargar el archivo:", error);
    toast.error(
      error.message ||
        "Error al descargar el archivo. Por favor, intenta de nuevo."
    );
  }
};