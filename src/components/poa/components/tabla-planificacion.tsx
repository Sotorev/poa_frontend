// src/components/poa/components/tabla-planificacion.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { z } from 'zod';

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
import { DetalleProcesoComponent } from './columns/detalle-proceso';
import { DetalleComponent } from './columns/detalle';
import { FechasSelectorComponent } from './columns/fechas-selector';

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

// Definir el tipo para las opciones de compra
interface PurchaseType {
  id: number;
  name: string;
}

// Definir initialOptions con tipos explícitos
const initialOptions: PurchaseType[] = [
  { id: 1, name: 'Compra Directa' },
  { id: 2, name: 'Licitación Pública' },
  { id: 3, name: 'Concurso de Proveedores' },
  // Añade más opciones según tus necesidades
];

// Definir el esquema de las filas para validación con Zod
const filaPlanificacionSchema = z.object({
  id: z.string(),
  areaEstrategica: z.string().nonempty("Área Estratégica es requerida"),
  objetivoEstrategico: z.string().nonempty("Objetivo Estratégico es requerido"),
  estrategias: z.array(z.string()).nonempty("Debe seleccionar al menos una estrategia"),
  intervencion: z.array(z.string()).nonempty("Debe seleccionar al menos una intervención"),
  ods: z.array(z.string()),
  tipoEvento: z.enum(['actividad', 'proyecto']),
  evento: z.string().nonempty("El nombre del evento es requerido"),
  objetivo: z.string().nonempty("El objetivo es requerido"),
  fechaInicio: z.date(),
  fechaFin: z.date(),
  costoTotal: z.number().nonnegative("El costo total no puede ser negativo"),
  aporteUMES: z.array(z.object({
    financingSourceId: z.number(),
    porcentaje: z.number().min(0).max(100),
    amount: z.number().nonnegative(),
  })),
  aporteOtros: z.array(z.object({
    financingSourceId: z.number(),
    porcentaje: z.number().min(0).max(100),
    amount: z.number().nonnegative(),
  })),
  tipoCompra: z.array(z.string()),
  detalle: z.any().nullable(),
  responsablePlanificacion: z.string().nonempty("Responsable de planificación es requerido"),
  responsableEjecucion: z.string().nonempty("Responsable de ejecución es requerido"),
  responsableSeguimiento: z.string().nonempty("Responsable de seguimiento es requerido"), // Cambio aquí
  recursos: z.array(z.string()),
  indicadorLogro: z.string().nonempty("El indicador de logro es requerido"),
  detalleProceso: z.any().nullable(),
});

type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>;

interface FilaPlanificacion extends FilaPlanificacionForm {
  estado: 'planificado' | 'aprobado' | 'rechazado';
  comentarioDecano: string;
}

interface FilaError {
  [key: string]: string;
}

