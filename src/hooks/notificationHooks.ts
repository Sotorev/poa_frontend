import { useState, useMemo, useEffect, use } from 'react';
import { Notification, NotificationResponse } from '@/types/notificationTypes';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getNotifications, markAsRead, deleteNotification } from '@/services/notificationService';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');
  const user = useCurrentUser();

  useEffect(() => {
    if (!user) return;

    const fetchNotifications = async () => {
      try {
        const data = await getNotifications(user.token, user.userId);
        const mappedNotifications = mapNotifications(data);
        setNotifications(mappedNotifications);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNotifications();
  }, [user]);

  function mapNotifications(data: NotificationResponse[]): Notification[] {
    return data.map(n => {
      const [message, ...descriptionParts] = n.message.split(':');
      return {
        id: n.id,
        message: `${message}:`,
        description: descriptionParts.join(':').trim(),
        read: n.isRead,
        date: n.createdAt.split('T')[0],
        time: n.createdAt.split('T')[1].substring(0, 5),
      };
    });
  }

  const filteredNotifications = useMemo(() => {
    return (notifications ?? []).filter(notification => 
      (activeTab === 'read' ? notification.read : !notification.read) && (notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );    
  }, [notifications, searchTerm, activeTab]);

  const handleMarkAsRead = (id: number) => {
    if (notifications && user) {
      markAsRead(user.token, id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      ));
    }
  };

  const handleDelete = (id: number) => {
    if (notifications && user?.token) {
      setNotifications(notifications.filter(n => n.id !== id));
      deleteNotification(user.token, id);
    }
  };

  return {
    notifications: notifications ?? [],
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    handleMarkAsRead,
    handleDelete,
    filteredNotifications,
    unreadCount: notifications ? notifications.filter(n => !n.read).length : 0,
  };
}

export function useNotificationAnimation() {
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = () => setAnimationKey(prev => prev + 1);

  return { animationKey, triggerAnimation };
}

