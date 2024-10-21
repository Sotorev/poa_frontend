'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Edit, X, Check } from 'lucide-react'

interface SectionProps {
  name: string
  isActive: boolean
  facultyId: number 
}

interface FODAItem {
  swotId: number
  type: 'Fortaleza' | 'Debilidad' | 'Oportunidad' | 'Amenaza'
  description: string
}

interface FODAData {
  fortalezas: FODAItem[]
  oportunidades: FODAItem[]
  debilidades: FODAItem[]
  amenazas: FODAItem[]
}

export function FodaSection({ name, isActive, facultyId }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fodaData, setFodaData] = useState<FODAData>({
    fortalezas: [],
    oportunidades: [],
    debilidades: [],
    amenazas: [],
  })
  const [newItems, setNewItems] = useState<{ [key: string]: string }>({
    fortalezas: '',
    oportunidades: '',
    debilidades: '',
    amenazas: '',
  })
  const [editingItem, setEditingItem] = useState<{ category: keyof FODAData; swotId: number } | null>(null)

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // Función para mapear categorías a tipos del backend
  const mapCategoryToType = (category: keyof FODAData): FODAItem['type'] => {
    switch(category) {
      case 'fortalezas':
        return 'Fortaleza'
      case 'oportunidades':
        return 'Oportunidad'
      case 'debilidades':
        return 'Debilidad'
      case 'amenazas':
        return 'Amenaza'
    }
  }

  // Obtener datos FODA del backend
  useEffect(() => {
    const fetchFodaData = async () => {
      try {
        const response = await fetch(`${API_URL}/api/facultyswots/faculty/${facultyId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        })
        if (!response.ok) {
          throw new Error('Error al obtener los datos FODA')
        }
        const data: FODAItem[] = await response.json()
        // Agrupar los datos por categoría
        const groupedData: FODAData = {
          fortalezas: [],
          oportunidades: [],
          debilidades: [],
          amenazas: [],
        }
        data.forEach(item => {
          switch(item.type) {
            case 'Fortaleza':
              groupedData.fortalezas.push(item)
              break
            case 'Oportunidad':
              groupedData.oportunidades.push(item)
              break
            case 'Debilidad':
              groupedData.debilidades.push(item)
              break
            case 'Amenaza':
              groupedData.amenazas.push(item)
              break
          }
        })
        setFodaData(groupedData)
      } catch (error) {
        console.error(error)
      }
    }

    fetchFodaData()
  }, [API_URL, facultyId])

  const handleEdit = () => {
    setIsEditing(!isEditing)
    setEditingItem(null)
    setNewItems({
      fortalezas: '',
      oportunidades: '',
      debilidades: '',
      amenazas: '',
    })
  }

  const handleAddItem = async (category: keyof FODAData) => {
    const description = newItems[category].trim()
    if (description) {
      try {
        const response = await fetch(`${API_URL}/api/facultyswots/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
          body: JSON.stringify({
            facultyId,
            type: mapCategoryToType(category),
            description,
          }),
        })
        if (!response.ok) {
          throw new Error('Error al agregar el elemento FODA')
        }
        const newItem: FODAItem = await response.json()
        setFodaData(prevData => ({
          ...prevData,
          [category]: [...prevData[category], newItem],
        }))
        setNewItems(prevItems => ({ ...prevItems, [category]: '' }))
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleRemoveItem = async (category: keyof FODAData, swotId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/facultyswots/${swotId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Error al eliminar el elemento FODA')
      }
      setFodaData(prevData => ({
        ...prevData,
        [category]: prevData[category].filter(item => item.swotId !== swotId),
      }))
    } catch (error) {
      console.error(error)
    }
  }

  const handleEditItem = (category: keyof FODAData, swotId: number) => {
    setEditingItem({ category, swotId })
  }

  const handleUpdateItem = async (category: keyof FODAData, swotId: number, newText: string) => {
    try {
      const response = await fetch(`${API_URL}/api/facultyswots/${swotId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: newText,
        }),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar el elemento FODA')
      }
      const updatedItem: FODAItem = await response.json()
      setFodaData(prevData => ({
        ...prevData,
        [category]: prevData[category].map(item => 
          item.swotId === swotId ? updatedItem : item
        ),
      }))
      setEditingItem(null)
    } catch (error) {
      console.error(error)
    }
  }

  const renderFODAQuadrant = (title: string, category: keyof FODAData, bgColor: string) => (
    <div className={`p-4 ${bgColor} rounded-lg`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="space-y-2">
        {fodaData[category].map(item => (
          <li key={item.swotId} className="flex items-center justify-between">
            {editingItem?.category === category && editingItem.swotId === item.swotId ? (
              <Input
                value={item.description}
                onChange={(e) => {
                  const updatedDescription = e.target.value
                  // Actualizar temporalmente en el estado local
                  setFodaData(prevData => ({
                    ...prevData,
                    [category]: prevData[category].map(fodaItem =>
                      fodaItem.swotId === item.swotId ? { ...fodaItem, description: updatedDescription } : fodaItem
                    ),
                  }))
                }}
                className="flex-grow mr-2"
                aria-label={`Editar ${title}`}
              />
            ) : (
              <span>{item.description}</span>
            )}
            {isEditing && (
              <div className="flex items-center space-x-2">
                {editingItem?.category !== category || editingItem.swotId !== item.swotId ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEditItem(category, item.swotId)}
                    aria-label={`Editar ${item.description}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleUpdateItem(category, item.swotId, item.description)}
                    aria-label={`Guardar ${item.description}`}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveItem(category, item.swotId)}
                  aria-label={`Eliminar ${item.description}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </li>
        ))}
      </ul>
      {isEditing && (
        <div className="mt-2 flex items-center space-x-2">
          <Input
            value={newItems[category]}
            onChange={(e) => setNewItems({ ...newItems, [category]: e.target.value })}
            placeholder={`Nuevo ${title.toLowerCase()}`}
            className="flex-grow"
            aria-label={`Agregar nuevo ${title}`}
          />
          <Button 
            onClick={() => handleAddItem(category)} 
            size="icon" 
            variant="ghost"
            aria-label={`Agregar ${title}`}
          >
            <Check className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )

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
              {isEditing ? "Finalizar edición" : "Editar"}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsMinimized(!isMinimized)}
              aria-label={isMinimized ? "Expandir sección" : "Minimizar sección"}
            >
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderFODAQuadrant('Fortalezas', 'fortalezas', 'bg-blue-100')}
              {renderFODAQuadrant('Oportunidades', 'oportunidades', 'bg-green-100')}
              {renderFODAQuadrant('Debilidades', 'debilidades', 'bg-yellow-100')}
              {renderFODAQuadrant('Amenazas', 'amenazas', 'bg-red-100')}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
