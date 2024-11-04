// src/components/poa/components/TablaPlanificacionComponent.tsx

'use client';

import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { toast } from 'react-toastify';
import { ObjetivosEstrategicosSelectorComponent } from './columns/objetivos-estrategicos-selector';
import { EstrategiasSelectorComponent } from './columns/estrategias-selector';
import { IntervencionesSelectorComponent } from './columns/intervenciones-selector';
import { OdsSelector } from './columns/ods-selector';
import { ActividadProyectoSelector } from './columns/actividad-proyecto-selector';
import { UMESFinancingComponent } from './columns/umes-financing-source';
import { OtherFinancingSourceComponent } from './columns/other-financing-source';
import TipoDeCompraComponent from './columns/tipo-de-compra';
import { RecursosSelectorComponent } from './columns/recursos-selector';
import { DetalleComponent } from './columns/detalle';
import { DetalleProcesoComponent } from './columns/detalle-proceso';
import { AreaEstrategicaComponent } from './columns/area-estrategica';
import { EventoComponent } from './columns/evento';
import { ObjetivoComponent } from './columns/objetivo';
import { EstadoComponent } from './columns/estado';
import { ResponsablesComponent } from './columns/responsables';
import { IndicadorLogroComponent } from './columns/indicador-logro';
import { CommentThread } from './columns/comment-thread';
import { AccionesComponent } from './columns/acciones';
import { strategicAreasSchema } from '@/schemas/strategicAreaSchema';
import { StrategicObjectiveSchema, StrategicObjective } from '@/schemas/strategicObjectiveSchema';
import { filaPlanificacionSchema } from '@/schemas/filaPlanificacionSchema';

import { CampusSelector } from './columns/campus-selector';
import { useCurrentUser } from '@/hooks/use-current-user';
import EventsCorrectionsComponent from '../sections/events-viewer/EventsCorrectionsComponent';

// Importamos los tipos necesarios
import { Strategy } from '@/types/Strategy';
import { Intervention } from '@/types/Intervention';
import { ODS } from '@/types/ods';
import { Resource } from '@/types/Resource';
import { Campus } from '@/types/Campus';
import { PurchaseType } from '@/types/PurchaseType';
import { PlanningEvent } from '@/types/interfaces';

import { downloadFile } from '@/utils/downloadFile'; // Importar la función de utilidad

type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>;

interface DatePair {
  start: Date;
  end: Date;
}

interface FilaPlanificacion extends FilaPlanificacionForm {
  estado: 'planificado' | 'aprobado' | 'rechazado';
  entityId: number | null;
  processDocument?: File;
  costDetailDocument?: File;
  fechas: DatePair[]; // Para actividades
  fechaProyecto: DatePair; // Para proyectos
}

interface FilaError {
  [key: string]: string;
}

interface FinancingSource {
  financingSourceId: number;
  name: string;
  category: string;
  isDeleted: boolean;
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
    detalle: "Detalle de Costos",
    campusId: "Campus",
    responsablePlanificacion: "Responsable de Planificación",
    responsableEjecucion: "Responsable de Ejecución",
    responsableSeguimiento: "Responsable de Seguimiento",
    recursos: "Recursos",
    indicadorLogro: "Indicador de Logro",
    fechas: "Fechas",
    detalleProceso: "Detalle del Proceso",
    comentarioDecano: "Comentario Decano",
    processDocument: "Documento de Proceso",
  };
  return columnMap[field] || field;
};

