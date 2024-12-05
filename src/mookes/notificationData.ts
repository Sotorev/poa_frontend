import { Notification } from '../types/notificationTypes';

export const initialNotifications: Notification[] = [
  {
    id: 1,
    message: 'Nueva actualización del POA',
    description: 'Se ha actualizado el Plan Operativo Anual para la Facultad de Ingeniería.',
    read: false,
    date: '2023-06-15',
    time: '09:30'
  },
  {
    id: 2,
    message: 'Recordatorio: Fecha límite se acerca',
    description: 'La fecha límite para la entrega del informe trimestral es en 3 días.',
    read: false,
    date: '2023-06-14',
    time: '14:45'
  },
  {
    id: 3,
    message: 'Reunión de facultad',
    description: 'Se ha programado una reunión de facultad para discutir el avance del POA.',
    read: true,
    date: '2023-06-16',
    time: '11:00'
  },
  {
    id: 4,
    message: 'Nuevo recurso disponible',
    description: 'Se ha añadido un nuevo recurso para ayudar en la planificación del POA.',
    read: true,
    date: '2023-06-17',
    time: '13:15'
  },
  {
    id: 5,
    message: 'Actualización de objetivos',
    description: 'Los objetivos del POA han sido actualizados. Por favor, revíselos.',
    read: false,
    date: '2023-06-18',
    time: '10:00'
  },
];

