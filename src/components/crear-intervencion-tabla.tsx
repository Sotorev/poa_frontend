'use client'

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { PlusCircle, Info, Calendar, Check, ChevronsUpDown } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Define the possible field paths for handleChange
type IntervencionField =
  | 'ods'
  | 'areaEstrategica'
  | 'objetivoEstrategico'
  | 'estrategias'
  | 'intervencion'
  | 'tipoIniciativa'
  | 'iniciativa'
  | 'objetivo'
  | 'estado'
  | 'fechaInicio'
  | 'fechaFin'
  | 'fechasActividad'
  | 'costos.total'
  | 'costos.aporte.umes.tipo'
  | 'costos.aporte.umes.porcentaje'
  | 'costos.aporte.otraFuente.tipo'
  | 'costos.aporte.otraFuente.porcentaje'
  | 'costos.tipoCompra'
  | 'costos.detallesPdf'
  | 'responsables.planificacion'
  | 'responsables.ejecucion'
  | 'responsables.finalizacion'
  | 'recursos'
  | 'departamentosNecesarios'
  | 'indicadorLogro'
  | 'comentarioDecano'

// ODS Options
const odsOptions = [
  "ODS 1: Fin de la pobreza",
  "ODS 2: Hambre cero",
  "ODS 3: Salud y bienestar",
  "ODS 4: Educación de calidad"
  // Add more ODS options as needed
]

// Áreas Estratégicas
const areasEstrategicas = [
  "Docencia",
  "Investigación",
  "Extensión",
  "Gestión"
]

// Objetivos Estratégicos
const objetivosEstrategicos = [
  { id: 1, objetivo: "Mejorar la calidad académica", area: "Docencia" },
  { id: 2, objetivo: "Fortalecer la investigación", area: "Investigación" },
  { id: 3, objetivo: "Ampliar la proyección social", area: "Extensión" },
  { id: 4, objetivo: "Optimizar la gestión administrativa", area: "Gestión" },
]

// Estrategias
const estrategiasList = [
  "Implementar nuevas metodologías de enseñanza",
  "Aumentar la producción científica",
  "Desarrollar programas de vinculación comunitaria",
  "Mejorar los procesos administrativos",
]

// Tipos de Iniciativa
const tiposIniciativa = ["actividad", "proyecto"]

// Tipos de Compra
const tiposCompra = ["cotización", "compra directa", "financiamiento", "otros", "NA"]

// Tipos de Aporte UMES
const tiposAporteUmes = ["presupuesto anual", "presupuesto por facultad", "otros"]

// Departamentos
const departamentos = ["publicidad", "pastoral", "coro", "estudiantina"]

// Intervencion Interface
interface Intervencion {
  id: string;
  ods: string[];
  areaEstrategica: string;
  objetivoEstrategico: string;
  estrategias: string[];
  intervencion: string;
  tipoIniciativa: 'actividad' | 'proyecto';
  iniciativa: string;
  objetivo: string;
  estado: 'revision' | 'aprobado' | 'rechazado';
  fechaInicio: Date | null;
  fechaFin: Date | null;
  fechasActividad: { inicio: Date | null; fin: Date | null }[];
  costos: {
    total: number;
    aporte: {
      umes: {
        tipo: string;
        porcentaje: number;
      };
      otraFuente: {
        tipo: string;
        porcentaje: number;
      };
    };
    tipoCompra: string;
    detallesPdf: File | null;
  };
  responsables: {
    planificacion: string[];
    ejecucion: string[];
    finalizacion: string[];
  };
  recursos: string[];
  departamentosNecesarios: string[];
  indicadorLogro: string;
  comentarioDecano: string;
}

// Función auxiliar para actualizaciones inmutables
function updateNestedState(obj: any, path: string[], value: any): any {
  if (path.length === 1) {
    return {
      ...obj,
      [path[0]]: value,
    };
  } else {
    const key = path[0]
    return {
      ...obj,
      [key]: updateNestedState(obj[key], path.slice(1), value),
    };
  }
}

