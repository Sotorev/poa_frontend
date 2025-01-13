import { currentUser } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const eventExecuted = async (eventExecuted: any, files: File[]) => {
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
