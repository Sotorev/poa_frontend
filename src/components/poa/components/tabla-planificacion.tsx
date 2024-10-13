// src/components/poa/components/tabla-planificacion.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Trash2, Send } from 'lucide-react'
import { ObjetivosEstrategicosSelectorComponent } from './columns/objetivos-estrategicos-selector'
import { EstrategiasSelectorComponent } from './columns/estrategias-selector'
import { IntervencionesSelectorComponent } from './columns/intervenciones-selector'
import { OdsSelector } from './columns/ods-selector'
import { ActividadProyectoSelector } from './columns/actividad-proyecto-selector'
import CurrencyInput from './columns/currency-input'
import { AporteUmes } from './columns/aporte-umes'
import { AporteOtrasFuentesComponent } from './columns/aporte-otras-fuentes'
import { TipoDeCompraComponent } from './columns/tipo-de-compra'
import { RecursosSelectorComponent } from './columns/recursos-selector'
import { DetalleProcesoComponent } from './columns/detalle-proceso'
import { DetalleComponent } from './columns/detalle'
import { FechasSelectorComponent } from './columns/fechas-selector'
import { z } from 'zod'

import { strategicAreasSchema } from '@/schemas/strategicAreaSchema'
import { StrategicObjectiveSchema, StrategicObjective } from '@/schemas/strategicObjectiveSchema' // Corregido: Importar el esquema de Zod

// Definir el esquema de las filas para validación con Zod
const filaPlanificacionSchema = z.object({
  id: z.string(),
  areaEstrategica: z.string().nonempty("Área Estratégica es requerida"),
  objetivoEstrategico: z.string().nonempty("Objetivo Estratégico es requerido"),
  // Puedes añadir más validaciones según sea necesario
});

type FilaPlanificacionForm = z.infer<typeof filaPlanificacionSchema>;

interface FilaPlanificacion {
  id: string
  areaEstrategica: string
  objetivoEstrategico: string
  estrategias: string[]
  intervencion: string[]
  ods: string[]
  tipoEvento: 'actividad' | 'proyecto'
  evento: string
  objetivo: string
  estado: 'planificado' | 'aprobado' | 'rechazado'
  fechaInicio: Date | null
  fechaFin: Date | null
  costoTotal: number
  aporteUMES: { fuente: string; porcentaje: number }[]
  aporteOtros: { fuente: string; porcentaje: number }[]
  tipoCompra: string[]
  detalle: File | null
  responsablePlanificacion: string
  responsableEjecucion: string
  responsableFinalizacion: string
  recursos: string[]
  indicadorLogro: string
  detalleProceso: File | null
  comentarioDecano: string
}

// Definir un tipo para errores por fila
interface FilaError {
  areaEstrategica?: string
  objetivoEstrategico?: string
  // Añadir más campos según sea necesario
}