// DatePicker Component
function DatePicker({
  selected,
  onSelect,
  placeholderText
}: {
  selected: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  placeholderText: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={`w-[200px] justify-start text-left font-normal ${!selected && "text-muted-foreground"}`}
        >
          <Calendar className="mr-2 h-4 w-4" />
          {selected ? format(selected, "PPP") : <span>{placeholderText}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarComponent
          mode="single"
          selected={selected}
          onSelect={onSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

// MultiSelect Component
function MultiSelect({
  options,
  selected,
  onChange,
  placeholder
}: {
  options: string[];
  selected: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selected.length > 0
            ? `${selected.length} seleccionados`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder={`Buscar ${placeholder.toLowerCase()}...`} />
          <CommandEmpty>No se encontraron resultados.</CommandEmpty>
          <CommandGroup>
            {options.map((option) => (
              <CommandItem
                key={option}
                value={option}
                onSelect={(currentValue) => {
                  onChange(
                    selected.includes(currentValue)
                      ? selected.filter((item) => item !== currentValue)
                      : [...selected, currentValue]
                  )
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selected.includes(option) ? "opacity-100" : "opacity-0"
                  )}
                />
                {option}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

// HeaderWithTooltip Component
function HeaderWithTooltip({ title, tooltip }: { title: string; tooltip: string }) {
  return (
    <th className="border border-gray-300 p-2">
      <div className="flex items-center">
        <span>{title}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="ml-1 p-0">
              <Info className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </th>
  )
}

// CrearIntervencionTablaComponent
export function CrearIntervencionTablaComponent() {
  // Datos Hardcoded para inicializar el estado
  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([
    {
      id: "1",
      ods: ["ODS 1: Fin de la pobreza", "ODS 3: Salud y bienestar"],
      areaEstrategica: "Docencia",
      objetivoEstrategico: "Mejorar la calidad académica",
      estrategias: ["Implementar nuevas metodologías de enseñanza"],
      intervencion: "Programa de Tutorías",
      tipoIniciativa: "actividad",
      iniciativa: "Desarrollar un programa de tutorías para estudiantes de primer año",
      objetivo: "Aumentar la retención estudiantil en un 10%",
      estado: "revision",
      fechaInicio: new Date('2024-01-15'),
      fechaFin: new Date('2024-12-15'),
      fechasActividad: [
        { inicio: new Date('2024-02-01'), fin: new Date('2024-02-28') },
        { inicio: new Date('2024-06-01'), fin: new Date('2024-06-30') },
      ],
      costos: {
        total: 5000,
        aporte: {
          umes: {
            tipo: "presupuesto anual",
            porcentaje: 60
          },
          otraFuente: {
            tipo: "Subvención externa",
            porcentaje: 40
          }
        },
        tipoCompra: "financiamiento",
        detallesPdf: null
      },
      responsables: {
        planificacion: ["Juan Pérez", "Ana Gómez"],
        ejecucion: ["Carlos López"],
        finalizacion: ["María Rodríguez"]
      },
      recursos: ["Espacios físicos", "Material didáctico", "Plataforma en línea"],
      departamentosNecesarios: ["publicidad", "pastoral"],
      indicadorLogro: "Incremento en la retención estudiantil",
      comentarioDecano: "Aprobada para su implementación en el próximo semestre"
    },
    {
      id: "2",
      ods: ["ODS 2: Hambre cero"],
      areaEstrategica: "Extensión",
      objetivoEstrategico: "Ampliar la proyección social",
      estrategias: ["Desarrollar programas de vinculación comunitaria"],
      intervencion: "Huertos Comunitarios",
      tipoIniciativa: "proyecto",
      iniciativa: "Crear huertos urbanos en comunidades vulnerables",
      objetivo: "Reducir la inseguridad alimentaria en un 15%",
      estado: "aprobado",
      fechaInicio: new Date('2024-03-01'),
      fechaFin: new Date('2024-09-30'),
      fechasActividad: [
        { inicio: new Date('2024-03-15'), fin: new Date('2024-04-15') },
        { inicio: new Date('2024-07-01'), fin: new Date('2024-07-31') },
      ],
      costos: {
        total: 8000,
        aporte: {
          umes: {
            tipo: "presupuesto por facultad",
            porcentaje: 50
          },
          otraFuente: {
            tipo: "Donaciones privadas",
            porcentaje: 50
          }
        },
        tipoCompra: "compra directa",
        detallesPdf: null
      },
      responsables: {
        planificacion: ["Laura Martínez"],
        ejecucion: ["Pedro Sánchez"],
        finalizacion: ["Sofía Hernández"]
      },
      recursos: ["Herramientas agrícolas", "Semillas", "Materiales de construcción"],
      departamentosNecesarios: ["coro", "estudiantina"],
      indicadorLogro: "Reducción de la inseguridad alimentaria",
      comentarioDecano: "Proyecto alineado con los ODS y la misión institucional"
    }
  ])

  const [filtroFechaInicio, setFiltroFechaInicio] = useState<Date | undefined>(undefined)
  const [filtroFechaFin, setFiltroFechaFin] = useState<Date | undefined>(undefined)
  const [filtroArea, setFiltroArea] = useState<string>("all")
  const [filtroEstrategia, setFiltroEstrategia] = useState<string>("all")
  const [nuevaEstrategia, setNuevaEstrategia] = useState<string>("")
  const [nuevaIntervencion, setNuevaIntervencion] = useState<string>("")

  const addIntervencion = () => {
    const newIntervencion: Intervencion = {
      id: (intervenciones.length + 1).toString(),
      ods: [],
      areaEstrategica: '',
      objetivoEstrategico: '',
      estrategias: [],
      intervencion: '',
      tipoIniciativa: 'actividad',
      iniciativa: '',
      objetivo: '',
      estado: 'revision',
      fechaInicio: null,
      fechaFin: null,
      fechasActividad: [],
      costos: {
        total: 0,
        aporte: {
          umes: {
            tipo: 'presupuesto anual',
            porcentaje: 0
          },
          otraFuente: {
            tipo: '',
            porcentaje: 0
          }
        },
        tipoCompra: 'NA',
        detallesPdf: null
      },
      responsables: {
        planificacion: [],
        ejecucion: [],
        finalizacion: []
      },
      recursos: [],
      departamentosNecesarios: [],
      indicadorLogro: '',
      comentarioDecano: ''
    }
    setIntervenciones([...intervenciones, newIntervencion])
  }

  const handleChange = (index: number, field: IntervencionField, value: any) => {
    const newIntervenciones = [...intervenciones]
    const fields = field.split('.')

    newIntervenciones[index] = updateNestedState(newIntervenciones[index], fields, value)

    if (field === 'objetivoEstrategico') {
      const objetivo = objetivosEstrategicos.find(obj => obj.objetivo === value)
      if (objetivo) {
        newIntervenciones[index] = {
          ...newIntervenciones[index],
          areaEstrategica: objetivo.area
        }
      }
    }

    setIntervenciones(newIntervenciones)
  }

  const handleMultiSelect = (index: number, field: IntervencionField, value: string[]) => {
    handleChange(index, field, value)
  }

  const handleFileUpload = (index: number, file: File) => {
    handleChange(index, 'costos.detallesPdf', file)
  }

  const addFechaActividad = (index: number) => {
    const newIntervenciones = [...intervenciones]
    newIntervenciones[index].fechasActividad.push({ inicio: null, fin: null })
    setIntervenciones(newIntervenciones)
  }

  const handleFechaActividadChange = (index: number, actividadIndex: number, field: 'inicio' | 'fin', value: Date | undefined) => {
    const newIntervenciones = [...intervenciones]
    newIntervenciones[index].fechasActividad[actividadIndex][field] = value || null
    setIntervenciones(newIntervenciones)
  }

  const addEstrategia = () => {
    if (nuevaEstrategia && !estrategiasList.includes(nuevaEstrategia)) {
      estrategiasList.push(nuevaEstrategia)
      setNuevaEstrategia("")
    }
  }

  const addNuevaIntervencion = () => {
    if (nuevaIntervencion) {
      const newIntervenciones = [...intervenciones]
      newIntervenciones[newIntervenciones.length - 1].intervencion = nuevaIntervencion
      setIntervenciones(newIntervenciones)
      setNuevaIntervencion("")
    }
  }

  const filteredIntervenciones = intervenciones.filter(intervencion => {
    const cumpleFechaInicio = !filtroFechaInicio || (intervencion.fechaInicio && intervencion.fechaInicio >= filtroFechaInicio)
    const cumpleFechaFin = !filtroFechaFin || (intervencion.fechaFin && intervencion.fechaFin <= filtroFechaFin)
    const cumpleArea = filtroArea === "all" || intervencion.areaEstrategica === filtroArea
    const cumpleEstrategia = filtroEstrategia === "all" || intervencion.estrategias.includes(filtroEstrategia)
    return cumpleFechaInicio && cumpleFechaFin && cumpleArea && cumpleEstrategia
  })

  return (
    <TooltipProvider>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Crear Intervenciones (Tabla)</h1>
        <div className="mb-4 flex flex-wrap gap-4">
          <DatePicker
            selected={filtroFechaInicio}
            onSelect={(date) => setFiltroFechaInicio(date)}
            placeholderText="Fecha Inicio"
          />
          <DatePicker
            selected={filtroFechaFin}
            onSelect={(date) => setFiltroFechaFin(date)}
            placeholderText="Fecha Fin"
          />
          <Select value={filtroArea} onValueChange={setFiltroArea}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por Área" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las áreas</SelectItem>
              {areasEstrategicas.map((area) => (
                <SelectItem key={area} value={area}>{area}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroEstrategia} onValueChange={setFiltroEstrategia}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por Estrategia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas las estrategias</SelectItem>
              {estrategiasList.map((estrategia) => (
                <SelectItem key={estrategia} value={estrategia}>{estrategia}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <HeaderWithTooltip title="ODS" tooltip="Objetivos de Desarrollo Sostenible" />
                <HeaderWithTooltip title="Área Estratégica" tooltip="Se selecciona automáticamente al elegir el objetivo" />
                <HeaderWithTooltip title="Objetivo Estratégico" tooltip="Seleccione el objetivo estratégico" />
                <HeaderWithTooltip title="Estrategias" tooltip="Seleccione una o más estrategias" />
                <HeaderWithTooltip title="Intervención" tooltip="Especifique la intervención o proyecto" />
                <HeaderWithTooltip title="Tipo de Iniciativa" tooltip="Actividad o Proyecto" />
                <HeaderWithTooltip title="Iniciativa" tooltip="Describa la iniciativa" />
                <HeaderWithTooltip title="Objetivo" tooltip="Objetivo específico de la intervención" />
                <HeaderWithTooltip title="Estado" tooltip="Estado actual de la intervención" />
                <HeaderWithTooltip title="Fechas" tooltip="Fechas de inicio y fin de la intervención" />
                <HeaderWithTooltip title="Costos" tooltip="Detalles de costos y financiamiento" />
                <HeaderWithTooltip title="Responsables" tooltip="Responsables en cada etapa" />
                <HeaderWithTooltip title="Recursos" tooltip="Recursos necesarios" />
                <HeaderWithTooltip title="Departamentos" tooltip="Departamentos necesarios" />
                <HeaderWithTooltip title="Indicador de Logro" tooltip="Cómo se evaluará el éxito" />
                <HeaderWithTooltip title="Comentario Decano" tooltip="Comentarios del decano" />
              </tr>
            </thead>
            <tbody>
              {filteredIntervenciones.map((intervencion, index) => (
                <tr key={intervencion.id}>
                  <td className="border border-gray-300 p-2">
                    <MultiSelect
                      options={odsOptions}
                      selected={intervencion.ods}
                      onChange={(value) => handleMultiSelect(index, 'ods', value)}
                      placeholder="Seleccionar ODS..."
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input value={intervencion.areaEstrategica} readOnly />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Select
                      value={intervencion.objetivoEstrategico}
                      onValueChange={(value) => handleChange(index, 'objetivoEstrategico', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar objetivo..." />
                      </SelectTrigger>
                      <SelectContent>
                        {objetivosEstrategicos.map((obj) => (
                          <SelectItem key={obj.id} value={obj.objetivo}>
                            {obj.objetivo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <MultiSelect
                      options={estrategiasList}
                      selected={intervencion.estrategias}
                      onChange={(value) => handleMultiSelect(index, 'estrategias', value)}
                      placeholder="Seleccionar estrategias..."
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Nueva Estrategia
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nueva Estrategia</DialogTitle>
                        </DialogHeader>
                        <Input
                          value={nuevaEstrategia}
                          onChange={(e) => setNuevaEstrategia(e.target.value)}
                          placeholder="Nueva estrategia"
                        />
                        <Button onClick={addEstrategia} className="mt-2">Agregar</Button>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={intervencion.intervencion}
                      onChange={(e) => handleChange(index, 'intervencion', e.target.value)}
                      placeholder="Nombre de la intervención"
                    />
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="mt-2">
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Nueva Intervención
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Agregar Nueva Intervención</DialogTitle>
                        </DialogHeader>
                        <Input
                          value={nuevaIntervencion}
                          onChange={(e) => setNuevaIntervencion(e.target.value)}
                          placeholder="Nueva intervención"
                        />
                        <Button onClick={addNuevaIntervencion} className="mt-2">Agregar</Button>
                      </DialogContent>
                    </Dialog>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Select
                      value={intervencion.tipoIniciativa}
                      onValueChange={(value) => handleChange(index, 'tipoIniciativa', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Tipo de iniciativa" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiposIniciativa.map((tipo) => (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {intervencion.tipoIniciativa === 'actividad' && (
                      <div className="mt-2">
                        <Button onClick={() => addFechaActividad(index)} variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Agregar Fecha de Actividad
                        </Button>
                        {intervencion.fechasActividad.map((fecha, actividadIndex) => (
                          <div key={actividadIndex} className="mt-2 flex space-x-2">
                            <DatePicker
                              selected={fecha.inicio || undefined}
                              onSelect={(value) => handleFechaActividadChange(index, actividadIndex, 'inicio', value)}
                              placeholderText="Inicio"
                            />
                            <DatePicker
                              selected={fecha.fin || undefined}
                              onSelect={(value) => handleFechaActividadChange(index, actividadIndex, 'fin', value)}
                              placeholderText="Fin"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={intervencion.iniciativa}
                      onChange={(e) => handleChange(index, 'iniciativa', e.target.value)}
                      placeholder="Descripción de la iniciativa"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={intervencion.objetivo}
                      onChange={(e) => handleChange(index, 'objetivo', e.target.value)}
                      placeholder="Objetivo específico"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Select
                      value={intervencion.estado}
                      onValueChange={(value) => handleChange(index, 'estado', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="revision">Revisión</SelectItem>
                        <SelectItem value="aprobado">Aprobado</SelectItem>
                        <SelectItem value="rechazado">Rechazado</SelectItem>
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <DatePicker
                      selected={intervencion.fechaInicio || undefined}
                      onSelect={(date) => handleChange(index, 'fechaInicio', date || null)}
                      placeholderText="Fecha Inicio"
                    />
                    <DatePicker
                      selected={intervencion.fechaFin || undefined}
                      onSelect={(date) => handleChange(index, 'fechaFin', date || null)}
                      placeholderText="Fecha Fin"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      type="number"
                      value={intervencion.costos.total}
                      onChange={(e) => handleChange(index, 'costos.total', parseFloat(e.target.value))}
                      placeholder="Costo total"
                    />
                    <div className="mt-2">
                      <Label>Aporte UMES</Label>
                      <Select
                        value={intervencion.costos.aporte.umes.tipo}
                        onValueChange={(value) => handleChange(index, 'costos.aporte.umes.tipo', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de aporte UMES" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposAporteUmes.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        value={intervencion.costos.aporte.umes.porcentaje}
                        onChange={(e) => handleChange(index, 'costos.aporte.umes.porcentaje', parseFloat(e.target.value))}
                        placeholder="% UMES"
                      />
                    </div>
                    <div className="mt-2">
                      <Label>Aporte Otra Fuente</Label>
                      <Input
                        value={intervencion.costos.aporte.otraFuente.tipo}
                        onChange={(e) => handleChange(index, 'costos.aporte.otraFuente.tipo', e.target.value)}
                        placeholder="Tipo de otra fuente"
                      />
                      <Input
                        type="number"
                        value={intervencion.costos.aporte.otraFuente.porcentaje}
                        onChange={(e) => handleChange(index, 'costos.aporte.otraFuente.porcentaje', parseFloat(e.target.value))}
                        placeholder="% Otra fuente"
                      />
                    </div>
                    <div className="mt-2">
                      <Label>Tipo de Compra</Label>
                      <Select
                        value={intervencion.costos.tipoCompra}
                        onValueChange={(value) => handleChange(index, 'costos.tipoCompra', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Tipo de compra" />
                        </SelectTrigger>
                        <SelectContent>
                          {tiposCompra.map((tipo) => (
                            <SelectItem key={tipo} value={tipo}>
                              {tipo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="mt-2">
                      <Label>Detalles de Costos (PDF)</Label>
                      <Input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(index, file)
                        }}
                      />
                    </div>
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Label>Planificación</Label>
                    <Input
                      value={intervencion.responsables.planificacion.join(', ')}
                      onChange={(e) => handleChange(index, 'responsables.planificacion', e.target.value.split(', ').filter(Boolean))}
                      placeholder="Responsables de planificación"
                    />
                    <Label>Ejecución</Label>
                    <Input
                      value={intervencion.responsables.ejecucion.join(', ')}
                      onChange={(e) => handleChange(index, 'responsables.ejecucion', e.target.value.split(', ').filter(Boolean))}
                      placeholder="Responsables de ejecución"
                    />
                    <Label>Finalización</Label>
                    <Input
                      value={intervencion.responsables.finalizacion.join(', ')}
                      onChange={(e) => handleChange(index, 'responsables.finalizacion', e.target.value.split(', ').filter(Boolean))}
                      placeholder="Responsables de finalización"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={intervencion.recursos.join(', ')}
                      onChange={(e) => handleChange(index, 'recursos', e.target.value.split(', ').filter(Boolean))}
                      placeholder="Recursos necesarios"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <MultiSelect
                      options={departamentos}
                      selected={intervencion.departamentosNecesarios}
                      onChange={(value) => handleMultiSelect(index, 'departamentosNecesarios', value)}
                      placeholder="Seleccionar departamentos..."
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Input
                      value={intervencion.indicadorLogro}
                      onChange={(e) => handleChange(index, 'indicadorLogro', e.target.value)}
                      placeholder="Indicador de logro"
                    />
                  </td>
                  <td className="border border-gray-300 p-2">
                    <Textarea
                      value={intervencion.comentarioDecano}
                      onChange={(e) => handleChange(index, 'comentarioDecano', e.target.value)}
                      placeholder="Comentario del decano"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button onClick={addIntervencion} className="mt-4">Agregar Intervención</Button>
      </div>
    </TooltipProvider>
  )
}