export function TablaPlanificacionComponent() {
  const [filas, setFilas] = useState<FilaPlanificacion[]>([]);
  const [strategicAreas, setStrategicAreas] = useState<{ strategicAreaId: number; name: string; peiId: number; isDeleted: boolean }[]>([]);
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([]);
  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [filaErrors, setFilaErrors] = useState<{ [key: string]: FilaError }>({});

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
          return StrategicObjectiveSchema.parse(obj); // Usar el esquema de Zod para parsear
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

  // Función para agregar una nueva fila
  const agregarFila = () => {
    const nuevaFila: FilaPlanificacion = {
      id: Date.now().toString(),
      areaEstrategica: '',
      objetivoEstrategico: '',
      estrategias: [''], // Cambiado de [''] a []
      intervencion: [''], // Cambiado de [''] a []
      ods: [],
      tipoEvento: 'actividad',
      evento: '',
      objetivo: '',
      estado: 'planificado',
      fechaInicio: new Date(),
      fechaFin: new Date(),
      costoTotal: 0,
      aporteUMES: [],
      aporteOtros: [],
      tipoCompra: [],
      detalle: null,
      responsablePlanificacion: '',
      responsableEjecucion: '',
      responsableSeguimiento: '', // Cambio aquí
      recursos: [],
      indicadorLogro: '',
      detalleProceso: null,
      comentarioDecano: '',
    };
    setFilas([...filas, nuevaFila]);
  };

  // Función para eliminar una fila
  const eliminarFila = (id: string) => {
    setFilas(filas.filter(fila => fila.id !== id));
    // Eliminar errores asociados a la fila eliminada
    const updatedErrors = { ...filaErrors };
    delete updatedErrors[id];
    setFilaErrors(updatedErrors);
  };

  // Función para actualizar una fila
  const actualizarFila = (id: string, campo: keyof FilaPlanificacion, valor: any | null) => {
    setFilas(prevFilas =>
      prevFilas.map(fila =>
        fila.id === id ? { ...fila, [campo]: valor } : fila
      )
    );

    // Si el campo actualizado es objetivoEstrategico, actualizar areaEstrategica
    if (campo === 'objetivoEstrategico') {
      const nuevaArea = objetivoToAreaMap[valor] || '';

      setFilas(prevFilas =>
        prevFilas.map(fila =>
          fila.id === id ? { ...fila, areaEstrategica: nuevaArea } : fila
        )
      );

      // Validar la fila actualizada
      const filaActual = filas.find(fila => fila.id === id);
      if (filaActual) {
        const dataToValidate = {
          ...filaActual,
          areaEstrategica: nuevaArea,
          objetivoEstrategico: valor,
        };
        const validation = filaPlanificacionSchema.safeParse(dataToValidate);
        if (!validation.success) {
          const errors: FilaError = {};
          validation.error.errors.forEach(err => {
            const field = err.path[0] as string;
            errors[field] = err.message;
          });
          setFilaErrors(prevErrors => ({ ...prevErrors, [id]: errors }));
        } else {
          // Limpiar errores si la validación es exitosa
          setFilaErrors(prevErrors => ({ ...prevErrors, [id]: {} }));
        }
      }
    }
  };

  // Función para agregar un nuevo objetivo estratégico desde el formulario hijo
  const addStrategicObjective = (createdObjetivo: StrategicObjective) => {
    setStrategicObjectives(prev => [...prev, createdObjetivo]);
    // Actualizar objetivoToAreaMap con el nuevo objetivo
    const area = strategicAreas.find(area => area.strategicAreaId === createdObjetivo.strategicAreaId);
    if (area) {
      setObjetivoToAreaMap(prevMap => ({
        ...prevMap,
        [createdObjetivo.strategicObjectiveId.toString()]: area.name,
      }));
    } else {
      console.warn(`No se encontró Área Estratégica para el nuevo Objetivo Estratégico ID: ${createdObjetivo.strategicObjectiveId}`);
    }
  };

  // Función para enviar una fila al backend
  const enviarActividad = async (id: string) => {
    // Obtener la fila correspondiente
    const fila = filas.find(fila => fila.id === id);
    if (!fila) {
      console.error(`Fila con ID ${id} no encontrada.`);
      return;
    }

    // Validar la fila antes de enviar
    const validation = filaPlanificacionSchema.safeParse(fila);

    if (!validation.success) {
      const errors: FilaError = {};
      validation.error.errors.forEach(err => {
        const field = err.path[0] as string;
        errors[field] = err.message;
      });
      setFilaErrors(prevErrors => ({ ...prevErrors, [id]: errors }));
      alert("Hay errores en la fila. Por favor, revisa los campos.");
      console.error("Error de validación:", validation.error.errors);
      return;
    }

    // Implementar la lógica para enviar la actividad al backend
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
      }

      // Construir el objeto de datos para enviar al backend
      const eventData = {
        name: fila.evento.trim(),
        type: fila.tipoEvento === 'actividad' ? 'Actividad' : 'Proyecto',
        poaId: 1, // Reemplaza con el ID de POA correspondiente
        statusId: 1, // Reemplaza con el ID de estado correspondiente
        completionPercentage: 50, // Ajusta según tu lógica
        campusId: 1, // Reemplaza con el ID de campus correspondiente
        objective: fila.objetivo.trim(),
        eventNature: 'Planificado', // Ajusta según tu lógica
        isDelayed: false, // Ajusta según tu lógica
        achievementIndicator: fila.indicadorLogro.trim(),
        purchaseType: fila.tipoCompra.map((typeId) => {
          const tipo = initialOptions.find((opt) => opt.id === parseInt(typeId, 10));
          return tipo ? tipo.name : typeId; // Asegura que se envíen los nombres correctos
        }).join(', ').trim(),
        totalCost: fila.costoTotal,
        dates: [
          {
            startDate: fila.fechaInicio.toISOString().split('T')[0],
            endDate: fila.fechaFin.toISOString().split('T')[0],
          }
        ],
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
            responsibleRole: 'Ejecución', // Eliminado el acento
            name: fila.responsableEjecucion.trim(),
          },
          {
            responsibleRole: 'Seguimiento',
            name: fila.responsableSeguimiento.trim(),
          },
        ],
        interventions: fila.intervencion.map(id => parseInt(id, 10)).filter(id => !isNaN(id)), // Asegura que sean números válidos
      };

      console.log('Datos a enviar:', eventData);

      // Crear un FormData para enviar archivos
      const formData = new FormData();
      formData.append('data', JSON.stringify(eventData));

      // Adjuntar archivos si existen
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

      // Opcional: Actualizar el estado de la fila, por ejemplo, cambiar el estado a 'aprobado'
      setFilas(prevFilas =>
        prevFilas.map(filaItem =>
          filaItem.id === id ? { ...filaItem, estado: 'aprobado' } : filaItem
        )
      );

      // Limpiar errores si la actividad se envió correctamente
      setFilaErrors(prevErrors => ({ ...prevErrors, [id]: {} }));
    } catch (err) {
      console.error(err);
      alert(`Error al enviar la actividad: ${(err as Error).message}`);
    }
  };

  if (loading) return <div>Cargando áreas estratégicas y objetivos estratégicos...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Área Estratégica</TableHead>
            <TableHead>Objetivo Estratégico</TableHead>
            <TableHead>Estrategias</TableHead>
            <TableHead>Intervención</TableHead>
            <TableHead>ODS</TableHead>
            <TableHead>Tipo de Evento</TableHead>
            <TableHead>Evento</TableHead>
            <TableHead>Objetivo</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Fechas</TableHead>
            <TableHead>Costo Total</TableHead>
            <TableHead>Aporte UMES</TableHead>
            <TableHead>Aporte Otros</TableHead>
            <TableHead>Tipo de Compra</TableHead>
            <TableHead>Detalle</TableHead>
            <TableHead>Responsables</TableHead>
            <TableHead>Recursos</TableHead>
            <TableHead>Indicador de Logro</TableHead>
            <TableHead>Detalle Proceso</TableHead>
            <TableHead>Comentario Decano</TableHead>
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
              : 0; // Ajusta según tu lógica

            return (
              <TableRow key={fila.id}>
                <TableCell>
                  <AreaEstrategicaComponent
                    areaEstrategica={fila.areaEstrategica}
                    error={filaErrors[fila.id]?.areaEstrategica}
                  />
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
                    strategicObjectiveId={strategicObjectiveId} // Asegurado
                  />
                </TableCell>
                <TableCell>
                  <IntervencionesSelectorComponent
                    selectedIntervenciones={fila.intervencion}
                    onSelectIntervencion={(intervenciones) => actualizarFila(fila.id, 'intervencion', intervenciones)}
                  />
                </TableCell>
                <TableCell>
                  <OdsSelector
                    selectedODS={fila.ods}
                    onSelectODS={(ods) => actualizarFila(fila.id, 'ods', ods)}
                  />
                </TableCell>
                <TableCell>
                  <ActividadProyectoSelector
                    selectedOption={fila.tipoEvento}
                    onSelectOption={(tipo) => actualizarFila(fila.id, 'tipoEvento', tipo)}
                  />
                </TableCell>
                <TableCell>
                  <EventoComponent
                    value={fila.evento}
                    onChange={(value) => actualizarFila(fila.id, 'evento', value)}
                  />
                </TableCell>
                <TableCell>
                  <ObjetivoComponent
                    value={fila.objetivo}
                    onChange={(value) => actualizarFila(fila.id, 'objetivo', value)}
                  />
                </TableCell>
                <TableCell>
                  <EstadoComponent estado={fila.estado} />
                </TableCell>
                <TableCell>
                  <FechasSelectorComponent
                    fechaInicio={fila.fechaInicio}
                    fechaFin={fila.fechaFin}
                    onChangeFechaInicio={(fecha: Date | null) => actualizarFila(fila.id, 'fechaInicio', fecha)}
                    onChangeFechaFin={(fecha: Date | null) => actualizarFila(fila.id, 'fechaFin', fecha)}
                  />
                </TableCell>
                <TableCell>
                  <CurrencyInput
                    value={fila.costoTotal}
                    onChange={(valor: number | undefined) => actualizarFila(fila.id, 'costoTotal', valor ?? 0)}
                  />
                </TableCell>
                <TableCell>
                  <AporteUmes
                    aportes={fila.aporteUMES}
                    onChangeAportes={(aportes) => actualizarFila(fila.id, 'aporteUMES', aportes)}
                  />
                </TableCell>

                <TableCell>
                  <AporteOtrasFuentesComponent
                    aportes={fila.aporteOtros}
                    onChangeAportes={(aportes) => actualizarFila(fila.id, 'aporteOtros', aportes)}
                  /> 
                </TableCell>

                <TableCell>
                  <TipoDeCompraComponent
                    selectedTypes={fila.tipoCompra}
                    onSelectTypes={(tipos) => actualizarFila(fila.id, 'tipoCompra', tipos)}
                  />
                </TableCell>
                <TableCell>
                  <DetalleComponent
                    file={fila.detalle}
                    onFileChange={(file) => actualizarFila(fila.id, 'detalle', file)}
                  />
                </TableCell>
                <TableCell>
                  <ResponsablesComponent
                    responsablePlanificacion={fila.responsablePlanificacion}
                    responsableEjecucion={fila.responsableEjecucion}
                    responsableSeguimiento={fila.responsableSeguimiento} // Cambio aquí
                    onChangeResponsablePlanificacion={(value: string) => actualizarFila(fila.id, 'responsablePlanificacion', value)}
                    onChangeResponsableEjecucion={(value: string) => actualizarFila(fila.id, 'responsableEjecucion', value)}
                    onChangeResponsableSeguimiento={(value: string) => actualizarFila(fila.id, 'responsableSeguimiento', value)} // Cambio aquí
                  />
                </TableCell>
                <TableCell>
                  <RecursosSelectorComponent
                    selectedRecursos={fila.recursos}
                    onSelectRecursos={(recursos) => actualizarFila(fila.id, 'recursos', recursos)}
                  />
                </TableCell>
                <TableCell>
                  <IndicadorLogroComponent
                    value={fila.indicadorLogro}
                    onChange={(value: string) => actualizarFila(fila.id, 'indicadorLogro', value)}
                  />
                </TableCell>
                <TableCell>
                  <DetalleProcesoComponent
                    file={fila.detalleProceso}
                    onFileChange={(file) => actualizarFila(fila.id, 'detalleProceso', file)}
                  />
                </TableCell>
                <TableCell>
                  <ComentarioDecanoComponent comentario={fila.comentarioDecano} />
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
    </div>
  );
}
