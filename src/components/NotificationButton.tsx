'use client'

import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { NotificationPanel } from './NotificationPanel'
import { useNotificationAnimation, useNotifications } from '@/hooks/notificationHooks'

export function NotificationButton() {
  const [isOpen, setIsOpen] = useState(false)
  const { animationKey, triggerAnimation } = useNotificationAnimation()
  const {
    notifications,
    handleMarkAsRead,
    handleDelete,
    unreadCount
  } = useNotifications()

  const handleClick = () => {
    setIsOpen(true)
    triggerAnimation()
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes expand-pulse {
        0% {
          box-shadow: 0 0 0 0 hsl(var(--primary) / 0.7);
        }
        100% {
          box-shadow: 0 0 0 10px hsl(var(--primary) / 0);
        }
      }
      .animate-expand-pulse {
        animation: expand-pulse 0.6s ease-out 3;
      }
    `
    document.head.appendChild(style)
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className={`relative ${
          unreadCount > 0 
            ? 'ring-[3px] ring-primary text-primary animate-expand-pulse' 
            : ''
        }`}
        onClick={handleClick}
        aria-label="Notificaciones"
        key={animationKey}
      >
        <Bell className={`h-5 w-5 ${unreadCount > 0 ? 'text-primary' : ''}`} />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-2 py-1 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>
      <NotificationPanel 
        isOpen={isOpen} 
        onClose={handleClose}
        notifications={notifications ?? []}
        onMarkAsRead={handleMarkAsRead}
        onDelete={handleDelete}
      />
    </>
  )
}

