// src/components/poa/components/tabla-planificacion.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

import { ObjetivosEstrategicosSelectorComponent } from './columns/objetivos-estrategicos-selector';
import { EstrategiasSelectorComponent } from './columns/estrategias-selector';
import { IntervencionesSelectorComponent } from './columns/intervenciones-selector';
import { OdsSelector } from './columns/ods-selector';
import { ActividadProyectoSelector } from './columns/actividad-proyecto-selector';
import CurrencyInput from './columns/currency-input';
import { AporteUmes } from './columns/aporte-umes';
import { AporteOtrasFuentesComponent } from './columns/aporte-otras-fuentes';
import { TipoDeCompraComponent } from './columns/tipo-de-compra';
import { RecursosSelectorComponent } from './columns/recursos-selector';
import { DetalleComponent } from './columns/detalle';

import { AreaEstrategicaComponent } from './columns/area-estrategica';
import { EventoComponent } from './columns/evento';
import { ObjetivoComponent } from './columns/objetivo';
import { EstadoComponent } from './columns/estado';
import { ResponsablesComponent } from './columns/responsables';
import { IndicadorLogroComponent } from './columns/indicador-logro';
import { ComentarioDecanoComponent } from './columns/comentario-decano';
import { AccionesComponent } from './columns/acciones';

import { strategicAreasSchema } from '@/schemas/strategicAreaSchema';
import { StrategicObjectiveSchema, StrategicObjective } from '@/schemas/strategicObjectiveSchema';
import { filaPlanificacionSchema } from '@/schemas/filaPlanificacionSchema';

import { useAuth } from '@/contexts/auth-context';
import { CampusSelector } from './columns/campus-selector';

// Definir el esquema de las filas para validación con Zod
type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>;

interface FilaPlanificacion extends FilaPlanificacionForm {
  id: string;
  estado: 'planificado' | 'aprobado' | 'rechazado';
  comentarioDecano: string;
}

interface FilaError {
  [key: string]: string;
}

interface DatePair {
  start: Date;
  end: Date;
}

const getColumnName = (field: string): string => {
  const columnMap: { [key: string]: string } = {
    areaEstrategica: "Área Estratégica",
    objetivoEstrategico: "Objetivo Estratégico",
    estrategias: "Estrategias",
    intervencion: "Intervención",
    ods: "ODS",
    tipoEvento: "Tipo de Evento",
    evento: "Evento",
    objetivo: "Objetivo",
    estado: "Estado",
    costoTotal: "Costo Total",
    aporteUMES: "Aporte UMES",
    aporteOtros: "Aporte Otros",
    tipoCompra: "Tipo de Compra",
    detalle: "Detalle",
    campusId: "Campus",
    responsablePlanificacion: "Responsable de Planificación",
    responsableEjecucion: "Responsable de Ejecución",
    responsableSeguimiento: "Responsable de Seguimiento",
    recursos: "Recursos",
    indicadorLogro: "Indicador de Logro",
    fechas: "Fechas",
    detalleProceso: "Detalle del Proceso",
    comentarioDecano: "Comentario Decano",
  };
  return columnMap[field] || field;
};

