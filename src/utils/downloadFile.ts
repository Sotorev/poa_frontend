// utils/downloadFile.ts
import { toast } from 'react-toastify';

export const downloadFile = async (eventId: number): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    toast.error('La URL de la API no está configurada.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/fullevent/downloadProcessDocument/${eventId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf', // Asegúrate de aceptar el tipo de contenido adecuado
        // Añade encabezados de autenticación si es necesario
      },
      credentials: 'include', // Incluye credenciales si es necesario
    });

    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error('No se recibió ningún archivo.');
    }

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // No se establece el atributo download para dejar que el navegador maneje el nombre del archivo
    document.body.appendChild(a);
    a.click();

    // Limpiar
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success('Descarga iniciada.');
  } catch (error: any) {
    console.error('Error al descargar el archivo:', error);
    toast.error(error.message || 'Error al descargar el archivo. Por favor, intenta de nuevo.');
  }
};
