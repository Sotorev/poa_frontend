'use client'

import React from 'react'

interface SectionProps {
  name: string
  isActive: boolean
}

export function VisualizarIntervencionesSection({ name, isActive }: SectionProps) {
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
          <div className="space-y-6 w-full">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Intervenciones Aprobadas</h3>
              <div className="bg-green-50 p-4 rounded-md shadow-sm">
                <table className="min-w-full divide-y divide-green-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">001</td>
                      <td className="px-4 py-3 text-sm text-gray-900">Intervención aprobada 1</td>
                      <td className="px-4 py-3 text-sm text-gray-900">2023-06-01</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">002</td>
                      <td className="px-4 py-3 text-sm text-gray-900">Intervención aprobada 2</td>
                      <td className="px-4 py-3 text-sm text-gray-900">2023-06-15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">Intervenciones Por Aprobar</h3>
              <div className="bg-green-50 p-4 rounded-md shadow-sm">
                <table className="min-w-full divide-y divide-green-200">
                  <thead className="bg-green-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Descripción</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-green-700 uppercase tracking-wider">Fecha de Solicitud</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-green-200">
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">003</td>
                      <td className="px-4 py-3 text-sm text-gray-900">Intervención pendiente 1</td>
                      <td className="px-4 py-3 text-sm text-gray-900">2023-07-01</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm text-gray-900">004</td>
                      <td className="px-4 py-3 text-sm text-gray-900">Intervención pendiente 2</td>
                      <td className="px-4 py-3 text-sm text-gray-900">2023-07-15</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}