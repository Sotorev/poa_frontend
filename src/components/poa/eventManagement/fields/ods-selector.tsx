'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChevronDown, X } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Checkbox } from '@/components/ui/checkbox'
import { useCurrentUser } from '@/hooks/use-current-user'
import { getODS } from '@/services/apiService'
import { ODS } from '@/types/ods'  // Asegúrate de importar correctamente el tipo ODS

interface OdsSelectorProps {
  selectedODS: string[]
  onSelectODS: (ods: string[]) => void
}

export function OdsSelector({ selectedODS, onSelectODS }: OdsSelectorProps) {
  const [odsList, setOdsList] = useState<ODS[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)  // Referencia al contenedor principal
  const user = useCurrentUser()

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getODS(user?.token || '')
        const activeODS = data.filter((ods) => !ods.isDeleted)
        activeODS.sort((a, b) => {
          if (a.sortNo !== null && b.sortNo !== null) {
            return (a.sortNo ?? 0) - (b.sortNo ?? 0)
          }
          return a.odsId - b.odsId
        })
        setOdsList(activeODS)
      } catch (error) {
        console.error('Error al obtener ODS:', error)
        setError('No se pudieron cargar los ODS.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.token])

  const filteredODS = useMemo(() => {
    return odsList.filter((ods) =>
      ods.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [odsList, searchTerm])

  const handleSelectODS = (odsId: string) => {
    const updatedODS = selectedODS.includes(odsId)
      ? selectedODS.filter((id) => id !== odsId)
      : [...selectedODS, odsId]
    onSelectODS(updatedODS)
  }

  const handleRemoveODS = (odsId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedODS = selectedODS.filter((id) => id !== odsId)
    onSelectODS(updatedODS)
  }

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  // Función para manejar clics fuera del contenedor
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchTerm('')
      }
    }

    // Agregar listener solo cuando el menú está abierto
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    // Limpiar el listener al desmontar el componente
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (loading) return <div className="text-green-600">Cargando ODS...</div>
  if (error) return <div className="text-red-500">Error: {error}</div>

  return (
    <div className="space-y-2" ref={containerRef}>
      {/* Display de ODS seleccionados */}
      <div className="flex flex-wrap gap-1 mb-2">
        {selectedODS.map((id) => {
          const ods = odsList.find((o) => o.odsId.toString() === id)
          if (!ods) return null
          return (
            <TooltipProvider key={ods.odsId}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-bold text-white"
                    style={{ backgroundColor: `#${ods.colorHex}` }}
                  >
                    <span>{ods.odsId}</span>
                    <button
                      onClick={(e) => handleRemoveODS(ods.odsId.toString(), e)}
                      className="hover:opacity-80 transition-opacity"
                      aria-label={`Remove ${ods.name}`}
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

      {/* Selector de ODS personalizado para multi-selección */}
      <div className="relative">
        <button
          type="button"
          className="w-[300px] flex justify-between items-center px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 hover:border-green-300 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span>{selectedODS.length > 0 ? `${selectedODS.length} ODS seleccionados` : 'Selecciona ODS'}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
        {isOpen && (
          <div className="absolute mt-1 w-full bg-white border rounded-md shadow-lg z-20 border-green-100">
            <div className="flex items-center px-3 py-2 sticky top-0 bg-white z-10 border-b border-green-100">
              <ChevronDown className="mr-2 h-4 w-4 shrink-0 opacity-50" />
              <Input
                ref={searchInputRef}
                placeholder="Buscar ODS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 w-full bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 border-none"
              />
            </div>
            <ScrollArea className="h-[200px]">
              <div className="px-2">
                {filteredODS.map((ods) => (
                  <div
                    key={ods.odsId}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-green-50 cursor-pointer rounded-sm transition-colors"
                    onClick={() => handleSelectODS(ods.odsId.toString())}
                  >
                    <Checkbox
                      checked={selectedODS.includes(ods.odsId.toString())}
                      className="rounded border-gray-300"
                      style={{
                        borderColor: ods.colorHex ? `#${ods.colorHex}` : '#22c55e',
                        backgroundColor: selectedODS.includes(ods.odsId.toString())
                          ? ods.colorHex ? `#${ods.colorHex}` : '#22c55e'
                          : 'transparent',
                      }}
                      onChange={() => handleSelectODS(ods.odsId.toString())}
                      aria-label={`Seleccionar ODS ${ods.name}`}
                    />
                    <div
                      className="w-6 h-6 rounded-sm flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: ods.colorHex ? `#${ods.colorHex}` : '#22c55e' }}
                    >
                      {ods.odsId}
                    </div>
                    <span>{ods.name}</span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}
