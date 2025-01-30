import { currentUser } from "@/lib/auth";
import { ResponseExecutedEvent } from "@/types/eventExecution.type";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const postEventExecuted = async (eventExecuted: any, files: File[]) => {
  const user = await currentUser();
  const formData = new FormData();
  formData.append("data", JSON.stringify(eventExecuted));
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await fetch(`${API_URL}/api/fullexecution/fullexecution/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${user?.token}`,
    },
    body: formData,
  });

  return response.json();
};

export const getEventExecutedById = async (
  eventId: number
): Promise<ResponseExecutedEvent> => {
  const user = await currentUser();
  const response = await fetch(
    `${API_URL}/api/fullexecution/fullexecution/${eventId}`,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );

  return response.json();
};

export const getEventExecutedByPoa = async (
  poaId: number
): Promise<ResponseExecutedEvent[]> => {
  const user = await currentUser();
  const response = await fetch(
    `${API_URL}/api/fullexecution/fullexecution/poa/${poaId}`,
    {
      headers: {
        Authorization: `Bearer ${user?.token}`,
      },
    }
  );
  return response.json();
};

export const revertEventExecuted = async (eventId: number) => {
  try {
    const user = await currentUser();
    const response = await fetch(
      `${API_URL}/api/fullexecution/resetStatus/${eventId}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      }
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    throw error;
  }
};
