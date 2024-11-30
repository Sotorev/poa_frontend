// utils/downloadFile.ts
import { currentUser } from '@/lib/auth';
import { toast } from 'react-toastify';

export const downloadFile = async (path: string = 'downloadProcessDocument', name: string): Promise<void> => {
  const user = await currentUser();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    toast.error('La URL de la API no está configurada.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/api/fullevent/${path}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${user?.token}`,
      },
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

    // Crear un enlace para descargar el archivo
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();

    // Limpiar el objeto URL y remover el enlace después de un tiempo para liberar memoria
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }, 1000);

    toast.success('Archivo descargado exitosamente.');
  } catch (error: any) {
    console.error('Error al descargar el archivo:', error);
    toast.error(error.message || 'Error al descargar el archivo. Por favor, intenta de nuevo.');
  }
};
