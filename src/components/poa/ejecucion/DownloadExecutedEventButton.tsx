// src/components/poa/ejecucion/DownloadExecutedEventButton.tsx
import React, { useState } from 'react';
import { Button } from "@/components/ui/button"; // Asegúrate de ajustar la ruta según tu estructura
import { Download } from 'lucide-react';
import { downloadFileExecutedEvent } from '@/utils/downloadFile';

interface DownloadExecutedEventButtonProps {
  className?: string;
  path: string; 
  name: string; 
}

const DownloadExecutedEventButton: React.FC<DownloadExecutedEventButtonProps> = ({ className, path, name }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    await downloadFileExecutedEvent(path, name); // Pasar la ruta personalizada si se proporciona
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
      {isLoading ? 'Abriendo...' : 'Abrir Documento'}
    </Button>
  );
};

export default DownloadExecutedEventButton;
