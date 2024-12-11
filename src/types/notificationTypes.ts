// src/types/notificationTypes.ts

export interface Notification {
  id: number;
  message: string;
  description: string;
  read: boolean;
  date: string;
  time: string;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}