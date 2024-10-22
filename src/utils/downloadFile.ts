// utils/downloadFile.ts
import { toast } from 'react-toastify';

export const downloadFile = async (eventId: number, path: string = 'downloadProcessDocument'): Promise<void> => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    toast.error('La URL de la API no está configurada.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/fullevent/${path}/${eventId}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf', // Asegúrate de aceptar el tipo de contenido adecuado
        // Añade encabezados de autenticación si es necesario
      },
      credentials: 'include', // Incluye credenciales si es necesario
    });

    if (!response.ok) {
      throw new Error(`Error al abrir el archivo: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error('No se recibió ningún archivo.');
    }

    // Crear un objeto URL para el blob
    const url = window.URL.createObjectURL(blob);

    // Abrir el archivo en una nueva ventana o pestaña
    window.open(url, '_blank');

    // Limpiar el objeto URL después de un tiempo para liberar memoria
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    toast.success('Archivo abierto en una nueva ventana.');
  } catch (error: any) {
    console.error('Error al abrir el archivo:', error);
    toast.error(error.message || 'Error al abrir el archivo. Por favor, intenta de nuevo.');
  }
};