export function TablaPlanificacionComponent() {
  const [filas, setFilas] = useState<FilaPlanificacion[]>([])
  const [strategicAreas, setStrategicAreas] = useState<{ strategicAreaId: number; name: string; peiId: number; isDeleted: boolean }[]>([])
  const [strategicObjectives, setStrategicObjectives] = useState<StrategicObjective[]>([])
  const [objetivoToAreaMap, setObjetivoToAreaMap] = useState<{ [key: string]: string }>({})
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [filaErrors, setFilaErrors] = useState<{ [key: string]: FilaError }>({})

  // Fetch de áreas estratégicas y objetivos estratégicos al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (!process.env.NEXT_PUBLIC_API_URL) {
          throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
        }

        // Fetch strategic areas
        const responseAreas = await fetch(`${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/strategicareas`)
        if (!responseAreas.ok) {
          throw new Error(`Error al fetch strategic areas: ${responseAreas.statusText}`)
        }
        const dataAreas = await responseAreas.json()
        const parsedAreas = strategicAreasSchema.parse(dataAreas)
        const activeAreas = parsedAreas.filter((area) => !area.isDeleted)
        setStrategicAreas(activeAreas)

        // Fetch strategic objectives
        const responseObjectives = await fetch(`${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/strategicobjectives`)
        if (!responseObjectives.ok) {
          throw new Error(`Error al fetch strategic objectives: ${responseObjectives.statusText}`)
        }
        const dataObjectives = await responseObjectives.json()
        const parsedObjectives = dataObjectives.map((obj: any) => {
          return StrategicObjectiveSchema.parse(obj) // Corregido: Usar el esquema de Zod para parsear
        }).filter((obj: StrategicObjective) => !obj.isDeleted)
        setStrategicObjectives(parsedObjectives)

        // Build objetivoToAreaMap
        const map: { [key: string]: string } = {}
        parsedObjectives.forEach((obj: StrategicObjective) => {
          const area = activeAreas.find(area => area.strategicAreaId === obj.strategicAreaId)
          if (area) {
            map[obj.strategicObjectiveId.toString()] = area.name
          } else {
            console.warn(`No se encontró Área Estratégica para el Objetivo Estratégico ID: ${obj.strategicObjectiveId}`)
          }
        })
        setObjetivoToAreaMap(map)
      } catch (err) {
        if (err instanceof z.ZodError) {
          setError("Error en la validación de datos de áreas estratégicas u objetivos estratégicos.")
          console.error(err.errors)
        } else {
          setError((err as Error).message)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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
      fechaInicio: null,
      fechaFin: null,
      costoTotal: 0,
      aporteUMES: [],
      aporteOtros: [],
      tipoCompra: [],
      detalle: null,
      responsablePlanificacion: '',
      responsableEjecucion: '',
      responsableFinalizacion: '',
      recursos: [],
      indicadorLogro: '',
      detalleProceso: null,
      comentarioDecano: ''
    }
    setFilas([...filas, nuevaFila])
  }

  // Función para eliminar una fila
  const eliminarFila = (id: string) => {
    setFilas(filas.filter(fila => fila.id !== id))
    // Eliminar errores asociados a la fila eliminada
    const updatedErrors = { ...filaErrors }
    delete updatedErrors[id]
    setFilaErrors(updatedErrors)
  }

  // Función para actualizar una fila
  const actualizarFila = (id: string, campo: keyof FilaPlanificacion, valor: any) => {
    setFilas(prevFilas => 
      prevFilas.map(fila => 
        fila.id === id ? { ...fila, [campo]: valor } : fila
      )
    )

    // Si el campo actualizado es objetivoEstrategico, actualizar areaEstrategica
    if (campo === 'objetivoEstrategico') {
      const nuevaArea = objetivoToAreaMap[valor] || ''
      
      setFilas(prevFilas => 
        prevFilas.map(fila => 
          fila.id === id ? { ...fila, areaEstrategica: nuevaArea } : fila
        )
      )

      // Validar la fila actualizada
      const dataToValidate = {
        id: id,
        areaEstrategica: nuevaArea,
        objetivoEstrategico: valor
      }
      const validation = filaPlanificacionSchema.safeParse(dataToValidate)
      if (!validation.success) {
        const errors: FilaError = {}
        validation.error.errors.forEach(err => {
          if (err.path[0] === 'areaEstrategica') {
            errors.areaEstrategica = err.message
          }
          if (err.path[0] === 'objetivoEstrategico') {
            errors.objetivoEstrategico = err.message
          }
          // Añadir más campos si es necesario
        })
        setFilaErrors(prevErrors => ({ ...prevErrors, [id]: errors }))
      } else {
        // Limpiar errores si la validación es exitosa
        setFilaErrors(prevErrors => ({ ...prevErrors, [id]: {} }))
      }
    }
  }

  // Función para agregar un nuevo objetivo estratégico desde el formulario hijo
  const addStrategicObjective = (createdObjetivo: StrategicObjective) => {
    setStrategicObjectives(prev => [...prev, createdObjetivo])
    // Actualizar objetivoToAreaMap con el nuevo objetivo
    const area = strategicAreas.find(area => area.strategicAreaId === createdObjetivo.strategicAreaId)
    if (area) {
      setObjetivoToAreaMap(prevMap => ({
        ...prevMap,
        [createdObjetivo.strategicObjectiveId.toString()]: area.name
      }))
    } else {
      console.warn(`No se encontró Área Estratégica para el nuevo Objetivo Estratégico ID: ${createdObjetivo.strategicObjectiveId}`)
    }
  }

  // Función para enviar una fila al backend
  const enviarActividad = async (id: string) => {
    // Obtener la fila correspondiente
    const fila = filas.find(fila => fila.id === id)
    if (!fila) {
      console.error(`Fila con ID ${id} no encontrada.`)
      return
    }

    // Validar la fila antes de enviar
    const validation = filaPlanificacionSchema.safeParse({
      id: fila.id,
      areaEstrategica: fila.areaEstrategica,
      objetivoEstrategico: fila.objetivoEstrategico,
      // Añade más campos si es necesario para la validación
    })

    if (!validation.success) {
      const errors: FilaError = {}
      validation.error.errors.forEach(err => {
        if (err.path[0] === 'areaEstrategica') {
          errors.areaEstrategica = err.message
        }
        if (err.path[0] === 'objetivoEstrategico') {
          errors.objetivoEstrategico = err.message
        }
        // Añadir más campos si es necesario
      })
      setFilaErrors(prevErrors => ({ ...prevErrors, [id]: errors }))
      alert("Hay errores en la fila. Por favor, revisa los campos.")
      console.error("Error de validación:", validation.error.errors)
      return
    }

    // Implementar la lógica para enviar la actividad al backend
    try {
      if (!process.env.NEXT_PUBLIC_API_URL) {
        throw new Error("NEXT_PUBLIC_API_URL no está definido en las variables de entorno.");
      }
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, "")}/api/activities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(fila)
      })

      if (!response.ok) {
        throw new Error(`Error al enviar la actividad: ${response.statusText}`)
      }

      const result = await response.json()
      console.log(`Actividad enviada exitosamente:`, result)
      // Opcional: Actualizar el estado de la fila, por ejemplo, cambiar el estado a 'aprobado'
      setFilas(prevFilas => 
        prevFilas.map(filaItem => 
          filaItem.id === id ? { ...filaItem, estado: 'aprobado' } : filaItem
        )
      )
      // Limpiar errores si la actividad se envió correctamente
      setFilaErrors(prevErrors => ({ ...prevErrors, [id]: {} }))
    } catch (err) {
      console.error(err)
      alert(`Error al enviar la actividad: ${(err as Error).message}`)
    }
  }

  if (loading) return <div>Cargando áreas estratégicas y objetivos estratégicos...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

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
          {filas.map((fila) => (
            <TableRow key={fila.id}>
              <TableCell>
                {/* Área Estratégica (read-only) */}
                <Input 
                  value={fila.areaEstrategica} 
                  readOnly
                  className={filaErrors[fila.id]?.areaEstrategica ? "border-red-500" : ""}
                />
                {/* Mostrar error si existe */}
                {filaErrors[fila.id]?.areaEstrategica && <span className="text-red-500 text-sm">{filaErrors[fila.id].areaEstrategica}</span>}
              </TableCell>
              <TableCell>
                <ObjetivosEstrategicosSelectorComponent 
                  selectedObjetivos={[fila.objetivoEstrategico]}
                  onSelectObjetivo={(objetivo) => actualizarFila(fila.id, 'objetivoEstrategico', objetivo)}
                  strategicObjectives={strategicObjectives}
                  addStrategicObjective={addStrategicObjective}
                />
                {/* Mostrar error si existe */}
                {filaErrors[fila.id]?.objetivoEstrategico && <span className="text-red-500 text-sm">{filaErrors[fila.id].objetivoEstrategico}</span>}
              </TableCell>
              <TableCell>
                <EstrategiasSelectorComponent 
                  selectedEstrategias={fila.estrategias}
                  onSelectEstrategia={(estrategias) => actualizarFila(fila.id, 'estrategias', estrategias)}
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
                <Input 
                  value={fila.evento} 
                  onChange={(e) => actualizarFila(fila.id, 'evento', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={fila.objetivo} 
                  onChange={(e) => actualizarFila(fila.id, 'objetivo', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <Label>{fila.estado}</Label>
              </TableCell>
              <TableCell>
                <FechasSelectorComponent 
                  fechaInicio={fila.fechaInicio}
                  fechaFin={fila.fechaFin}
                  onChangeFechaInicio={(fecha) => actualizarFila(fila.id, 'fechaInicio', fecha)}
                  onChangeFechaFin={(fecha) => actualizarFila(fila.id, 'fechaFin', fecha)}
                />
              </TableCell>
              <TableCell>
                <CurrencyInput 
                  value={fila.costoTotal}
                  onChange={(valor) => actualizarFila(fila.id, 'costoTotal', valor)}
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
                <div className="space-y-2">
                  <Input 
                    placeholder="Responsable Planificación"
                    value={fila.responsablePlanificacion} 
                    onChange={(e) => actualizarFila(fila.id, 'responsablePlanificacion', e.target.value)}
                  />
                  <Input 
                    placeholder="Responsable Ejecución"
                    value={fila.responsableEjecucion} 
                    onChange={(e) => actualizarFila(fila.id, 'responsableEjecucion', e.target.value)}
                  />
                  <Input 
                    placeholder="Responsable Finalización"
                    value={fila.responsableFinalizacion} 
                    onChange={(e) => actualizarFila(fila.id, 'responsableFinalizacion', e.target.value)}
                  />
                </div>
              </TableCell>
               <TableCell>
                <RecursosSelectorComponent 
                  selectedRecursos={fila.recursos}
                  onSelectRecursos={(recursos) => actualizarFila(fila.id, 'recursos', recursos)}
                />
              </TableCell>
              <TableCell>
                <Input 
                  value={fila.indicadorLogro} 
                  onChange={(e) => actualizarFila(fila.id, 'indicadorLogro', e.target.value)}
                />
              </TableCell>
              <TableCell>
                <DetalleProcesoComponent 
                  file={fila.detalleProceso}
                  onFileChange={(file) => actualizarFila(fila.id, 'detalleProceso', file)}
                />
              </TableCell>
              <TableCell>
                <Label>{fila.comentarioDecano}</Label>
              </TableCell>
              <TableCell>
                <div className="flex flex-col space-y-2">
                  <Button variant="destructive" onClick={() => eliminarFila(fila.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" onClick={() => enviarActividad(fila.id)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={agregarFila} className="mt-4">Agregar Fila</Button>
    </div>
  )
}
