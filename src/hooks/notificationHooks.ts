import { useState, useMemo, useEffect } from 'react';
import { Notification } from '@/types/notificationTypes';
import { initialNotifications } from '@/mookes/notificationData';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'unread' | 'read'>('unread');

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => 
      (notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === 'unread' ? !notification.read : notification.read)
    );
  }, [notifications, searchTerm, activeTab]);

  const handleMarkAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const handleDelete = (id: number) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  return {
    notifications: filteredNotifications,
    searchTerm,
    setSearchTerm,
    activeTab,
    setActiveTab,
    handleMarkAsRead,
    handleDelete,
    unreadCount: notifications.filter(n => !n.read).length,
  };
}

export function useNotificationAnimation() {
  const [animationKey, setAnimationKey] = useState(0);

  const triggerAnimation = () => setAnimationKey(prev => prev + 1);

  return { animationKey, triggerAnimation };
}

