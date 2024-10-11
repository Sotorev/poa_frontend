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
import { X, Search } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ODS {
  id: string
  name: string
  color: string
}

const odsList: ODS[] = [
  { id: "ods1", name: "1. Fin de la pobreza", color: "bg-[#e5243b]" },
  { id: "ods2", name: "2. Hambre cero", color: "bg-[#DDA63A]" },
  { id: "ods3", name: "3. Salud y bienestar", color: "bg-[#4C9F38]" },
  { id: "ods4", name: "4. Educación de calidad", color: "bg-[#C5192D]" },
  { id: "ods5", name: "5. Igualdad de género", color: "bg-[#FF3A21]" },
  { id: "ods6", name: "6. Agua limpia y saneamiento", color: "bg-[#26BDE2]" },
  { id: "ods7", name: "7. Energía asequible y no contaminante", color: "bg-[#FCC30B]" },
  { id: "ods8", name: "8. Trabajo decente y crecimiento económico", color: "bg-[#A21942]" },
  { id: "ods9", name: "9. Industria, innovación e infraestructura", color: "bg-[#FD6925]" },
  { id: "ods10", name: "10. Reducción de las desigualdades", color: "bg-[#DD1367]" },
  { id: "ods11", name: "11. Ciudades y comunidades sostenibles", color: "bg-[#FD9D24]" },
  { id: "ods12", name: "12. Producción y consumo responsables", color: "bg-[#BF8B2E]" },
  { id: "ods13", name: "13. Acción por el clima", color: "bg-[#3F7E44]" },
  { id: "ods14", name: "14. Vida submarina", color: "bg-[#0A97D9]" },
  { id: "ods15", name: "15. Vida de ecosistemas terrestres", color: "bg-[#56C02B]" },
  { id: "ods16", name: "16. Paz, justicia e instituciones sólidas", color: "bg-[#00689D]" },
  { id: "ods17", name: "17. Alianzas para lograr los objetivos", color: "bg-[#19486A]" },
]

export function OdsSelector() {
  const [selectedODS, setSelectedODS] = useState<ODS[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const filteredODS = useMemo(() => {
    return odsList.filter(ods => 
      ods.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const handleSelectODS = (odsId: string) => {
    const odsToAdd = odsList.find(ods => ods.id === odsId)
    if (odsToAdd && !selectedODS.some(ods => ods.id === odsId)) {
      const newSelectedODS = [...selectedODS, odsToAdd]
      setSelectedODS(newSelectedODS.sort((a, b) => parseInt(a.id.slice(3)) - parseInt(b.id.slice(3))))
    }
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleRemoveODS = (id: string) => {
    setSelectedODS(selectedODS.filter(ods => ods.id !== id))
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedODS.map((ods) => (
          <TooltipProvider key={ods.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`${ods.color} text-white rounded-full w-8 h-8 flex items-center justify-center relative group`}>
                  <span className="text-xs font-bold">{ods.id.slice(3)}</span>
                  <button
                    className="absolute -top-1 -right-1 bg-red-500 rounded-full w-4 h-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveODS(ods.id)}
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
        ))}
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
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Selecciona un ODS" />
        </SelectTrigger>
        <SelectContent>
          <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Input
              ref={searchInputRef}
              placeholder="Buscar ODS..."
              className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ScrollArea className="h-[200px]">
            <SelectGroup>
              {filteredODS.map((ods) => (
                <SelectItem key={ods.id} value={ods.id} className="focus:bg-accent focus:text-accent-foreground">
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full mr-2 ${ods.color}`}></div>
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