'use client'

import * as React from "react"
import { useState, useMemo, useRef, useEffect } from "react"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, Plus, Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

interface Intervencion {
  id: string
  name: string
  number: number
  isCustom?: boolean
}

interface IntervencionesProps {
  selectedIntervenciones: string[];
  onSelectIntervencion: (intervenciones: string[]) => void;
}

const initialIntervencionesList: Intervencion[] = [
  { id: "int1", name: "Capacitación en habilidades técnicas", number: 1 },
  { id: "int2", name: "Implementación de tecnología", number: 2 },
  { id: "int3", name: "Mejora de procesos", number: 3 },
  { id: "int4", name: "Desarrollo de liderazgo", number: 4 },
  { id: "int5", name: "Gestión del cambio", number: 5 },
]

export function IntervencionesSelectorComponent({ selectedIntervenciones, onSelectIntervencion }: IntervencionesProps) {
  const [intervencionesList, setIntervencionesList] = useState<Intervencion[]>(initialIntervencionesList)
  // Eliminar esta línea:
  // const [selectedIntervenciones, setSelectedIntervenciones] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newIntervencion, setNewIntervencion] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [customInterventionCounter, setCustomInterventionCounter] = useState(1)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const newIntervencionInputRef = useRef<HTMLInputElement>(null)

  const filteredIntervenciones = useMemo(() => {
    return intervencionesList.filter(int => 
      int.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [intervencionesList, searchTerm])

  const handleSelectIntervencion = (intervencionId: string) => {
    const updatedIntervenciones = selectedIntervenciones.includes(intervencionId)
      ? selectedIntervenciones.filter(id => id !== intervencionId)
      : [...selectedIntervenciones, intervencionId];
    onSelectIntervencion(updatedIntervenciones);
  }

  const handleAddNewIntervencion = () => {
    if (newIntervencion.trim() !== "") {
      const newIntervencionObj: Intervencion = {
        id: `custom-${Date.now()}`,
        name: newIntervencion.trim(),
        isCustom: true
      }
      setIntervencionesList(prev => [...prev, newIntervencionObj])
      onSelectIntervencion([...selectedIntervenciones, newIntervencionObj.id])
      setNewIntervencion("")
      setIsAddingNew(false)
    }
  }

  const handleRemoveIntervencion = (intId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onSelectIntervencion(selectedIntervenciones.filter(id => id !== intId))
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isAddingNew && newIntervencionInputRef.current) {
      newIntervencionInputRef.current.focus()
    }
  }, [isAddingNew])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedIntervenciones.map(id => {
          const intervencion = intervencionesList.find(int => int.id === id)
          if (!intervencion) return null
          return (
            <TooltipProvider key={intervencion.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800"
                  >
                    <span>{intervencion.isCustom ? `E${intervencion.number}` : intervencion.number}</span>
                    <button
                      className="ml-1 text-green-600 hover:text-green-800"
                      onClick={(e) => handleRemoveIntervencion(intervencion.id, e)}
                      aria-label={`Eliminar ${intervencion.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{intervencion.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      <Select 
        onValueChange={handleSelectIntervencion} 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSearchTerm("")
          }
        }}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona intervenciones" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar intervención..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredIntervenciones.map((int) => (
                <SelectItem 
                  key={int.id} 
                  value={int.id} 
                  className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                  style={{ borderBottom: 'none' }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedIntervenciones.includes(int.id)}
                      onCheckedChange={() => handleSelectIntervencion(int.id)}
                      className="mr-2 border-2 border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                    />
                    <div 
                      className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold bg-green-500"
                    >
                      {int.isCustom ? `E${int.number}` : int.number}
                    </div>
                    {int.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
      <div className="flex items-center space-x-2">
        {isAddingNew ? (
          <>
            <Input
              ref={newIntervencionInputRef}
              placeholder="Nueva intervención..."
              value={newIntervencion}
              onChange={(e) => setNewIntervencion(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewIntervencion()
                }
              }}
              className="h-8 w-[240px] border border-green-300 focus:outline-none focus:ring-0 focus:border-green-500 shadow-none appearance-none"
            />
            <Button 
              onClick={handleAddNewIntervencion} 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {
                setIsAddingNew(false)
                setNewIntervencion("")
              }} 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button 
            onClick={() => setIsAddingNew(true)} 
            size="sm" 
            variant="ghost" 
            className="h-8 text-xs text-green-600 hover:text-green-700 hover:bg-green-100 px-0"
          >
            <Plus className="h-3 w-3 mr-1" />
            Agregar nueva intervención
          </Button>
        )}
      </div>
    </div>
  )
}