// components/DownloadButton.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Asegúrate de ajustar la ruta según tu estructura
import { Download } from 'lucide-react';
import { downloadFile } from '@/utils/downloadFile';

interface DownloadButtonProps {
  eventId: number;
  className?: string;
}

const DownloadButton: React.FC<DownloadButtonProps> = ({ eventId, className }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    await downloadFile(eventId);
    setIsLoading(false);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      className={`bg-gray-100 text-gray-800 hover:bg-gray-200 ${className}`}
      onClick={handleDownload}
      disabled={isLoading}
    >
      <Download className="w-4 h-4 mr-2" />
      {isLoading ? 'Descargando...' : 'Descargar Documento'}
    </Button>
  );
};

export default DownloadButton;
