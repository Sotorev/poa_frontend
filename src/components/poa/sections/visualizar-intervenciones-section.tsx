"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ChevronDown, ChevronUp, Edit, Info, Check, X, Download } from 'lucide-react';
import { Textarea } from "@/components/ui/textarea";
import { formatCurrency } from '@/utils/formatCurrency';

interface SectionProps {
  name: string;
  isActive: boolean;
  poaId: string | null; // Incluir poaId en las props
}

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
  fechaInicio: Date;
  fechaFin: Date;
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
    tipoCompra: 'cotización' | 'compra directa' | 'financiamiento' | 'otros' | 'NA';
    detallesPdfUrl: string;
  };
  responsables: {
    planificacion: string[];
    ejecucion: string[];
    finalizacion: string[];
  };
  recursos: string[];
  indicadorLogro: string;
  comentarios: string;
  procesoPdfUrl: string;
}

export function VisualizarIntervencionesSection({ name, isActive, poaId }: SectionProps) {
  console.log("POA ID:", poaId); // Imprimir el poaId para verificar
  const [isMinimized, setIsMinimized] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [intervenciones, setIntervenciones] = useState<Intervencion[]>([
    {
      id: '1',
      ods: ['ODS 1', 'ODS 2'],
      areaEstrategica: 'Área 1',
      objetivoEstrategico: 'Objetivo Estratégico 1',
      estrategias: ['Estrategia 1', 'Estrategia 2'],
      intervencion: 'Intervención 1',
      tipoIniciativa: 'proyecto',
      iniciativa: 'Iniciativa 1',
      objetivo: 'Objetivo 1',
      estado: 'revision',
      fechaInicio: new Date(2024, 0, 15),
      fechaFin: new Date(2024, 5, 30),
      costos: {
        total: 50000,
        aporte: {
          umes: {
            tipo: 'presupuesto anual',
            porcentaje: 60
          },
          otraFuente: {
            tipo: 'donación',
            porcentaje: 40
          }
        },
        tipoCompra: 'compra directa',
        detallesPdfUrl: '/path/to/detalles-costos-1.pdf'
      },
      responsables: {
        planificacion: ['Responsable A', 'Responsable B'],
        ejecucion: ['Responsable C'],
        finalizacion: ['Responsable D']
      },
      recursos: ['Recurso 1', 'Recurso 2'],
      indicadorLogro: 'Indicador de Logro 1',
      comentarios: '',
      procesoPdfUrl: '/path/to/proceso-1.pdf'
    },
    {
      id: '2',
      ods: ['ODS 3'],
      areaEstrategica: 'Área 2',
      objetivoEstrategico: 'Objetivo Estratégico 2',
      estrategias: ['Estrategia 3'],
      intervencion: 'Intervención 2',
      tipoIniciativa: 'actividad',
      iniciativa: 'Iniciativa 2',
      objetivo: 'Objetivo 2',
      estado: 'revision',
      fechaInicio: new Date(2024, 2, 1),
      fechaFin: new Date(2024, 7, 15),
      costos: {
        total: 25000,
        aporte: {
          umes: {
            tipo: 'presupuesto por facultad',
            porcentaje: 80
          },
          otraFuente: {
            tipo: 'estudiantes',
            porcentaje: 20
          }
        },
        tipoCompra: 'cotización',
        detallesPdfUrl: '/path/to/detalles-costos-2.pdf'
      },
      responsables: {
        planificacion: ['Responsable E'],
        ejecucion: ['Responsable F', 'Responsable G'],
        finalizacion: ['Responsable H']
      },
      recursos: ['Recurso 3'],
      indicadorLogro: 'Indicador de Logro 2',
      comentarios: '',
      procesoPdfUrl: '/path/to/proceso-2.pdf'
    },
    {
      id: '3',
      ods: ['ODS 4', 'ODS 5'],
      areaEstrategica: 'Área 1',
      objetivoEstrategico: 'Objetivo Estratégico 3',
      estrategias: ['Estrategia 1', 'Estrategia 4'],
      intervencion: 'Intervención 3',
      tipoIniciativa: 'proyecto',
      iniciativa: 'Iniciativa 3',
      objetivo: 'Objetivo 3',
      estado: 'revision',
      fechaInicio: new Date(2024, 4, 10),
      fechaFin: new Date(2024, 11, 20),
      costos: {
        total: 75000,
        aporte: {
          umes: {
            tipo: 'otros',
            porcentaje: 70
          },
          otraFuente: {
            tipo: 'otros',
            porcentaje: 30
          }
        },
        tipoCompra: 'financiamiento',
        detallesPdfUrl: '/path/to/detalles-costos-3.pdf'
      },
      responsables: {
        planificacion: ['Responsable I'],
        ejecucion: ['Responsable J'],
        finalizacion: ['Responsable K', 'Responsable L']
      },
      recursos: ['Recurso 4', 'Recurso 5'],
      indicadorLogro: 'Indicador de Logro 3',
      comentarios: '',
      procesoPdfUrl: '/path/to/proceso-3.pdf'
    }
  ]);

  const [filtroFechaInicio, setFiltroFechaInicio] = useState<Date | undefined>(undefined);
  const [filtroFechaFin, setFiltroFechaFin] = useState<Date | undefined>(undefined);
  const [filtroArea, setFiltroArea] = useState<string>("all");
  const [filtroEstrategia, setFiltroEstrategia] = useState<string>("all");

  const handleEdit = () => {
    setIsEditing(!isEditing);
  }

  const handleSave = () => {
    setIsEditing(false);
    // Aquí iría la lógica para guardar los datos en el backend
  }

  const handleApproveReject = (id: string, action: 'aprobado' | 'rechazado' | 'revision') => {
    setIntervenciones(intervenciones.map(intervencion =>
      intervencion.id === id ? { ...intervencion, estado: action } : intervencion
    ));
  }

  const handleCommentChange = (id: string, comment: string) => {
    setIntervenciones(intervenciones.map(intervencion =>
      intervencion.id === id ? { ...intervencion, comentarios: comment } : intervencion
    ));
  }

  const filteredIntervenciones = intervenciones.filter(intervencion => {
    const cumpleFechaInicio = filtroFechaInicio ? intervencion.fechaInicio >= filtroFechaInicio : true;
    const cumpleFechaFin = filtroFechaFin ? intervencion.fechaFin <= filtroFechaFin : true;
    const cumpleArea = filtroArea !== "all" ? intervencion.areaEstrategica === filtroArea : true;
    const cumpleEstrategia = filtroEstrategia !== "all" ? intervencion.estrategias.includes(filtroEstrategia) : true;
    return cumpleFechaInicio && cumpleFechaFin && cumpleArea && cumpleEstrategia;
  });

  const aprobadas = filteredIntervenciones.filter(intervencion => intervencion.estado === 'aprobado');
  const noAprobadas = filteredIntervenciones.filter(intervencion => intervencion.estado !== 'aprobado');

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
  );

  const renderTabla = (intervenciones: Intervencion[], isAprobadas: boolean) => (
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
          <TableHead>Costo Total</TableHead>
          <TableHead>Aporte UMES</TableHead>
          <TableHead>Aporte Otra Fuente</TableHead>
          <TableHead>Tipo de Compra</TableHead>
          <TableHead>Detalle de Costos</TableHead>
          <TableHead>Responsables</TableHead>
          <TableHead>Recursos</TableHead>
          <TableHead>Indicador de Logro</TableHead>
          <TableHead>Proceso</TableHead>
          <TableHead>Comentarios</TableHead>
          <TableHead>Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {intervenciones.map(intervencion => (
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
            <TableCell>{formatCurrency(intervencion.costos.total)}</TableCell>
            <TableCell>{`${intervencion.costos.aporte.umes.tipo} (${intervencion.costos.aporte.umes.porcentaje}%)`}</TableCell>
            <TableCell>{`${intervencion.costos.aporte.otraFuente.tipo} (${intervencion.costos.aporte.otraFuente.porcentaje}%)`}</TableCell>
            <TableCell>{intervencion.costos.tipoCompra}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => window.open(intervencion.costos.detallesPdfUrl, '_blank')}>
                <Download className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>{`Planificación: ${intervencion.responsables.planificacion.join(', ')}`}</TableCell>
            <TableCell>{intervencion.recursos.join(', ')}</TableCell>
            <TableCell>{intervencion.indicadorLogro}</TableCell>
            <TableCell>
              <Button variant="ghost" size="icon" onClick={() => window.open(intervencion.procesoPdfUrl, '_blank')}>
                <Download className="h-4 w-4" />
              </Button>
            </TableCell>
            <TableCell>
              <Textarea
                value={intervencion.comentarios}
                onChange={(e) => handleCommentChange(intervencion.id, e.target.value)}
                placeholder="Agregar comentario..."
                className="w-full"
              />
            </TableCell>
            <TableCell>
              {isAprobadas ? (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleApproveReject(intervencion.id, 'revision')}
                  aria-label={`Desaprobar intervención ${intervencion.id}`}
                >
                  <X className="h-4 w-4 text-red-500" />
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleApproveReject(intervencion.id, 'aprobado')}
                    aria-label={`Aprobar intervención ${intervencion.id}`}
                  >
                    <Check className="h-4 w-4 text-green-500" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleApproveReject(intervencion.id, 'rechazado')}
                    aria-label={`Rechazar intervención ${intervencion.id}`}
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

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
              <Select value={filtroArea} onValueChange={setFiltroArea}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las áreas</SelectItem>
                  <SelectItem value="Área 1">Área 1</SelectItem>
                  <SelectItem value="Área 2">Área 2</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroEstrategia} onValueChange={setFiltroEstrategia}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Filtrar por Estrategia" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las estrategias</SelectItem>
                  <SelectItem value="Estrategia 1">Estrategia 1</SelectItem>
                  <SelectItem value="Estrategia 2">Estrategia 2</SelectItem>
                  <SelectItem value="Estrategia 3">Estrategia 3</SelectItem>
                  <SelectItem value="Estrategia 4">Estrategia 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <h3 className="text-lg font-semibold mb-2">Intervenciones No Aprobadas</h3>
            {renderTabla(noAprobadas, false)}
            <h3 className="text-lg font-semibold mt-6 mb-2">Intervenciones Aprobadas</h3>
            {renderTabla(aprobadas, true)}
            {isEditing && (
              <Button onClick={handleSave} className="mt-4">
                Guardar Cambios
              </Button>
            )}
            <div className="mt-6 flex justify-end">
              
            </div>
          </div>
        )}
      </div>
    </div>
  );
}