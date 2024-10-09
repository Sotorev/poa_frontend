"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, ChevronUp, Edit, Plus, X } from 'lucide-react'

interface SectionProps {
  name: string
  isActive: boolean
}

interface FODAItem {
  id: string
  text: string
}

interface FODAData {
  fortalezas: FODAItem[]
  oportunidades: FODAItem[]
  debilidades: FODAItem[]
  amenazas: FODAItem[]
}

export function FODASection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [fodaData, setFodaData] = useState<FODAData>({
    fortalezas: [{ id: '1', text: 'Personal altamente calificado' }],
    oportunidades: [{ id: '1', text: 'Nuevas tecnologías emergentes' }],
    debilidades: [{ id: '1', text: 'Recursos financieros limitados' }],
    amenazas: [{ id: '1', text: 'Competencia creciente en el sector' }],
  })
  const [tempFodaData, setTempFodaData] = useState<FODAData>(fodaData)
  const [newItems, setNewItems] = useState<{ [key: string]: string }>({
    fortalezas: '',
    oportunidades: '',
    debilidades: '',
    amenazas: '',
  })

  useEffect(() => {
    if (isEditing) {
      setTempFodaData(fodaData)
    }
  }, [isEditing])

  const handleEdit = () => {
    if (isEditing) {
      // Cancel changes
      setTempFodaData(fodaData)
      setNewItems({
        fortalezas: '',
        oportunidades: '',
        debilidades: '',
        amenazas: '',
      })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setFodaData(tempFodaData)
    setIsEditing(false)
    // Aquí iría la lógica para guardar los datos en el backend
  }

  const handleAddItem = (category: keyof FODAData) => {
    if (newItems[category].trim()) {
      setTempFodaData(prevData => ({
        ...prevData,
        [category]: [...prevData[category], { id: Date.now().toString(), text: newItems[category].trim() }],
      }))
      setNewItems(prevItems => ({ ...prevItems, [category]: '' }))
    }
  }

  const handleRemoveItem = (category: keyof FODAData, id: string) => {
    setTempFodaData(prevData => ({
      ...prevData,
      [category]: prevData[category].filter(item => item.id !== id),
    }))
  }

  const renderFODAQuadrant = (title: string, category: keyof FODAData, bgColor: string) => (
    <div className={`p-4 ${bgColor} rounded-lg`}>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <ul className="space-y-2">
        {(isEditing ? tempFodaData : fodaData)[category].map(item => (
          <li key={item.id} className="flex items-center justify-between">
            <span>{item.text}</span>
            {isEditing && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveItem(category, item.id)}
                aria-label={`Eliminar ${item.text}`}
              >
                <X className="h-4 w-4" />
              </Button>
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
          />
          <Button onClick={() => handleAddItem(category)} size="icon" variant="ghost">
            <Plus className="h-4 w-4" />
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
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
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
            {isEditing && (
              <Button onClick={handleSave} className="mt-4">
                Guardar Cambios
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}