export function TablaPlanificacionComponent() {
  const user = useCurrentUser();
  const loadingAuth = user === null;
  const userId = user?.userId;

  const [filas, setFilas] = useState<FilaPlanificacion[]>([]);
  const [strategicAreas, setStrategicAreas] = useState<{ strategicAreaId: number; name: string; peiId: number; isDeleted: boolean }[]>([]);
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([]);
  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({});
  const [financingSources, setFinancingSources] = useState<FinancingSource[]>([]);
  const [estrategias, setEstrategias] = useState<Strategy[]>([]);
  const [intervenciones, setIntervenciones] = useState<Intervention[]>([]);
  const [odsList, setOdsList] = useState<ODS[]>([]);
  const [recursos, setRecursos] = useState<Resource[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [purchaseTypes, setPurchaseTypes] = useState<PurchaseType[]>([]);

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

  const [showCommentThread, setShowCommentThread] = useState(false);
  const [currentEntityId, setCurrentEntityId] = useState<number | null>(null);
  const [currentRowId, setCurrentRowId] = useState<string | null>(null);
  const [currentEntityName, setCurrentEntityName] = useState<string>("");

  // Estados para gestionar la deshabilitación de selectores
  const [isEstrategiasDisabled, setIsEstrategiasDisabled] = useState<boolean>(true);
  const [isIntervencionesDisabled, setIsIntervencionesDisabled] = useState<boolean>(true);

  // Función auxiliar para descargar y convertir archivos a objetos File
  const descargarArchivo = async (url: string, nombreArchivo: string): Promise<File | null> => {
    try {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      if (!response.ok) {
        console.error(`Error al descargar el archivo desde ${url}: ${response.statusText}`);
        return null;
      }
      const blob = await response.blob();
      // Inferir el tipo de archivo desde el blob
      const tipo = blob.type || 'application/octet-stream';
      return new File([blob], nombreArchivo, { type: tipo });
    } catch (error) {
      console.error(`Error al descargar el archivo desde ${url}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
        }

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        };

        // Fetch Strategic Areas
        const responseAreas = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicareas`, { headers });
        if (!responseAreas.ok) throw new Error(`Error al obtener áreas estratégicas: ${responseAreas.statusText}`);
        const dataAreas = await responseAreas.json();
        const parsedAreas = strategicAreasSchema.parse(dataAreas);
        const activeAreas = parsedAreas.filter((area) => !area.isDeleted);
        setStrategicAreas(activeAreas);

        // Fetch Strategic Objectives
        const responseObjectives = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategicobjectives`, { headers });
        if (!responseObjectives.ok) throw new Error(`Error al obtener objetivos estratégicos: ${responseObjectives.statusText}`);
        const dataObjectives = await responseObjectives.json();
        const parsedObjectives = dataObjectives.map((obj: any) => StrategicObjectiveSchema.parse(obj)).filter((obj: StrategicObjective) => !obj.isDeleted);
        setStrategicObjectives(parsedObjectives);

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

        // Fetch Financing Sources
        const financingSourcesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/financingSource`, { headers });
        if (!financingSourcesResponse.ok) throw new Error(`Error fetching financing sources: ${financingSourcesResponse.statusText}`);
        const financingSourcesData: FinancingSource[] = await financingSourcesResponse.json();
        setFinancingSources(financingSourcesData);

        // Fetch Estrategias
        const responseEstrategias = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strategies`, { headers });
        if (!responseEstrategias.ok) throw new Error(`Error al obtener estrategias: ${responseEstrategias.statusText}`);
        const dataEstrategias = await responseEstrategias.json();
        setEstrategias(dataEstrategias);

        // Fetch Intervenciones
        const responseIntervenciones = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/interventions`, { headers });
        if (!responseIntervenciones.ok) throw new Error(`Error al obtener intervenciones: ${responseIntervenciones.statusText}`);
        const dataIntervenciones = await responseIntervenciones.json();
        setIntervenciones(dataIntervenciones);

        // Fetch ODS
        const responseODS = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ods`, { headers });
        if (!responseODS.ok) throw new Error(`Error al obtener ODS: ${responseODS.statusText}`);
        const dataODS = await responseODS.json();
        setOdsList(dataODS);

        // Fetch Recursos
        const responseRecursos = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/institutionalResources`, { headers });
        if (!responseRecursos.ok) throw new Error(`Error al obtener recursos: ${responseRecursos.statusText}`);
        const dataRecursos = await responseRecursos.json();
        setRecursos(dataRecursos);

        // Fetch Campuses
        const responseCampuses = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/campus/`, { headers });
        if (!responseCampuses.ok) throw new Error(`Error al obtener campuses: ${responseCampuses.statusText}`);
        const dataCampuses = await responseCampuses.json();
        setCampuses(dataCampuses);

        // Fetch Purchase Types
        const responsePurchaseTypes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/purchasetypes`, { headers });
        if (!responsePurchaseTypes.ok) throw new Error(`Error al obtener tipos de compra: ${responsePurchaseTypes.statusText}`);
        const dataPurchaseTypes = await responsePurchaseTypes.json();
        setPurchaseTypes(dataPurchaseTypes);

        // Opcional: Si al inicio tienes filas con entityId, cargar las URLs de descarga
        setFilas(prevFilas =>
          prevFilas.map(fila => {
            if (fila.entityId) {
              return {
                ...fila,
                // Las URLs de descarga se manejan directamente en el renderizado
              };
            }
            return fila;
          })
        );

      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos.");
          console.error(err.errors);
        } else {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.token]);

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

        const headers = {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        };

        // Fetch User Data
        const responseUser = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, { headers });
        if (!responseUser.ok) throw new Error(`Error al obtener datos del usuario: ${responseUser.statusText}`);
        const dataUser = await responseUser.json();
        const fetchedFacultyId = dataUser.facultyId;
        setFacultyId(fetchedFacultyId);

        const currentYear = new Date().getFullYear();

        // Fetch POA
        setLoadingPoa(true);
        const responsePoa = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/${fetchedFacultyId}/${currentYear}`, { headers });
        if (!responsePoa.ok) throw new Error(`Error al obtener poaId: ${responsePoa.statusText}`);
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
      fechas: [{ start: new Date(), end: new Date() }],
      fechaProyecto: { start: new Date(), end: new Date() },
      campusId: '',
      entityId: null,
    };
    setFilas([...filas, nuevaFila]);
    toast.info("Nueva fila agregada.");
  };

  // Función para actualizar los campos de la fila
  const actualizarFila = (id: string, campo: keyof FilaPlanificacion, valor: any | null) => {
    setFilas(prevFilas =>
      prevFilas.map(fila => {
        if (fila.id === id) {
          const updatedFila = { ...fila, [campo]: valor };

          if (campo === 'objetivoEstrategico') {
            const nuevaArea = objetivoToAreaMap[valor] || '';
            updatedFila.areaEstrategica = nuevaArea;

            // Gestionar deshabilitación del selector de estrategias
            setIsEstrategiasDisabled(!valor); // Deshabilitar si no hay objetivo estratégico seleccionado

            // Resetear estrategias e intervenciones si el objetivo estratégico cambia
            if (!valor) {
              updatedFila.estrategias = [];
              updatedFila.intervencion = [];
              setIsIntervencionesDisabled(true);
            } else {
              // Si se selecciona un objetivo estratégico, verificar si hay estrategias seleccionadas
              setIsIntervencionesDisabled(updatedFila.estrategias.length === 0);
            }
          }

          if (campo === 'estrategias') {
            // Gestionar deshabilitación del selector de intervenciones
            setIsIntervencionesDisabled((valor as string[]).length === 0);
          }

          if (campo === 'tipoEvento') {
            if (valor === 'actividad') {
              updatedFila.fechaProyecto = { start: new Date(), end: new Date() };
            } else {
              updatedFila.fechas = [{ start: new Date(), end: new Date() }];
            }
          }

          // Cálculo automático de costo total y porcentajes
          if (campo === 'aporteUMES' || campo === 'aporteOtros') {
            const totalAporte = [...updatedFila.aporteUMES, ...updatedFila.aporteOtros].reduce((acc, aporte) => acc + aporte.amount, 0);
            updatedFila.costoTotal = totalAporte;

            // Evitar división por cero
            if (totalAporte > 0) {
              const updatedAporteUMES = updatedFila.aporteUMES.map(aporte => ({
                ...aporte,
                percentage: parseFloat(((aporte.amount / totalAporte) * 100).toFixed(2)),
              }));
              const updatedAporteOtros = updatedFila.aporteOtros.map(aporte => ({
                ...aporte,
                percentage: parseFloat(((aporte.amount / totalAporte) * 100).toFixed(2)),
              }));
              updatedFila.aporteUMES = updatedAporteUMES;
              updatedFila.aporteOtros = updatedAporteOtros;
            } else {
              // Resetear porcentajes si el total es cero
              const updatedAporteUMES = updatedFila.aporteUMES.map(aporte => ({
                ...aporte,
                percentage: 0,
              }));
              const updatedAporteOtros = updatedFila.aporteOtros.map(aporte => ({
                ...aporte,
                percentage: 0,
              }));
              updatedFila.aporteUMES = updatedAporteUMES;
              updatedFila.aporteOtros = updatedAporteOtros;
            }
          }

          return updatedFila;
        }
        return fila;
      })
    );
  };

  const actualizarProcessDocument = (id: string, file: File | null) => {
    setFilas(prevFilas =>
      prevFilas.map(fila => {
        if (fila.id === id) {
          return { ...fila, processDocument: file || undefined };
        }
        return fila;
      })
    );
  };

  const actualizarIntervencion = (id: string, intervenciones: string[]) => {
    setFilas(prevFilas =>
      prevFilas.map(fila => {
        if (fila.id === id) {
          return { ...fila, intervencion: intervenciones };
        }
        return fila;
      })
    );
  };

  const actualizarFechas = (id: string, fechas: DatePair[]) => {
    setFilas(prevFilas =>
      prevFilas.map(fila => {
        if (fila.id === id) {
          return { ...fila, fechas };
        }
        return fila;
      })
    );
  };

  const actualizarFechaProyecto = (id: string, fechaProyecto: DatePair) => {
    setFilas(prevFilas =>
      prevFilas.map(fila => {
        if (fila.id === id) {
          return { ...fila, fechaProyecto };
        }
        return fila;
      })
    );
  };

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

    if (!fila.detalle) {
      setPendingSendId(id);
      setIsConfirmModalOpen(true);
      setCurrentRowId(id);
      setCurrentEntityName(fila.evento);
      return;
    }

    await enviarAlBackend(fila);
  };

  const enviarAlBackend = async (fila: FilaPlanificacion) => {
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("La URL de la API no está definida.");
      }
  
      // Determinar si es una creación (POST) o una actualización (PUT)
      const url = fila.entityId
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/fullevent/${fila.entityId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/fullEvent`;
  
      const method = fila.entityId ? 'PUT' : 'POST';
  
      const eventData = {
        name: fila.evento.trim(),
        type: fila.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto',
        poaId: poaId,
        statusId: 1,
        completionPercentage: 0,
        campusId: parseInt(fila.campusId, 10),
        objective: fila.objetivo.trim(),
        eventNature: 'Planificado',
        isDelayed: false,
        achievementIndicator: fila.indicadorLogro.trim(),
        purchaseTypeId: parseInt(fila.tipoCompra, 10),
        totalCost: fila.costoTotal,
        dates:
          fila.tipoEvento === 'actividad'
            ? fila.fechas.map((pair) => ({
                startDate: pair.start.toISOString().split('T')[0],
                endDate: pair.end.toISOString().split('T')[0],
              }))
            : [
                {
                  startDate: fila.fechaProyecto.start.toISOString().split('T')[0],
                  endDate: fila.fechaProyecto.end.toISOString().split('T')[0],
                },
              ],
        financings: [
          ...fila.aporteUMES.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.percentage,
            amount: aporte.amount,
          })),
          ...fila.aporteOtros.map(aporte => ({
            financingSourceId: aporte.financingSourceId,
            percentage: aporte.percentage,
            amount: aporte.amount,
          })),
        ],
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
        ods: fila.ods.map(id => parseInt(id, 10)).filter(id => !isNaN(id)),
        resources: fila.recursos.map((recurso: string) => ({
          resourceId: parseInt(recurso, 10),
        })),
        userId: userId,
      };
  
      console.log('Enviando datos:', eventData);
  
      const formData = new FormData();
      formData.append('data', JSON.stringify(eventData));
  
      if (fila.detalle) {
        formData.append('costDetailDocuments', fila.detalle);
      }
  
      if (fila.processDocument) {
        formData.append('processDocument', fila.processDocument);
      }
  
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${user?.token}`
        },
        body: formData,
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al enviar la actividad: ${errorData.message || response.statusText}`);
      }
  
      const result = await response.json();
  
      setFilas(prevFilas =>
        prevFilas.map(filaItem =>
          filaItem.id === fila.id
            ? {
                ...filaItem,
                entityId: result.eventId || fila.entityId,
                estado: 'aprobado',
              }
            : filaItem
        )
      );
  
      toast.success(fila.entityId ? "Actividad actualizada exitosamente." : "Actividad enviada exitosamente.");
  
      setFilaErrors(prevErrors => ({ ...prevErrors, [fila.id]: {} }));
    } catch (err) {
      console.error(err);
      toast.error(`Error al enviar la actividad: ${(err as Error).message}`);
    }
  };
  

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

  const handleEntityIdCreated = (newEntityId: number) => {
    if (currentRowId) {
      setFilas(prevFilas =>
        prevFilas.map(fila =>
          fila.id === currentRowId ? { ...fila, entityId: newEntityId } : fila
        )
      );
      setCurrentEntityId(newEntityId);
      setShowCommentThread(false);
      toast.success("Comentario enviado y entityId creado.");
    }
  };

  // Nueva implementación de handleDownload utilizando la función de utilidad
  const handleDownload = (entityId: number, type: 'process' | 'costDetail') => {
    const path = type === 'process' ? 'downloadProcessDocument' : 'downloadCostDetailDocument';
    downloadFile(entityId, path);
  };

  // Agregar la función handleEditEvent
  const handleEditEvent = async (event: PlanningEvent) => {
    try {
      // Mapeo de datos existente
      const areaEstrategicaObj = strategicAreas.find(area => area.name === event.areaEstrategica);
      const areaEstrategicaId = areaEstrategicaObj ? areaEstrategicaObj.name : '';

      const objetivoEstrategicoObj = strategicObjectives.find(obj => obj.description === event.objetivoEstrategico);
      const objetivoEstrategicoId = objetivoEstrategicoObj ? objetivoEstrategicoObj.strategicObjectiveId.toString() : '';

      const estrategiasIds = estrategias
        .filter(strategy => event.estrategias.includes(strategy.description))
        .map(strategy => strategy.strategyId.toString());

      const intervencionIds = intervenciones
        .filter(intervention => event.intervencion.includes(intervention.name))
        .map(intervention => intervention.interventionId.toString());

      const odsIds = odsList
        .filter(ods => event.ods.includes(ods.name))
        .map(ods => ods.odsId.toString());

      const recursosIds = recursos
        .filter(resource => event.recursos.includes(resource.name))
        .map(resource => resource.resourceId.toString());

      const campusObj = campuses.find(campus => campus.name === event.campus);
      const campusId = campusObj ? campusObj.campusId.toString() : '';

      const tipoCompraObj = purchaseTypes.find(pt => pt.name === event.tipoCompra);
      const tipoCompraId = tipoCompraObj ? tipoCompraObj.purchaseTypeId.toString() : '';

      const aporteUMES = event.aporteUMES ? [{
        financingSourceId: 1, // Asumiendo que el ID 1 es UMES
        percentage: (event.aporteUMES / event.costoTotal) * 100,
        amount: event.aporteUMES,
      }] : [];

      const aporteOtros = event.aporteOtros ? [{
        financingSourceId: 2, // Ajusta este ID según corresponda
        percentage: (event.aporteOtros / event.costoTotal) * 100,
        amount: event.aporteOtros,
      }] : [];

      const fechas = event.fechas.map(interval => ({
        start: new Date(interval.inicio),
        end: new Date(interval.fin),
      }));

      const nuevaFila: FilaPlanificacion = {
        id: Date.now().toString(),
        areaEstrategica: areaEstrategicaId,
        objetivoEstrategico: objetivoEstrategicoId,
        estrategias: estrategiasIds,
        intervencion: intervencionIds,
        ods: odsIds,
        tipoEvento: event.tipoEvento,
        evento: event.evento,
        objetivo: event.objetivo,
        estado: 'planificado',
        costoTotal: event.costoTotal,
        aporteUMES: aporteUMES,
        aporteOtros: aporteOtros,
        tipoCompra: tipoCompraId,
        detalle: null, // Inicialmente nulo; se actualizará más adelante
        responsablePlanificacion: event.responsables.principal,
        responsableEjecucion: event.responsables.ejecucion,
        responsableSeguimiento: event.responsables.seguimiento,
        recursos: recursosIds,
        indicadorLogro: event.indicadorLogro,
        detalleProceso: null, // Inicialmente nulo; se actualizará más adelante
        fechas: fechas,
        fechaProyecto: fechas[0], // Asumiendo que el primer intervalo es para proyectos
        campusId: campusId,
        entityId: Number(event.id),
      };

      // Agregar la nueva fila al estado
      setFilas([nuevaFila]); // Puedes ajustar esto si deseas agregar la fila en lugar de reemplazar
      toast.info("Evento cargado para edición.");

      // **Actualizar los estados de deshabilitación**
      setIsEstrategiasDisabled(!nuevaFila.objetivoEstrategico);
      setIsIntervencionesDisabled(nuevaFila.estrategias.length === 0);

      // URLs para descargar los archivos
      const baseUrl = process.env.NEXT_PUBLIC_API_URL;
      if (!baseUrl) {
        console.error("URL de la API no definida.");
        return;
      }

      const urlDetalleProceso = `${baseUrl}/api/fullevent/downloadProcessDocument/${event.id}`;
      const urlDetalle = `${baseUrl}/api/fullevent/downloadCostDetailDocument/${event.id}`;

      // Descargar los archivos
      const [archivoDetalleProceso, archivoDetalle] = await Promise.all([
        descargarArchivo(urlDetalleProceso, `detalle-proceso-${event.id}`),
        descargarArchivo(urlDetalle, `detalle-${event.id}`)
      ]);

      // Actualizar la fila con los archivos descargados
      setFilas(prevFilas =>
        prevFilas.map(fila => {
          if (fila.id === nuevaFila.id) {
            return {
              ...fila,
              detalleProceso: archivoDetalleProceso || null,
              detalle: archivoDetalle || null,
            };
          }
          return fila;
        })
      );

      if (archivoDetalleProceso || archivoDetalle) {
        toast.success("Archivos cargados correctamente.");
      } else {
        toast.warn("No se pudieron cargar algunos archivos.");
      }

    } catch (error) {
      console.error("Error en handleEditEvent:", error);
      toast.error("Ocurrió un error al editar el evento.");
    }
  };

  if (loading || loadingAuth || loadingPoa) return <div>Cargando datos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;
  if (errorPoa) return <div className="text-red-500">Error al obtener poaId: {errorPoa}</div>;

  return (
    <div className="container mx-auto p-4">
      {showCommentThread && currentEntityId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <CommentThread
            isOpen={showCommentThread}
            onClose={() => setShowCommentThread(false)}
            entityId={currentEntityId}
            entityName={currentEntityName}
          />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {/* Encabezados de la tabla */}
            <TableHead>Área Estratégica</TableHead>
            <TableHead>Objetivo Estratégico</TableHead>
            <TableHead>Estrategias</TableHead>
            <TableHead>Intervención</TableHead>
            <TableHead>ODS</TableHead>
            <TableHead>Tipo de Evento</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Objetivo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Costo Total</TableHead>
            <TableHead>Aporte UMES</TableHead>
            <TableHead>Aporte Otros</TableHead>
            <TableHead>Tipo de Compra</TableHead>
            <TableHead>Detalle de costos</TableHead>
            <TableHead>Campus</TableHead>
            <TableHead>Responsables</TableHead>
            <TableHead>Recursos</TableHead>
            <TableHead>Indicador de Logro</TableHead>
            <TableHead>Comentario Decano</TableHead>
            <TableHead>Detalle del Proceso</TableHead>
            <TableHead>Acciones</TableHead>
          </TableRow>
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
                <TableCell>
                  <AreaEstrategicaComponent
                    areaEstrategica={fila.areaEstrategica}
                    error={filaErrors[fila.id]?.areaEstrategica}
                  />
                  {filaErrors[fila.id]?.areaEstrategica && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].areaEstrategica}</span>
                  )}
                </TableCell>
                <TableCell>
                  <ObjetivosEstrategicosSelectorComponent
                    selectedObjetivos={[fila.objetivoEstrategico]}
                    onSelectObjetivo={(objetivo) => actualizarFila(fila.id, 'objetivoEstrategico', objetivo)}
                    strategicObjectives={strategicObjectives}
                    addStrategicObjective={addStrategicObjective}
                  />
                  {filaErrors[fila.id]?.objetivoEstrategico && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].objetivoEstrategico}</span>
                  )}
                </TableCell>
                <TableCell>
                  <EstrategiasSelectorComponent
                    selectedEstrategias={fila.estrategias}
                    onSelectEstrategia={(estrategias) => actualizarFila(fila.id, 'estrategias', estrategias)}
                    strategicObjectiveIds={fila.objetivoEstrategico ? [Number(fila.objetivoEstrategico)] : []}
                    disabled={isEstrategiasDisabled}
                    tooltipMessage="Por favor, seleccione primero un objetivo estratégico."
                  />
                  {filaErrors[fila.id]?.estrategias && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].estrategias}</span>
                  )}
                </TableCell>
                <TableCell>
                  <IntervencionesSelectorComponent
                    selectedIntervenciones={fila.intervencion}
                    onSelectIntervencion={(intervenciones) => actualizarIntervencion(fila.id, intervenciones)}
                    disabled={isIntervencionesDisabled}
                    tooltipMessage="Por favor, seleccione primero al menos una estrategia."
                    strategyIds={fila.estrategias}
                  />
                  {filaErrors[fila.id]?.intervencion && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].intervencion}</span>
                  )}
                </TableCell>
                <TableCell>
                  <OdsSelector
                    selectedODS={fila.ods}
                    onSelectODS={(ods) => actualizarFila(fila.id, 'ods', ods)}
                  />
                  {filaErrors[fila.id]?.ods && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].ods}</span>
                  )}
                </TableCell>
                <TableCell>
                  <ActividadProyectoSelector
                    selectedOption={fila.tipoEvento}
                    onSelectOption={(tipo) => actualizarFila(fila.id, 'tipoEvento', tipo)}
                    fechas={fila.fechas}
                    onChangeFechas={(fechas) => actualizarFechas(fila.id, fechas)}
                    fechaProyecto={fila.fechaProyecto}
                    onChangeFechaProyecto={(fecha) => actualizarFechaProyecto(fila.id, fecha)}
                  />
                  {filaErrors[fila.id]?.tipoEvento && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].tipoEvento}</span>
                  )}
                </TableCell>
                <TableCell>
                  <EventoComponent
                    value={fila.evento}
                    onChange={(value) => actualizarFila(fila.id, 'evento', value)}
                  />
                  {filaErrors[fila.id]?.evento && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].evento}</span>
                  )}
                </TableCell>
                <TableCell>
                  <ObjetivoComponent
                    value={fila.objetivo}
                    onChange={(value) => actualizarFila(fila.id, 'objetivo', value)}
                  />
                  {filaErrors[fila.id]?.objetivo && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].objetivo}</span>
                  )}
                </TableCell>
                <TableCell>
                  <EstadoComponent estado={fila.estado} />
                  {filaErrors[fila.id]?.estado && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].estado}</span>
                  )}
                </TableCell>
                <TableCell>
                  {/* Mostrar Costo Total calculado automáticamente */}
                  <div>
                    <span>GTQ {fila.costoTotal.toFixed(2)}</span>
                  </div>
                  {filaErrors[fila.id]?.costoTotal && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].costoTotal}</span>
                  )}
                </TableCell>
                <TableCell>
                  <UMESFinancingComponent
                    contributions={fila.aporteUMES}
                    onChangeContributions={(aportes) => actualizarFila(fila.id, 'aporteUMES', aportes)}
                    totalCost={fila.costoTotal}
                  />
                  {filaErrors[fila.id]?.aporteUMES && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].aporteUMES}</span>
                  )}
                </TableCell>
                <TableCell>
                  <OtherFinancingSourceComponent
                    contributions={fila.aporteOtros}
                    onChangeContributions={(aportes) => actualizarFila(fila.id, 'aporteOtros', aportes)}
                    totalCost={fila.costoTotal}
                  />
                  {filaErrors[fila.id]?.aporteOtros && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].aporteOtros}</span>
                  )}
                </TableCell>
                <TableCell>
                  <TipoDeCompraComponent
                    selectedTipo={fila.tipoCompra}
                    onSelectTipo={(tipo: string | null) => actualizarFila(fila.id, 'tipoCompra', tipo)}
                  />
                  {filaErrors[fila.id]?.tipoCompra && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].tipoCompra}</span>
                  )}
                </TableCell>
                <TableCell>
                  <DetalleComponent
                    file={fila.detalle}
                    onFileChange={(file) => actualizarFila(fila.id, 'detalle', file)}
                  />
                  {/* Enlace para descargar el detalle de costos si existe entityId */}
                  {fila.entityId && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={() => handleDownload(fila.entityId!, 'costDetail')}
                      >
                        Descargar Detalle de Costos
                      </span>
                    </div>
                  )}
                  {!fila.detalle && (
                    <span className="text-yellow-500 text-sm">Detalle de costos no agregado.</span>
                  )}
                  {filaErrors[fila.id]?.detalle && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].detalle}</span>
                  )}
                </TableCell>
                <TableCell>
                  <CampusSelector
                    onSelectCampus={(campusId) => actualizarFila(fila.id, 'campusId', campusId)}
                    selectedCampusId={fila.campusId}
                  />
                  {filaErrors[fila.id]?.campusId && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].campusId}</span>
                  )}
                </TableCell>
                <TableCell>
                  <ResponsablesComponent
                    responsablePlanificacion={fila.responsablePlanificacion}
                    responsableEjecucion={fila.responsableEjecucion}
                    responsableSeguimiento={fila.responsableSeguimiento}
                    onChangeResponsablePlanificacion={(value: string) => actualizarFila(fila.id, 'responsablePlanificacion', value)}
                    onChangeResponsableEjecucion={(value: string) => actualizarFila(fila.id, 'responsableEjecucion', value)}
                    onChangeResponsableSeguimiento={(value: string) => actualizarFila(fila.id, 'responsableSeguimiento', value)}
                  />
                  {filaErrors[fila.id]?.responsablePlanificacion && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].responsablePlanificacion}</span>
                  )}
                  {filaErrors[fila.id]?.responsableEjecucion && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].responsableEjecucion}</span>
                  )}
                  {filaErrors[fila.id]?.responsableSeguimiento && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].responsableSeguimiento}</span>
                  )}
                </TableCell>
                <TableCell>
                  <RecursosSelectorComponent
                    selectedRecursos={fila.recursos}
                    onSelectRecursos={(recursos) => actualizarFila(fila.id, 'recursos', recursos)}
                  />
                  {filaErrors[fila.id]?.recursos && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].recursos}</span>
                  )}
                </TableCell>
                <TableCell>
                  <IndicadorLogroComponent
                    value={fila.indicadorLogro}
                    onChange={(value: string) => actualizarFila(fila.id, 'indicadorLogro', value)}
                  />
                  {filaErrors[fila.id]?.indicadorLogro && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].indicadorLogro}</span>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    onClick={() => {
                      if (fila.entityId !== null) {
                        setCurrentEntityId(fila.entityId);
                        setCurrentEntityName(fila.evento);
                        setShowCommentThread(true);
                      } else {
                        toast.warn("Debe enviar la actividad primero para poder mostrar comentarios.");
                      }
                    }}
                    disabled={!fila.entityId}
                  >
                    Mostrar Comentarios
                  </Button>
                </TableCell>
                <TableCell>
                  <DetalleProcesoComponent
                    file={fila.detalleProceso || null}
                    onFileChange={(file) => actualizarProcessDocument(fila.id, file)}
                  />
                  {/* Enlace para descargar el detalle del proceso si existe entityId */}
                  {fila.entityId && (
                    <div className="flex items-center space-x-2 mt-2">
                      <span
                        className="cursor-pointer text-blue-600 hover:underline"
                        onClick={() => handleDownload(fila.entityId!, 'process')}
                      >
                        Descargar Detalle del Proceso
                      </span>
                    </div>
                  )}
                  {!fila.processDocument && (
                    <span className="text-yellow-500 text-sm">Detalle del Proceso no agregado.</span>
                  )}
                  {filaErrors[fila.id]?.detalleProceso && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].detalleProceso}</span>
                  )}
                </TableCell>
                <TableCell>
                  <AccionesComponent
                    onEnviar={() => enviarActividad(fila.id)}
                  />
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <Button onClick={agregarFila} className="mt-4">Agregar Fila</Button>

      {/* Modal de Errores */}
      {isErrorModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Errores en la Fila</h2>
            <ul className="list-disc list-inside mb-4">
              {modalErrorList.map((error, index) => (
                <li key={index}>
                  <strong>{error.column}:</strong> {error.message}
                </li>
              ))}
            </ul>
            <Button onClick={() => setIsErrorModalOpen(false)}>Cerrar</Button>
          </div>
        </div>
      )}

      {/* Modal de Confirmación */}
      {isConfirmModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Confirmar Envío</h2>
            <p>¿Estás seguro de que deseas enviar la actividad sin el detalle de costos?</p>
            <div className="flex justify-end mt-6 space-x-4">
              <Button variant="outline" onClick={() => { setIsConfirmModalOpen(false); setPendingSendId(null); }}>
                Cancelar
              </Button>
              <Button onClick={confirmarEnvioSinDetalle}>
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      {poaId && facultyId && userId ? (
        <EventsCorrectionsComponent
          name="Revisión de eventos"
          isActive={false}
          poaId={poaId}
          facultyId={facultyId}
          isEditable={false}
          userId={userId}
          onEditEvent={handleEditEvent} // Pasamos la función aquí
        />
      ) : (
        <div>Cargando datos de la tabla de eventos...</div>
      )}
    </div>
  );
}
