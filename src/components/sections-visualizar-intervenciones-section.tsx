"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { CalendarIcon, ChevronDown, ChevronUp, Edit, Info, Plus, Trash2 } from 'lucide-react'

interface SectionProps {
  name: string
  isActive: boolean
}

interface Intervencion {
  id: string
  ods: string[]
  areaEstrategica: string
  objetivoEstrategico: string
  estrategias: string[]
  intervencion: string
  tipoIniciativa: 'actividad' | 'proyecto'
  iniciativa: string
  objetivo: string
  estado: 'revision' | 'aprobado'
  fechaInicio: Date
  fechaFin: Date
  costos: {
    total: number
    aporte: {
      umes: number
      otraFuente: number
    }
    tipoCompra: string
    detalles: string
  }
  responsables: {
    planificacion: string[]
    ejecucion: string[]
    finalizacion: string[]
  }
  recursos: string[]
  indicadorLogro: string
  comentario: string
}

export function VisualizarIntervencionesSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([])
  const [filtroFechaInicio, setFiltroFechaInicio] = useState<Date | undefined>(undefined)
  const [filtroFechaFin, setFiltroFechaFin] = useState<Date | undefined>(undefined)
  const [filtroArea, setFiltroArea] = useState<string>('')
  const [filtroEstrategia, setFiltroEstrategia] = useState<string>('')
  const [modoRegistro, setModoRegistro] = useState<'tabla' | 'formulario'>('tabla')
  const [nuevaIntervencion, setNuevaIntervencion] = useState<Intervencion>({
    id: '',
    ods: [],
    areaEstrategica: '',
    objetivoEstrategico: '',
    estrategias: [],
    intervencion: '',
    tipoIniciativa: 'actividad',
    iniciativa: '',
    objetivo: '',
    estado: 'revision',
    fechaInicio: new Date(),
    fechaFin: new Date(),
    costos: {
      total: 0,
      aporte: {
        umes: 0,
        otraFuente: 0
      },
      tipoCompra: '',
      detalles: ''
    },
    responsables: {
      planificacion: [],
      ejecucion: [],
      finalizacion: []
    },
    recursos: [],
    indicadorLogro: '',
    comentario: ''
  })

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setIsEditing(false)
    // Aquí iría la lógica para guardar los datos en el backend
  }

  const handleAddIntervencion = () => {
    setIntervenciones([...intervenciones, { ...nuevaIntervencion, id: Date.now().toString() }])
    // Reset nueva intervención
    setNuevaIntervencion({
      id: '',
      ods: [],
      areaEstrategica: '',
      objetivoEstrategico: '',
      estrategias: [],
      intervencion: '',
      tipoIniciativa: 'actividad',
      iniciativa: '',
      objetivo: '',
      estado: 'revision',
      fechaInicio: new Date(),
      fechaFin: new Date(),
      costos: {
        total: 0,
        aporte: {
          umes: 0,
          otraFuente: 0
        },
        tipoCompra: '',
        detalles: ''
      },
      responsables: {
        planificacion: [],
        ejecucion: [],
        finalizacion: []
      },
      recursos: [],
      indicadorLogro: '',
      comentario: ''
    })
  }

  const handleRemoveIntervencion = (id: string) => {
    setIntervenciones(intervenciones.filter(intervencion => intervencion.id !== id))
  }

  const filteredIntervenciones = intervenciones.filter(intervencion => {
    const cumpleFechaInicio = filtroFechaInicio ? intervencion.fechaInicio >= filtroFechaInicio : true
    const cumpleFechaFin = filtroFechaFin ? intervencion.fechaFin <= filtroFechaFin : true
    const cumpleArea = filtroArea ? intervencion.areaEstrategica === filtroArea : true
    const cumpleEstrategia = filtroEstrategia ? intervencion.estrategias.includes(filtroEstrategia) : true
    return cumpleFechaInicio && cumpleFechaFin && cumpleArea && cumpleEstrategia
  })

  const renderColumnInfo = (title: string, content: string) => (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Info className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <h3 className="font-semibold">{title}</h3>
        <p>{content}</p>
      </PopoverContent>
    </Popover>
  )

  const renderTabla = () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ODS {renderColumnInfo("ODS", "Objetivos de Desarrollo Sostenible")}</TableHead>
          <TableHead>Área Estratégica</TableHead>
          <TableHead>Objetivo Estratégico</TableHead>
          <TableHead>Estrategias</TableHead>
          <TableHead>Intervención</TableHead>
          <TableHead>Tipo de Iniciativa</TableHead>
          <TableHead>Iniciativa</TableHead>
          <TableHead>Objetivo</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Fechas</TableHead>
          <TableHead>Costos</TableHead>
          <TableHead>Responsables</TableHead>
          <TableHead>Recursos</TableHead>
          <TableHead>Indicador de Logro</TableHead>
          <TableHead>Comentario</TableHead>
          {isEditing && <TableHead>Acciones</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredIntervenciones.map(intervencion => (
          <TableRow key={intervencion.id}>
            <TableCell>{intervencion.ods.join(', ')}</TableCell>
            <TableCell>{intervencion.areaEstrategica}</TableCell>
            <TableCell>{intervencion.objetivoEstrategico}</TableCell>
            <TableCell>{intervencion.estrategias.join(', ')}</TableCell>
            <TableCell>{intervencion.intervencion}</TableCell>
            <TableCell>{intervencion.tipoIniciativa}</TableCell>
            <TableCell>{intervencion.iniciativa}</TableCell>
            <TableCell>{intervencion.objetivo}</TableCell>
            <TableCell>{intervencion.estado}</TableCell>
            <TableCell>{`${format(intervencion.fechaInicio, 'dd/MM/yyyy')} - ${format(intervencion.fechaFin, 'dd/MM/yyyy')}`}</TableCell>
            <TableCell>{`Total: $${intervencion.costos.total}`}</TableCell>
            <TableCell>{`Planificación: ${intervencion.responsables.planificacion.join(', ')}`}</TableCell>
            <TableCell>{intervencion.recursos.join(', ')}</TableCell>
            <TableCell>{intervencion.indicadorLogro}</TableCell>
            <TableCell>{intervencion.comentario}</TableCell>
            {isEditing && (
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveIntervencion(intervencion.id)}
                  aria-label={`Eliminar intervención ${intervencion.id}`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )

  const renderFormulario = () => (
    <form onSubmit={(e) => { e.preventDefault(); handleAddIntervencion(); }} className="space-y-4">
      {/* ... resto del formulario ... */}
      <div>
        <label  className="block text-sm font-medium text-gray-700">Fecha de Inicio</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-[280px] justify-start text-left font-normal ${
                !nuevaIntervencion.fechaInicio && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {nuevaIntervencion.fechaInicio ? format(nuevaIntervencion.fechaInicio, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={nuevaIntervencion.fechaInicio}
              onSelect={(date) => date && setNuevaIntervencion({...nuevaIntervencion, fechaInicio: date})}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Fecha de Fin</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={`w-[280px] justify-start text-left font-normal ${
                !nuevaIntervencion.fechaFin && "text-muted-foreground"
              }`}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {nuevaIntervencion.fechaFin ? format(nuevaIntervencion.fechaFin, "PPP", { locale: es }) : <span>Seleccione una fecha</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={nuevaIntervencion.fechaFin}
              onSelect={(date) => date && setNuevaIntervencion({...nuevaIntervencion, fechaFin: date})}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      {/* ... resto del formulario ... */}
    </form>
  )

  return (
    <div id={name} className="mb-6">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <div className="p-4 bg-green-50 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="mb-4 flex flex-wrap gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[280px] justify-start text-left font-normal ${
                      !filtroFechaInicio && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroFechaInicio ? format(filtroFechaInicio, "PPP", { locale: es }) : <span>Fecha Inicio</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtroFechaInicio}
                    onSelect={setFiltroFechaInicio}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`w-[280px] justify-start text-left font-normal ${
                      !filtroFechaFin && "text-muted-foreground"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filtroFechaFin ? format(filtroFechaFin, "PPP", { locale: es }) : <span>Fecha Fin</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={filtroFechaFin}
                    onSelect={setFiltroFechaFin}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {/* ... otros filtros y selectores ... */}
            </div>
            {modoRegistro === 'tabla' ? renderTabla() : renderFormulario()}
            {isEditing && (
              <Button onClick={handleSave} className="mt-4">
                Guardar Cambios
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
