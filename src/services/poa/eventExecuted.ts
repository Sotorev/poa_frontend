import { currentUser } from '@/lib/auth';
import { RequestEventExecution } from '@/types/approvalStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const eventExecuted = async (eventExecuted: RequestEventExecution, files: File[]) => {
  const user = await currentUser();
  const formData = new FormData();
  formData.append('data', JSON.stringify(eventExecuted));
  files.forEach(file => {
    formData.append('files', file);
  });

  const response = await fetch(`${API_URL}/api/fullexecution/fullexecution/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
    body: formData,
  });

  return response.json();
}
