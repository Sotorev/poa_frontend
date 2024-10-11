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
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Checkbox } from "@/components/ui/checkbox"

interface ODS {
  id: string
  name: string
  number: number
  color: string
}

interface ODSSelectorProps {
  selectedODS: string[];
  onSelectODS: (ods: string[]) => void;
}

const odsList: ODS[] = [
  { id: "ods1", name: "Fin de la pobreza", number: 1, color: "#E5243B" },
  { id: "ods2", name: "Hambre cero", number: 2, color: "#DDA63A" },
  { id: "ods3", name: "Salud y bienestar", number: 3, color: "#4C9F38" },
  { id: "ods4", name: "Educación de calidad", number: 4, color: "#C5192D" },
  { id: "ods5", name: "Igualdad de género", number: 5, color: "#FF3A21" },
  { id: "ods6", name: "Agua limpia y saneamiento", number: 6, color: "#26BDE2" },
  { id: "ods7", name: "Energía asequible y no contaminante", number: 7, color: "#FCC30B" },
  { id: "ods8", name: "Trabajo decente y crecimiento económico", number: 8, color: "#A21942" },
  { id: "ods9", name: "Industria, innovación e infraestructura", number: 9, color: "#FD6925" },
  { id: "ods10", name: "Reducción de las desigualdades", number: 10, color: "#DD1367" },
  { id: "ods11", name: "Ciudades y comunidades sostenibles", number: 11, color: "#FD9D24" },
  { id: "ods12", name: "Producción y consumo responsables", number: 12, color: "#BF8B2E" },
  { id: "ods13", name: "Acción por el clima", number: 13, color: "#3F7E44" },
  { id: "ods14", name: "Vida submarina", number: 14, color: "#0A97D9" },
  { id: "ods15", name: "Vida de ecosistemas terrestres", number: 15, color: "#56C02B" },
  { id: "ods16", name: "Paz, justicia e instituciones sólidas", number: 16, color: "#00689D" },
  { id: "ods17", name: "Alianzas para lograr los objetivos", number: 17, color: "#19486A" },
]

export function OdsSelector({ selectedODS, onSelectODS }: ODSSelectorProps) {
  // const [selectedODS, setSelectedODS] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredODS = useMemo(() => {
    return odsList.filter(ods => 
      ods.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleSelectODS = (odsId: string) => {
    const updatedODS = selectedODS.includes(odsId)
      ? selectedODS.filter(id => id !== odsId)
      : [...selectedODS, odsId];
    onSelectODS(updatedODS);
  }

  const handleRemoveODS = (odsId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onSelectODS(selectedODS.filter(id => id !== odsId));
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedODS.map(id => {
          const ods = odsList.find(o => o.id === id)
          if (!ods) return null
          return (
            <TooltipProvider key={ods.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center justify-between px-2 py-1 rounded-md text-xs font-bold"
                    style={{ backgroundColor: ods.color, color: 'white' }}
                  >
                    <span>{ods.number}</span>
                    <button
                      className="ml-1 text-white hover:text-gray-200"
                      onClick={(e) => handleRemoveODS(ods.id, e)}
                      aria-label={`Eliminar ${ods.name}`}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{ods.name}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
      <Select 
        onValueChange={handleSelectODS} 
        open={isOpen} 
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) {
            setSearchTerm("")
          }
        }}
      >
        <SelectTrigger className="w-[300px] border-green-500 focus:ring-green-500">
          <SelectValue placeholder="Selecciona ODS" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar ODS..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredODS.map((ods) => (
                <SelectItem 
                  key={ods.id} 
                  value={ods.id} 
                  className="focus:bg-transparent focus:text-inherit hover:bg-gray-100 data-[state=checked]:bg-transparent"
                  style={{ borderBottom: 'none' }}
                >
                  <div className="flex items-center">
                    <Checkbox
                      checked={selectedODS.includes(ods.id)}
                      onCheckedChange={() => handleSelectODS(ods.id)}
                      className="mr-2 border-2 data-[state=checked]:text-white"
                      style={{
                        borderColor: ods.color,
                        backgroundColor: selectedODS.includes(ods.id) ? ods.color : 'transparent'
                      }}
                    />
                    <div 
                      className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: ods.color }}
                    >
                      {ods.number}
                    </div>
                    {ods.name}
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          </ScrollArea>
        </SelectContent>
      </Select>
    </div>
  )
}