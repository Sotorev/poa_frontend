'use client'

import { useState, useMemo } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Bell, CheckCircle2, Trash2, Check, Search } from 'lucide-react'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Notification } from '../types/notificationTypes'

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  notifications: Notification[]
  onMarkAsRead: (id: number) => void
  onDelete: (id: number) => void
}

export function NotificationPanel({ isOpen, onClose, notifications, onMarkAsRead, onDelete }: NotificationPanelProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('unread')

  const filteredNotifications = useMemo(() => {
    return notifications.filter(notification => 
      (notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (activeTab === 'unread' ? !notification.read : notification.read)
    )
  }, [notifications, searchTerm, activeTab])

  const renderNotifications = () => {
    if (filteredNotifications.length === 0) {
      return (
        <Card className="flex flex-col items-center justify-center h-full text-center p-6 bg-background/50 backdrop-blur-sm">
          <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
          <CardContent>
            <h3 className="text-xl font-semibold mb-2">No hay notificaciones</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? 'No se encontraron notificaciones que coincidan con tu búsqueda.' 
                : activeTab === 'unread'
                  ? 'No tienes notificaciones sin leer.'
                  : 'No tienes notificaciones leídas.'}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {filteredNotifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`overflow-hidden transition-all duration-300 ${
              notification.read 
                ? 'bg-background/50' 
                : 'bg-primary/5 border-primary shadow-lg'
            }`}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg text-primary">{notification.message}</h3>
                <Badge variant={notification.read ? "secondary" : "default"}>
                  {notification.read ? 'Leído' : 'Nuevo'}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">{notification.description}</p>
              <div className="text-xs text-muted-foreground">
                <p>{notification.date} - {notification.time}</p>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-2 flex justify-end space-x-2">
              {!notification.read && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-primary hover:text-primary/80"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Marcar como leído
                </Button>
              )}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => onDelete(notification.id)}
                className="text-destructive hover:text-destructive/80"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Eliminar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[540px] p-0 bg-gradient-to-b from-primary/10 to-background">
        <SheetHeader className="p-6">
          <SheetTitle className="text-3xl font-bold flex items-center text-primary">
            <Bell className="mr-3 h-8 w-8" />
            Notificaciones
          </SheetTitle>
          <SheetDescription>
            Gestiona tus notificaciones del Plan Operativo Anual (POA)
          </SheetDescription>
        </SheetHeader>
        <div className="px-6 pb-4 space-y-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              className="pl-10"
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Tabs defaultValue="unread" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="unread">No leídas</TabsTrigger>
              <TabsTrigger value="read">Leídas</TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100vh-280px)] mt-4">
              <TabsContent value="unread" className="mt-0">
                {renderNotifications()}
              </TabsContent>
              <TabsContent value="read" className="mt-0">
                {renderNotifications()}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  )
}

