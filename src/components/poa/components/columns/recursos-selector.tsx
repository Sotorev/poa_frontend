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

interface Recurso {
  id: string
  name: string
  number: number
  isCustom?: boolean
}

interface RecursosSelectorProps {
  selectedRecursos: string[]
  onSelectRecursos: (recursos: string[]) => void
}

const initialRecursosList: Recurso[] = [
  { id: "rec1", name: "Publicidad", number: 1 },
  { id: "rec2", name: "Pastoral", number: 2 },
  { id: "rec3", name: "Coro", number: 3 },
  { id: "rec4", name: "Estudiantina", number: 4 },
]

export function RecursosSelectorComponent({ selectedRecursos, onSelectRecursos }: RecursosSelectorProps) {
  const [recursosList, setRecursosList] = useState<Recurso[]>(initialRecursosList)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newRecurso, setNewRecurso] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [customRecursoCounter, setCustomRecursoCounter] = useState(5)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const newRecursoInputRef = useRef<HTMLInputElement>(null)

  const filteredRecursos = useMemo(() => {
    return recursosList.filter(rec => 
      rec.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [recursosList, searchTerm])

  const handleSelectRecurso = (recId: string) => {
    const newSelection = selectedRecursos.includes(recId)
      ? selectedRecursos.filter(id => id !== recId)
      : [...selectedRecursos, recId]
    onSelectRecursos(newSelection)
  }

  const handleAddNewRecurso = () => {
    if (newRecurso.trim() !== "") {
      const newRec: Recurso = {
        id: `custom-${Date.now()}`,
        name: `E${customRecursoCounter} ${newRecurso.trim()}`,
        number: customRecursoCounter,
        isCustom: true
      }
      setRecursosList(prev => [...prev, newRec])
      onSelectRecursos([...selectedRecursos, newRec.id])
      setNewRecurso("")
      setIsAddingNew(false)
      setCustomRecursoCounter(prev => prev + 1)
    }
  }

  const handleRemoveRecurso = (recId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    onSelectRecursos(selectedRecursos.filter(id => id !== recId))
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isAddingNew && newRecursoInputRef.current) {
      newRecursoInputRef.current.focus()
    }
  }, [isAddingNew])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedRecursos.map(id => {
          const recurso = recursosList.find(rec => rec.id === id)
          if (!recurso) return null
          return (
            <TooltipProvider key={recurso.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold bg-green-100 text-green-800"
                  >
                    <span className="flex items-center">
                      <span className="w-5 h-5 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold bg-green-500">
                        {recurso.isCustom ? 'E' : recurso.number}
                      </span>
                      {recurso.name}
                    </span>
                    <button
                      className="ml-1 text-green-600 hover:text-green-800"
                      onClick={(e) => handleRemoveRecurso(recurso.id, e)}
                      aria-label={`Eliminar ${recurso.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{recurso.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      <Select 
        onValueChange={handleSelectRecurso} 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSearchTerm("")
          }
        }}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona recursos" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar recurso..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredRecursos.map((rec) => (
                <SelectItem 
                  key={rec.id} 
                  value={rec.id} 
                  className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                  style={{ borderBottom: 'none' }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedRecursos.includes(rec.id)}
                      onCheckedChange={() => handleSelectRecurso(rec.id)}
                      className="mr-2 border-2 border-green-500 data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                    />
                    <div 
                      className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold bg-green-500"
                    >
                      {rec.isCustom ? 'E' : rec.number}
                    </div>
                    {rec.name}
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
              ref={newRecursoInputRef}
              placeholder="Nuevo recurso..."
              value={newRecurso}
              onChange={(e) => setNewRecurso(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewRecurso()
                }
              }}
              className="h-8 w-[240px] border border-green-300 focus:outline-none focus:ring-0 focus:border-green-500 shadow-none appearance-none"
            />
            <Button 
              onClick={handleAddNewRecurso} 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {
                setIsAddingNew(false)
                setNewRecurso("")
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
            Agregar nuevo recurso
          </Button>
        )}
      </div>
    </div>
  )
}