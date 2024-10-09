'use client'

import React from 'react'

interface SectionProps {
  name: string
  isActive: boolean
}

export function DepartamentosFacultadSection({ name, isActive }: SectionProps) {
  return (
    <div id={name} className="mb-6">
      <div
        className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 ${
          isActive ? 'ring-2 ring-green-400' : ''
        }`}
      >
        <div className="p-4 bg-green-50">
          <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
        </div>
        <div className="p-4 bg-white">
          <div className="text-center py-8">
            <p className="text-gray-600">Formulario para agregar/confirmar departamentos de la Facultad</p>
            <p className="mt-2 text-sm text-gray-500">Aquí se mostrará el formulario específico para esta sección.</p>
          </div>
        </div>
      </div>
    </div>
  )
}