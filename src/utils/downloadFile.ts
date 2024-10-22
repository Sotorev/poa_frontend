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
        'Content-Type': 'application/pdf', // Ajusta el tipo de contenido según corresponda
        // Añade encabezados de autenticación si es necesario
      },
      credentials: 'include', // Incluye credenciales si es necesario
    });

    if (!response.ok) {
      throw new Error(`Error al descargar el archivo: ${response.statusText}`);
    }

    // Obtener el blob del archivo
    const blob = await response.blob();

    // Intentar obtener el nombre del archivo desde el encabezado Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `archivo_${eventId}.pdf`; // Valor predeterminado

    if (contentDisposition && contentDisposition.includes('filename=')) {
      const match = contentDisposition.match(/filename="?(.+)"?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Crear un enlace temporal para descargar el archivo
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    // Limpiar
    a.remove();
    window.URL.revokeObjectURL(url);

    toast.success(`Descarga iniciada: ${filename}`);
  } catch (error) {
    console.error('Error al descargar el archivo:', error);
    toast.error('Error al descargar el archivo. Por favor, intenta de nuevo.');
  }
};
