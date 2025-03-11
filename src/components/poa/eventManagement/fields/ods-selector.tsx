'use client'

import { useState, useMemo, useRef, useEffect, useContext } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Search, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { EventContext } from '../context.event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface OdsSelectorProps {
  selected: { "ods": number }[]
  onSelect: (odsId: { "ods": number }) => void
  onRemove: (odsId: number) => void
}

export function OdsSelector({ selected, onSelect, onRemove }: OdsSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const { odsList } = useContext(EventContext)

  const filteredODS = useMemo(() => {
    return odsList.filter((ods) =>
      ods.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [odsList, searchTerm])

  const handleSelectODS = (odsId: number) => {
    // Prevent re-selecting already selected ODS
    if (selected.some(ods => ods.ods === odsId)) {
      onRemove(odsId)
    } else onSelect({ "ods": odsId })
  }

  const handleRemoveODS = (odsId: number, event: React.MouseEvent) => {
    event.stopPropagation()
    onRemove(odsId)
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <div className="space-y-2">
              {/* Display de ODS seleccionados */}
              <div className="flex flex-wrap gap-2 mb-2">
                {selected.map((selectedOds) => {
                  const ods = odsList.find((o) => o.odsId === selectedOds.ods)
                  if (!ods) return null
                  return (
                    <Badge
                      key={ods.odsId}
                      variant="secondary"

                      style={{ backgroundColor: `#${ods.colorHex}33`, color: `#${ods.colorHex}` }}
                    >
                      <span className="mr-1">{ods.odsId}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-1 h-4 w-4 p-0 hover:opacity-80"
                        onClick={(e) => handleRemoveODS(ods.odsId, e)}
                        aria-label={`Eliminar ${ods.name}`}
                        style={{ color: `#${ods.colorHex}` }}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  )
                })}
              </div>

              {/* Selector de ODS usando Select component */}
              <Select
                open={isOpen}
                onOpenChange={setIsOpen}
                onValueChange={(val) => handleSelectODS(Number(val))}
                value=''
              >
                <SelectTrigger className="w-[300px] border border-primary focus:outline-none focus:ring-0 focus:ring-primary focus:border-primary">
                  <SelectValue placeholder="Selecciona ODS" />
                </SelectTrigger>
                <SelectContent>
                  <div className="flex items-center px-3 pb-2 sticky top-0 bg-white z-10">
                    <Search className="mr-2 h-4 w-4 shrink-0 text-gray-500" />
                    <Input
                      ref={searchInputRef}
                      placeholder="Buscar ODS..."
                      className="h-8 w-full bg-transparent focus:outline-none focus:ring-0 focus:border-primary border-primary"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <ScrollArea className="h-[200px]">
                    <SelectGroup>
                      {filteredODS.map((ods) => (
                        <SelectItem
                          key={ods.odsId}
                          value={ods.odsId.toString()}
                          className="focus:bg-primary/10 focus:text-primary hover:bg-primary/10"
                        >
                          <div className="flex items-center">
                            <Checkbox
                              checked={selected.some(selectedOds => selectedOds.ods === ods.odsId)}
                              className="mr-2 h-4 w-4 rounded "
                              style={{
                                borderColor: `#${ods.colorHex}`,
                                backgroundColor: selected.some(selectedOds => selectedOds.ods === ods.odsId)
                                ? `#${ods.colorHex}`
                                : `#${ods.colorHex}33`,
                                color: `ffffff`,
                              }}
                            />
                            <div
                              className="w-6 h-6 rounded-sm mr-2 flex items-center justify-center text-white text-xs font-bold"
                              style={{ backgroundColor: ods.colorHex ? `#${ods.colorHex}` : '#22c55e' }}
                            >
                              {ods.odsId}
                            </div>
                            <span>{ods.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TooltipTrigger>
      </Tooltip>
    </TooltipProvider>
  )
}
