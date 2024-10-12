'use client'

import React, { useState } from 'react'
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
import AreaEstrategicaForm from './columns/AreaEstrategicaForm' // Importa el nuevo componente
import { useStrategicAreas } from '@/hooks/useStrategicAreas'

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

// Mapping of strategic objectives to strategic areas
const objetivoToAreaMap: { [key: string]: string } = {
  "obj1": "Área Estratégica 1",
  "obj2": "Área Estratégica 2",
  "obj3": "Área Estratégica 3",
  "obj4": "Área Estratégica 4",
  "obj5": "Área Estratégica 5",
  // Add more mappings as needed
}

export function TablaPlanificacionComponent() {
  const [filas, setFilas] = useState<FilaPlanificacion[]>([])

  const { areas, loading, error } = useStrategicAreas()

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

  const eliminarFila = (id: string) => {
    setFilas(filas.filter(fila => fila.id !== id))
  }

  const actualizarFila = (id: string, campo: keyof FilaPlanificacion, valor: any) => {
    setFilas(prevFilas => prevFilas.map(fila => 
      fila.id === id ? { ...fila, [campo]: valor } : fila
    ))

    // If the updated field is objetivoEstrategico, update areaEstrategica
    if (campo === 'objetivoEstrategico') {
      setFilas(prevFilas => prevFilas.map(fila => 
        fila.id === id ? { ...fila, areaEstrategica: objetivoToAreaMap[valor] || '' } : fila
      ))
    }
  }

  const actualizarAreaEstrategica = (id: string, value: string) => {
    setFilas(prevFilas => prevFilas.map(fila => 
      fila.id === id ? { ...fila, areaEstrategica: value } : fila
    ))
  }

  const enviarActividad = (id: string) => {
    const fila = filas.find(fila => fila.id === id)
    if (!fila) return

    // Validar antes de enviar
    // Aquí puedes usar Zod para validar toda la fila o solo el área estratégica
    // Por simplicidad, validaremos solo el área estratégica
    // Asegúrate de importar strategicAreaSchema schemas/strategicAreaSchema
    import('../../../schemas/strategicAreaSchema').then(({ strategicAreaSchema }) => {
      const result = strategicAreaSchema.safeParse({ areaEstrategica: fila.areaEstrategica })
      if (!result.success) {
        console.error(result.error.errors)
        alert('Error en el Área Estratégica: ' + result.error.errors[0].message)
        return
      }

      // Si la validación es exitosa, envía los datos al backend
      // Aquí debes implementar la lógica para enviar la actividad al backend
      // Por ejemplo, usando axios:
      import('axios').then(({ default: axios }) => {
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/actividades`, fila)
          .then(response => {
            console.log('Actividad enviada con éxito:', response.data)
            // Opcional: actualizar el estado de la fila, mostrar notificaciones, etc.
          })
          .catch(err => {
            console.error('Error al enviar la actividad:', err)
            alert('Error al enviar la actividad')
          })
      })
    })
  }

  if (loading) return <div>Cargando áreas estratégicas...</div>
  if (error) return <div>{error}</div>

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
                <AreaEstrategicaForm
                  id={fila.id}
                  areas={areas}
                  currentValue={fila.areaEstrategica}
                  onSave={actualizarAreaEstrategica}
                />
              </TableCell>
              <TableCell>
                <ObjetivosEstrategicosSelectorComponent 
                  selectedObjetivos={[fila.objetivoEstrategico]}
                  onSelectObjetivo={(objetivo) => actualizarFila(fila.id, 'objetivoEstrategico', objetivo)}
                />
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
