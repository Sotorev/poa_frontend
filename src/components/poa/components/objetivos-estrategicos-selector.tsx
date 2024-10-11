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

interface Objetivo {
  id: string
  name: string
  number: number
  isCustom?: boolean
}

const initialObjetivosList: Objetivo[] = [
  { id: "obj1", name: "Fin de la pobreza", number: 1 },
  { id: "obj2", name: "Hambre cero", number: 2 },
  { id: "obj3", name: "Salud y bienestar", number: 3 },
  { id: "obj4", name: "Educación de calidad", number: 4 },
  { id: "obj5", name: "Igualdad de género", number: 5 },
  // ... add more predefined objectives as needed
]

export function ObjetivosEstrategicosSelectorComponent() {
  const [objetivosList, setObjetivosList] = useState<Objetivo[]>(initialObjetivosList)
  const [selectedObjetivoId, setSelectedObjetivoId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newObjetivo, setNewObjetivo] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const newObjetivoInputRef = useRef<HTMLInputElement>(null)

  const filteredObjetivos = useMemo(() => {
    return objetivosList.filter(obj => 
      obj.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [objetivosList, searchTerm])

  const handleSelectObjetivo = (objId: string) => {
    setSelectedObjetivoId(objId)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleAddNewObjetivo = () => {
    if (newObjetivo.trim() !== "") {
      const newNumber = Math.max(...objetivosList.map(obj => obj.number), 0) + 1
      const newObj: Objetivo = {
        id: `custom-${Date.now()}`,
        name: newObjetivo.trim(),
        number: newNumber,
        isCustom: true
      }
      setObjetivosList([...objetivosList, newObj])
      setSelectedObjetivoId(newObj.id)
      setNewObjetivo("")
      setIsAddingNew(false)
    }
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isAddingNew && newObjetivoInputRef.current) {
      newObjetivoInputRef.current.focus()
    }
  }, [isAddingNew])

  return (
    <div className="space-y-2">
      <Select 
        onValueChange={handleSelectObjetivo} 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSearchTerm("")
          }
        }}
        value={selectedObjetivoId || undefined}
      >
        <SelectTrigger className="w-[300px] border border-green-500 focus:outline-none focus:ring-0 focus:border-green-600">
          <SelectValue placeholder="Selecciona un objetivo" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-green-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar objetivo..."
              className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-green-500 border-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredObjetivos.map((obj) => (
                <SelectItem 
                  key={obj.id} 
                  value={obj.id} 
                  className="focus:bg-green-100 focus:text-green-800 hover:bg-green-50"
                >
                  {obj.isCustom ? `E${obj.number}: ${obj.name}` : `${obj.number}: ${obj.name}`}
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
  ref={newObjetivoInputRef}
  placeholder="Nuevo objetivo..."
  value={newObjetivo}
  onChange={(e) => setNewObjetivo(e.target.value)}
  onKeyPress={(e) => {
    if (e.key === 'Enter') {
      handleAddNewObjetivo()
    }
  }}
  className="h-8 w-[240px] border border-green-300 focus:outline-none focus:ring-0 focus:border-green-500 shadow-none appearance-none"

/>


            <Button 
              onClick={handleAddNewObjetivo} 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {
                setIsAddingNew(false)
                setNewObjetivo("")
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
            Agregar nuevo objetivo
          </Button>
        )}
      </div>
    </div>
  )
}