export function TablaPlanificacionComponent() {
  const { user, loading: loadingAuth } = useAuth();
  const userId = user?.userId;

  const [filas, setFilas] = useState<FilaPlanificacion[]>([]);
  const [strategicAreas, setStrategicAreas] = useState<{ strategicAreaId: number; name: string; peiId: number; isDeleted: boolean }[]>([]);
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([]);
  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filaErrors, setFilaErrors] = useState<{ [key: string]: FilaError }>({});

  const [facultyId, setFacultyId] = useState<number | null>(null);
  const [poaId, setPoaId] = useState<number | null>(null);
  const [loadingPoa, setLoadingPoa] = useState<boolean>(false);
  const [errorPoa, setErrorPoa] = useState<string | null>(null);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [modalErrorList, setModalErrorList] = useState<{ column: string, message: string }[]>([]);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
  const [pendingSendId, setPendingSendId] = useState<string | null>(null);

  // Estados para eventos
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Fetch de áreas estratégicas y objetivos estratégicos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
        }

        // Fetch strategic areas
        const responseAreas = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicareas`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!responseAreas.ok) {
          throw new Error(`Error al obtener áreas estratégicas: ${responseAreas.statusText}`);
        }
        const dataAreas = await responseAreas.json();
        const parsedAreas = strategicAreasSchema.parse(dataAreas);
        const activeAreas = parsedAreas.filter((area) => !area.isDeleted);
        setStrategicAreas(activeAreas);

        // Fetch strategic objectives
        const responseObjectives = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicobjectives`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!responseObjectives.ok) {
          throw new Error(`Error al obtener objetivos estratégicos: ${responseObjectives.statusText}`);
        }
        const dataObjectives = await responseObjectives.json();
        const parsedObjectives = dataObjectives.map((obj: any) => {
          return StrategicObjectiveSchema.parse(obj);
        }).filter((obj: StrategicObjective) => !obj.isDeleted);
        setStrategicObjectives(parsedObjectives);

        // Build objetivoToAreaMap
        const map: { [key: string]: string } = {};
        parsedObjectives.forEach((obj: StrategicObjective) => {
          const areaMatched = activeAreas.find(area => area.strategicAreaId === obj.strategicAreaId);
          if (areaMatched) {
            map[obj.strategicObjectiveId.toString()] = areaMatched.name;
          } else {
            console.warn(`No se encontró Área Estratégica para el Objetivo Estratégico ID: ${obj.strategicObjectiveId}`);
          }
        });
        setObjetivoToAreaMap(map);
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos de áreas estratégicas u objetivos estratégicos.");
          console.error(err.errors);
        } else {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fetch del facultyId y poaId una vez que el userId está disponible
  useEffect(() => {
    const fetchFacultyAndPoa = async () => {
      if (loadingAuth) return;
      if (!userId) {
        setErrorPoa("Usuario no autenticado.");
        return;
      }
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
        }

        // Fetch de la facultad del usuario
        const responseUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!responseUser.ok) {
          throw new Error(`Error al obtener datos del usuario: ${responseUser.statusText}`);
        }
        const dataUser = await responseUser.json();
        const fetchedFacultyId = dataUser.facultyId;
        setFacultyId(fetchedFacultyId);

        // Obtener el año actual
        const currentYear = new Date().getFullYear();

        // Fetch del poaId
        setLoadingPoa(true);
        const responsePoa = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/${fetchedFacultyId}/${currentYear}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!responsePoa.ok) {
          throw new Error(`Error al obtener poaId: ${responsePoa.statusText}`);
        }
        const dataPoa = await responsePoa.json();
        const fetchedPoaId = dataPoa.poaId;
        setPoaId(fetchedPoaId);
      } catch (err) {
        setErrorPoa((err as Error).message);
        console.error(err);
      } finally {
        setLoadingPoa(false);
      }
    };

    fetchFacultyAndPoa();
  }, [userId, loadingAuth]);

  // Fetch de eventos cuando poaId está disponible
  useEffect(() => {
    const fetchEvents = async () => {
      if (!poaId) return;
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
        }
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/poa/${poaId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        if (!response.ok) {
          throw new Error(`Error al obtener eventos: ${response.statusText}`);
        }
        const data = await response.json();
        setEvents(data);
      } catch (err) {
        console.error("Error al obtener eventos:", err);
      }
    };

    fetchEvents();
  }, [poaId]);

  // Función para agregar una nueva fila
  const agregarFila = () => {
    const nuevaFila: FilaPlanificacion = {
      id: Date.now().toString(),
      areaEstrategica: '',
      objetivoEstrategico: '',
      estrategias: [],
      intervencion: [],
      ods: [],
      tipoEvento: 'actividad',
      evento: '',
      objetivo: '',
      estado: 'planificado',
      costoTotal: 0,
      aporteUMES: [],
      aporteOtros: [],
      tipoCompra: '',
      detalle: null,
      responsablePlanificacion: '',
      responsableEjecucion: '',
      responsableSeguimiento: '',
      recursos: [],
      indicadorLogro: '',
      detalleProceso: null,
      comentarioDecano: '',
      fechas: [{ start: new Date(), end: new Date() }],
      campusId: '',
    };
    setFilas([...filas, nuevaFila]);
    toast.info("Nueva fila agregada.");
  };

  // Función para eliminar una fila
  const eliminarFila = (id: string) => {
    setFilas(filas.filter(fila => fila.id !== id));
    const updatedErrors = { ...filaErrors };
    delete updatedErrors[id];
    setFilaErrors(updatedErrors);
    toast.success("Fila eliminada exitosamente.");
  };

  // Función para actualizar una fila
  const actualizarFila = (id: string, campo: keyof FilaPlanificacion, valor: any | null) => {
    setFilas(prevFilas =>
      prevFilas.map(fila => {
        if (fila.id === id) {
          const updatedFila = { ...fila, [campo]: valor };

          if (campo === 'objetivoEstrategico') {
            const nuevaArea = objetivoToAreaMap[valor] || '';
            updatedFila.areaEstrategica = nuevaArea;
          }

          return updatedFila;
        }
        return fila;
      })
    );
  };

  // Función para agregar un nuevo objetivo estratégico
  const addStrategicObjective = (createdObjetivo: StrategicObjective) => {
    setStrategicObjectives(prev => [...prev, createdObjetivo]);
    const area = strategicAreas.find(area => area.strategicAreaId === createdObjetivo.strategicAreaId);
    if (area) {
      setObjetivoToAreaMap(prevMap => ({
        ...prevMap,
        [createdObjetivo.strategicObjectiveId.toString()]: area.name,
      }));
    } else {
      console.warn(`No se encontró Área Estratégica para el nuevo Objetivo Estratégico ID: ${createdObjetivo.strategicObjectiveId}`);
    }
    toast.success("Nuevo objetivo estratégico agregado.");
  };

  // Función para manejar cambios en fechas desde ActividadProyectoSelector
  const manejarCambioFechas = (id: string, data: { tipoEvento: "actividad" | "proyecto"; fechas: DatePair[] }) => {
    // Implementar si es necesario
  };

  // Función para enviar una fila al backend (POST)
  const enviarActividad = async (id: string) => {
    if (loadingPoa) {
      toast.warn("Aún se está obteniendo el poaId. Por favor, espera un momento.");
      return;
    }

    if (errorPoa) {
      toast.error(`No se puede enviar la actividad debido a un error: ${errorPoa}`);
      return;
    }

    if (!poaId) {
      toast.error("poaId no está disponible.");
      return;
    }

    const fila = filas.find(fila => fila.id === id);
    if (!fila) {
      console.error(`Fila con ID ${id} no encontrada.`);
      toast.error("La fila no se encontró.");
      return;
    }

    const validation = filaPlanificacionSchema.safeParse(fila);

    if (!validation.success) {
      const errors: FilaError = {};
      const errorsList: { column: string, message: string }[] = [];

      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        const message = err.message;
        errors[field] = message;
        errorsList.push({
          column: getColumnName(field),
          message: message,
        });
      });
      setFilaErrors(prevErrors => ({ ...prevErrors, [id]: errors }));
      setModalErrorList(errorsList);
      setIsErrorModalOpen(true);
      toast.error("Hay errores en la fila. Por favor, revisa los campos.");
      console.error("Error de validación:", validation.error.errors);
      return;
    }

    // Verificar si 'detalle' está vacío
    if (!fila.detalle) {
      setPendingSendId(id);
      setIsConfirmModalOpen(true);
      return;
    }

    await enviarAlBackend(fila);
  };

  // Función para proceder con el envío al backend (POST)
  const enviarAlBackend = async (fila: FilaPlanificacion) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("La URL de la API no está definida.");
      }

      const eventData = {
        name: fila.evento.trim(),
        type: fila.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto',
        poaId: poaId,
        statusId: 1,
        completionPercentage: 50,
        campusId: parseInt(fila.campusId, 10),
        objective: fila.objetivo.trim(),
        eventNature: 'Planificado',
        isDelayed: false,
        achievementIndicator: fila.indicadorLogro.trim(),
        purchaseType: fila.tipoCompra,
        totalCost: fila.costoTotal,
        dates: fila.fechas.map(pair => ({
          startDate: pair.start.toISOString().split('T')[0],
          endDate: pair.end.toISOString().split('T')[0],
        })),
        financings: [
          ...fila.aporteUMES.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.porcentaje,
            amount: aporte.amount,
          })),
          ...fila.aporteOtros.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.porcentaje,
            amount: aporte.amount,
          })),
        ],
        approvals: [],
        responsibles: [
          {
            responsibleRole: 'Principal',
            name: fila.responsablePlanificacion.trim(),
          },
          {
            responsibleRole: 'Ejecución',
            name: fila.responsableEjecucion.trim(),
          },
          {
            responsibleRole: 'Seguimiento',
            name: fila.responsableSeguimiento.trim(),
          },
        ],
        interventions: fila.intervencion.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
      };

      console.log('Datos a enviar:', eventData);

      const formData = new FormData();
      formData.append('data', JSON.stringify(eventData));

      if (fila.detalle) {
        formData.append('costDetailDocuments', fila.detalle);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al enviar la actividad: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log(`Actividad enviada exitosamente:`, result);

      toast.success("Actividad enviada exitosamente.");

      setFilas(prevFilas =>
        prevFilas.map(filaItem =>
          filaItem.id === fila.id ? { ...filaItem, estado: 'aprobado' } : filaItem
        )
      );

      setFilaErrors(prevErrors => ({ ...prevErrors, [fila.id]: {} }));
    } catch (err) {
      console.error(err);
      toast.error(`Error al enviar la actividad: ${(err as Error).message}`);
    }
  };

  // Función para confirmar envío sin detalle
  const confirmarEnvioSinDetalle = async () => {
    if (!pendingSendId) return;

    const fila = filas.find(fila => fila.id === pendingSendId);
    if (!fila) {
      toast.error("La fila no se encontró.");
      setIsConfirmModalOpen(false);
      setPendingSendId(null);
      return;
    }

    await enviarAlBackend(fila);

    setIsConfirmModalOpen(false);
    setPendingSendId(null);
  };

  // Función para manejar la edición de un evento
  const handleEditEvent = () => {
    if (!selectedEventId) {
      toast.error('Seleccione un evento para editar');
      return;
    }
    const eventToEdit = events.find(event => event.eventId === selectedEventId);
    if (!eventToEdit) {
      toast.error('Evento no encontrado');
      return;
    }

    const fila: FilaPlanificacion = {
      id: eventToEdit.eventId.toString(),
      areaEstrategica: '', // Deberás mapear esto si tienes la información
      objetivoEstrategico: '', // Deberás mapear esto si tienes la información
      estrategias: [], // Deberás mapear esto si tienes la información
      intervencion: eventToEdit.interventions.map((intervention: any) => intervention.interventionId.toString()),
      ods: eventToEdit.ods.map((ods: any) => ods.odsId.toString()),
      tipoEvento: eventToEdit.type === 'Actividad' ? 'actividad' : 'proyecto',
      evento: eventToEdit.name,
      objetivo: eventToEdit.objective,
      estado: 'planificado',
      costoTotal: eventToEdit.totalCost,
      aporteUMES: eventToEdit.financings.filter((f: any) => f.financingSourceId === 1).map((f: any) => ({
        financingSourceId: f.financingSourceId,
        amount: f.amount,
        porcentaje: f.percentage,
      })),
      aporteOtros: eventToEdit.financings.filter((f: any) => f.financingSourceId !== 1).map((f: any) => ({
        financingSourceId: f.financingSourceId,
        amount: f.amount,
        porcentaje: f.percentage,
      })),
      tipoCompra: eventToEdit.purchaseType,
      detalle: null,
      responsablePlanificacion: eventToEdit.responsibles.find((r: any) => r.responsibleRole === 'Principal')?.name || '',
      responsableEjecucion: eventToEdit.responsibles.find((r: any) => r.responsibleRole === 'Ejecución')?.name || '',
      responsableSeguimiento: eventToEdit.responsibles.find((r: any) => r.responsibleRole === 'Seguimiento')?.name || '',
      recursos: eventToEdit.resources.map((resource: any) => resource.resourceId.toString()),
      indicadorLogro: eventToEdit.achievementIndicator,
      detalleProceso: null,
      comentarioDecano: '',
      fechas: eventToEdit.dates.map((date: any) => ({
        start: new Date(date.startDate),
        end: new Date(date.endDate),
      })),
      campusId: eventToEdit.campusId.toString(),
    };

    setFilas([fila]);
  };

  // Función para actualizar una actividad existente (PUT)
  const actualizarActividad = async (id: string) => {
    if (loadingPoa) {
      toast.warn("Aún se está obteniendo el poaId. Por favor, espera un momento.");
      return;
    }

    if (errorPoa) {
      toast.error(`No se puede actualizar la actividad debido a un error: ${errorPoa}`);
      return;
    }

    if (!poaId) {
      toast.error("poaId no está disponible.");
      return;
    }

    const fila = filas.find(fila => fila.id === id);
    if (!fila) {
      console.error(`Fila con ID ${id} no encontrada.`);
      toast.error("La fila no se encontró.");
      return;
    }

    const validation = filaPlanificacionSchema.safeParse(fila);

    if (!validation.success) {
      const errors: FilaError = {};
      const errorsList: { column: string, message: string }[] = [];

      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        const message = err.message;
        errors[field] = message;
        errorsList.push({
          column: getColumnName(field),
          message: message,
        });
      });
      setFilaErrors(prevErrors => ({ ...prevErrors, [id]: errors }));
      setModalErrorList(errorsList);
      setIsErrorModalOpen(true);
      toast.error("Hay errores en la fila. Por favor, revisa los campos.");
      console.error("Error de validación:", validation.error.errors);
      return;
    }

    // Verificar si 'detalle' está vacío
    if (!fila.detalle) {
      setPendingSendId(id);
      setIsConfirmModalOpen(true);
      return;
    }

    await actualizarEnBackend(fila);
  };

  // Función para actualizar en el backend (PUT)
  const actualizarEnBackend = async (fila: FilaPlanificacion) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("La URL de la API no está definida.");
      }

      const eventData = {
        name: fila.evento.trim(),
        type: fila.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto',
        poaId: poaId,
        statusId: 1,
        completionPercentage: 50,
        campusId: parseInt(fila.campusId, 10),
        objective: fila.objetivo.trim(),
        eventNature: 'Planificado',
        isDelayed: false,
        achievementIndicator: fila.indicadorLogro.trim(),
        purchaseType: fila.tipoCompra,
        totalCost: fila.costoTotal,
        dates: fila.fechas.map(pair => ({
          startDate: pair.start.toISOString().split('T')[0],
          endDate: pair.end.toISOString().split('T')[0],
        })),
        financings: [
          ...fila.aporteUMES.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.porcentaje,
            amount: aporte.amount,
          })),
          ...fila.aporteOtros.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.porcentaje,
            amount: aporte.amount,
          })),
        ],
        approvals: [],
        responsibles: [
          {
            responsibleRole: 'Principal',
            name: fila.responsablePlanificacion.trim(),
          },
          {
            responsibleRole: 'Ejecución',
            name: fila.responsableEjecucion.trim(),
          },
          {
            responsibleRole: 'Seguimiento',
            name: fila.responsableSeguimiento.trim(),
          },
        ],
        interventions: fila.intervencion.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
      };

      console.log('Datos a actualizar:', eventData);

      const formData = new FormData();
      formData.append('data', JSON.stringify(eventData));

      if (fila.detalle) {
        formData.append('costDetailDocuments', fila.detalle);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent/${fila.id}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al actualizar la actividad: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      console.log(`Actividad actualizada exitosamente:`, result);

      toast.success("Actividad actualizada exitosamente.");

      setFilas(prevFilas =>
        prevFilas.map(filaItem =>
          filaItem.id === fila.id ? { ...filaItem, estado: 'aprobado' } : filaItem
        )
      );

      setFilaErrors(prevErrors => ({ ...prevErrors, [fila.id]: {} }));
    } catch (err) {
      console.error(err);
      toast.error(`Error al actualizar la actividad: ${(err as Error).message}`);
    }
  };

  if (loading || loadingAuth || loadingPoa) return <div>Cargando datos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (errorPoa) return <div className="text-red-500">Error al obtener poaId: {errorPoa}</div>;

  return (
    <div className="container mx-auto p-4">
      {/* Select para eventos */}
      <div className="mb-4">
        <label htmlFor="event-select">Seleccione un evento:</label>
        <select
          id="event-select"
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(Number(e.target.value))}
          className="ml-2 border p-1"
        >
          <option value="">-- Seleccione un evento --</option>
          {events.map(event => (
            <option key={event.eventId} value={event.eventId}>{event.name}</option>
          ))}
        </select>
        <Button onClick={handleEditEvent} className="ml-2">Editar</Button>
      </div>

      <Table>
        {/* ... El resto del código de la tabla permanece igual ... */}
        <TableHeader>
          {/* ... */}
        </TableHeader>
        <TableBody>
          {filas.map((fila) => {
            const strategicObjective = strategicObjectives.find(
              (obj) => obj.strategicObjectiveId.toString() === fila.objetivoEstrategico
            );

            const strategicObjectiveId = strategicObjective
              ? strategicObjective.strategicObjectiveId
              : 0;

            return (
              <TableRow key={fila.id}>
                {/* ... Celdas de la tabla ... */}
                <TableCell>
                  <AccionesComponent
                    onEliminar={() => eliminarFila(fila.id)}
                    onEnviar={() => enviarActividad(fila.id)}
                    onActualizar={() => actualizarActividad(fila.id)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button onClick={agregarFila} className="mt-4">Agregar Fila</Button>

      {/* Modales de errores y confirmación */}
      {/* ... El código de los modales permanece igual ... */}
    </div>
  );
}
