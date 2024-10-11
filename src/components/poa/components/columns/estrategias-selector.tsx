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

interface Estrategia {
  id: string
  name: string
  number: number
  isCustom?: boolean
}

const initialEstrategiasList: Estrategia[] = [
  { id: "est1", name: "Estrategia de crecimiento", number: 1 },
  { id: "est2", name: "Estrategia de innovación", number: 2 },
  { id: "est3", name: "Estrategia de expansión", number: 3 },
  { id: "est4", name: "Estrategia de diversificación", number: 4 },
  { id: "est5", name: "Estrategia de optimización", number: 5 },
  // ... add more predefined strategies as needed
]

interface EstrategiasSelectorProps {
  selectedEstrategias: string[];
  onSelectEstrategia: (estrategias: string[]) => void;
}

export function EstrategiasSelectorComponent({ selectedEstrategias, onSelectEstrategia }: EstrategiasSelectorProps) {
  const [estrategiasList, setEstrategiasList] = useState<Estrategia[]>(initialEstrategiasList)
  //const [selectedEstrategias, setSelectedEstrategias] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [newEstrategia, setNewEstrategia] = useState("")
  const [isAddingNew, setIsAddingNew] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const newEstrategiaInputRef = useRef<HTMLInputElement>(null)

  const filteredEstrategias = useMemo(() => {
    return estrategiasList.filter(est => 
      est.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [estrategiasList, searchTerm])

  const handleSelectEstrategia = (estrategiaId: string) => {
    const updatedEstrategias = selectedEstrategias.includes(estrategiaId)
      ? selectedEstrategias.filter(id => id !== estrategiaId)
      : [...selectedEstrategias, estrategiaId];
    onSelectEstrategia(updatedEstrategias);
  }

  const handleAddNewEstrategia = () => {
    if (newEstrategia.trim() !== "") {
      const newEstrategiaObj: Estrategia = {
        id: `custom-${Date.now()}`,
        name: newEstrategia.trim(),
        number: estrategiasList.length + 1,
        isCustom: true
      }
      setEstrategiasList(prev => [...prev, newEstrategiaObj])
      onSelectEstrategia([...selectedEstrategias, newEstrategiaObj.id])
      setNewEstrategia("")
      setIsAddingNew(false)
    }
  }

  const handleRemoveEstrategia = (id: string) => {
    onSelectEstrategia(selectedEstrategias.filter(estId => estId !== id))
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (isAddingNew && newEstrategiaInputRef.current) {
      newEstrategiaInputRef.current.focus()
    }
  }, [isAddingNew])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedEstrategias.map(id => {
          const estrategia = estrategiasList.find(est => est.id === id)
          if (!estrategia) return null
          return (
            <TooltipProvider key={id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {estrategia.isCustom ? `E${estrategia.number}` : estrategia.number}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-1 h-4 w-4 p-0 text-green-800 hover:text-green-900 hover:bg-green-200"
                      onClick={() => handleRemoveEstrategia(id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{estrategia.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      <Select 
        onValueChange={handleSelectEstrategia} 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSearchTerm("")
          }
        }}
      >
        <SelectTrigger className="w-[300px] border border-green-500 focus:outline-none focus:ring-0 focus:border-green-600">
          <SelectValue placeholder="Selecciona estrategias" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-green-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar estrategia..."
              className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-green-500 border-green-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredEstrategias.map((est) => (
                <SelectItem 
                  key={est.id} 
                  value={est.id} 
                  className="focus:bg-green-100 focus:text-green-800 hover:bg-green-50"
                >
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedEstrategias.includes(est.id)}
                      onChange={() => handleSelectEstrategia(est.id)}
                      className="mr-2 h-4 w-4 rounded border-green-300 text-green-600 focus:ring-green-500"
                    />
                    {est.isCustom ? `E${est.number}: ${est.name}` : `${est.number}: ${est.name}`}
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
              ref={newEstrategiaInputRef}
              placeholder="Nueva estrategia..."
              value={newEstrategia}
              onChange={(e) => setNewEstrategia(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleAddNewEstrategia()
                }
              }}
              className="h-8 w-[240px] border border-green-300 focus:outline-none focus:ring-0 focus:border-green-500 shadow-none appearance-none"
            />
            <Button 
              onClick={handleAddNewEstrategia} 
              size="sm" 
              variant="ghost"
              className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-100"
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button 
              onClick={() => {
                setIsAddingNew(false)
                setNewEstrategia("")
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
            Agregar nueva estrategia
          </Button>
        )}
      </div>
    </div>
  )
}