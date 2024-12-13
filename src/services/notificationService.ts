import { NotificationResponse } from "@/types/notificationTypes";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getNotifications(token: string, userId: number): Promise<NotificationResponse[]> {
  const response = await fetch(`${API_URL}/api/notifications/user/${userId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al obtener notificaciones: ${response.statusText}`);
  }

  return response.json();
}

export async function markAsRead(token: string, notificationId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al marcar notificación como leída: ${response.statusText}`);
  }
}

export async function deleteNotification(token: string, notificationId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/notifications/delete/${notificationId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Error al eliminar notificación: ${response.statusText}`);
  }
}