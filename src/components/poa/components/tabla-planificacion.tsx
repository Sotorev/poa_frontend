// src/components/poa/components/tabla-planificacion.tsx

'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { z } from 'zod';
import { toast } from 'react-toastify';
import { useAuth } from '@/contexts/auth-context';

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
import { DetalleProcesoComponent } from './columns/detalle-proceso'; // Nuevo componente
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
import EventsViewerViceChancellorComponent from '../sections/events-viewer/events-viewer-vicechancellor';

type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>;

interface FilaPlanificacion extends FilaPlanificacionForm {
  estado: 'planificado' | 'aprobado' | 'rechazado';
  entityId: number | null;
  processDocument?: File; // Campo opcional añadido
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
    processDocument: "Documento de Proceso", // Añadido para processDocument
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

  const [showCommentThread, setShowCommentThread] = useState(false);
  const [currentEntityId, setCurrentEntityId] = useState<number | null>(null);
  const [currentRowId, setCurrentRowId] = useState<string | null>(null);
  const [currentEntityName, setCurrentEntityName] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
        }

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

        const currentYear = new Date().getFullYear();

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
      campusId: '',
      entityId: null,
      // processDocument no se establece al agregar la fila
    };
    setFilas([...filas, nuevaFila]);
    toast.info("Nueva fila agregada.");
  };

  const eliminarFila = (id: string) => {
    setFilas(filas.filter(fila => fila.id !== id));
    const updatedErrors = { ...filaErrors };
    delete updatedErrors[id];
    setFilaErrors(updatedErrors);
    toast.success("Fila eliminada exitosamente.");
  };

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

  const manejarCambioFechas = (id: string, data: { tipoEvento: "actividad" | "proyecto"; fechas: DatePair[] }) => {
    // Implementar si es necesario
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
        })), // Cambiado aquí
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
  
      setFilas(prevFilas =>
        prevFilas.map(filaItem =>
          filaItem.id === fila.id ? { ...filaItem, entityId: result.eventId, estado: 'aprobado' } : filaItem
        )
      );
  
      toast.success("Actividad enviada exitosamente.");
  
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
            <TableHead>Detalle del Proceso</TableHead> {/* Añadido */}
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
                    strategicObjectiveId={strategicObjectiveId}
                  />
                  {filaErrors[fila.id]?.estrategias && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].estrategias}</span>
                  )}
                </TableCell>
                <TableCell>
                  <IntervencionesSelectorComponent
                    selectedIntervenciones={fila.intervencion}
                    onSelectIntervencion={(intervenciones) => actualizarFila(fila.id, 'intervencion', intervenciones)}
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
                    onChange={(data) => manejarCambioFechas(fila.id, data)}
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
                  <CurrencyInput
                    value={fila.costoTotal}
                    onChange={(valor: number | undefined) => actualizarFila(fila.id, 'costoTotal', valor ?? 0)}
                  />
                  {filaErrors[fila.id]?.costoTotal && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].costoTotal}</span>
                  )}
                </TableCell>
                <TableCell>
                  <AporteUmes
                    aportes={fila.aporteUMES}
                    onChangeAportes={(aportes) => actualizarFila(fila.id, 'aporteUMES', aportes)}
                  />
                  {filaErrors[fila.id]?.aporteUMES && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].aporteUMES}</span>
                  )}
                </TableCell>
                <TableCell>
                  <AporteOtrasFuentesComponent
                    aportes={fila.aporteOtros}
                    onChangeAportes={(aportes) => actualizarFila(fila.id, 'aporteOtros', aportes)}
                  /> 
                  {filaErrors[fila.id]?.aporteOtros && (
                    <span className="text-red-500 text-sm">{filaErrors[fila.id].aporteOtros}</span>
                  )}
                </TableCell>
                <TableCell>
                  <TipoDeCompraComponent
                    selectedType={fila.tipoCompra}
                    onSelectType={(tipo: string) => actualizarFila(fila.id, 'tipoCompra', tipo)}
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
                  {!fila.detalle && (
                    <span className="text-yellow-500 text-sm">Detalle de costos no agregado.</span>
                  )}
                </TableCell>
                <TableCell>
                  <CampusSelector
                    onSelectCampus={(campusId) => actualizarFila(fila.id, 'campusId', campusId)}
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
                    file={fila.processDocument || null}
                    onFileChange={(file) => actualizarProcessDocument(fila.id, file)}
                  />
                  {!fila.processDocument && (
                    <span className="text-yellow-500 text-sm">Detalle del Proceso no agregado.</span>
                  )}
                </TableCell>
                <TableCell>
                  <AccionesComponent
                    onEliminar={() => eliminarFila(fila.id)}
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
        <EventsViewerViceChancellorComponent
          name="Revisión de eventos"
          isActive={false}
          poaId={poaId}
          facultyId={facultyId}
          isEditable={false}
          userId={userId}
        />
      ) : (
        <div>Cargando datos de la tabla de eventos...</div>
      )}


    </div>


  );
}
