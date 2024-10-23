import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ChevronDown, ChevronUp, Edit } from 'lucide-react'
import { useSession } from 'next-auth/react'

interface SectionProps {
  name: string
  isActive: boolean
  isEditable: boolean
  poaId: number
  facultyId: number
}

export function FacultadDataSection({ name, isActive, isEditable, poaId, facultyId }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [facultadData, setFacultadData] = useState({
    nombreFacultad: "",
    nombreDecano: "",
    fechaPresentacion: ""
  })

  const [tempFacultadData, setTempFacultadData] = useState(facultadData)
  const [cantidadEstudiantes, setCantidadEstudiantes] = useState<number | ''>('') // Estado para la cantidad de estudiantes
  const { data: session } = useSession()
  const user = session?.user

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]

    const fetchFacultyData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculties/${facultyId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error('Error al obtener datos de la facultad')
        }
        const facultyData = await response.json()

        setFacultadData({
          nombreFacultad: facultyData.name,
          nombreDecano: facultyData.deanName,
          fechaPresentacion: facultyData.fechaPresentacion || today
        })
        setTempFacultadData({
          nombreFacultad: facultyData.name,
          nombreDecano: facultyData.deanName,
          fechaPresentacion: facultyData.fechaPresentacion || today
        })
      } catch (error) {
        console.error(error)
      }
    }

    const fetchPoaData = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas/${poaId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error('Error al obtener datos del POA')
        }
        const poaData = await response.json()

        // Actualiza la fecha de presentación con el submissionDate del POA
        setFacultadData(prevData => ({
          ...prevData,
          fechaPresentacion: poaData.submissionDate || today
        }))
        setTempFacultadData(prevData => ({
          ...prevData,
          fechaPresentacion: poaData.submissionDate || today
        }))
      } catch (error) {
        console.error(error)
      }
    }

    fetchFacultyData()
    fetchPoaData()
  }, [facultyId, poaId])

  const handleEdit = () => {
    if (isEditing) {
      setTempFacultadData(facultadData)
    }
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      const cantidadEstudiantesNumero = Number(cantidadEstudiantes);

      if (isNaN(cantidadEstudiantesNumero)) {
        throw new Error('Cantidad de estudiantes no es un número válido')
      }

      // Actualizar la información de la facultad
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/faculties/${facultyId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: tempFacultadData.nombreFacultad,
          deanName: tempFacultadData.nombreDecano,
          fechaPresentacion: tempFacultadData.fechaPresentacion
        })
      })
      if (!response.ok) {
        throw new Error('Error al actualizar datos de la facultad')
      }

      const data = await response.json()
      setFacultadData({
        nombreFacultad: data.name,
        nombreDecano: data.deanName,
        fechaPresentacion: data.fechaPresentacion || new Date().toISOString().split('T')[0]
      })

      const today = new Date().toISOString().split('T')[0]
      const responseStudents = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/facultystudenthistories/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          facultyId: facultyId,
          year: today.split('-')[0],
          studentCount: cantidadEstudiantesNumero
        })
      })
      if (!responseStudents.ok) {
        throw new Error('Error al crear la cantidad de estudiantes')
      }

      setIsEditing(false)
    } catch (error) {
      console.error(error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setTempFacultadData(prevData => ({
      ...prevData,
      [name]: value
    }))
  }

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
            {isEditable && ( // Aquí se cambia la lógica para mostrar el botón de editar solo si isEditable es true
              <Button variant="ghost" size="sm" onClick={handleEdit}>
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancelar" : "Editar"}
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
              {isMinimized ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        {!isMinimized && (
          <div className="p-4 bg-white">
            <div className="space-y-4">
              <div>
                <Label htmlFor="nombreFacultad">Nombre de la Facultad</Label>
                <Input
                  id="nombreFacultad"
                  name="nombreFacultad"
                  value={isEditing ? tempFacultadData.nombreFacultad : facultadData.nombreFacultad}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="nombreDecano">Nombre del Decano</Label>
                <Input
                  id="nombreDecano"
                  name="nombreDecano"
                  value={isEditing ? tempFacultadData.nombreDecano : facultadData.nombreDecano}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="fechaPresentacion">Fecha de Presentación del POA</Label>
                <Input
                  id="fechaPresentacion"
                  name="fechaPresentacion"
                  type="date"
                  value={facultadData.fechaPresentacion} 
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="cantidadEstudiantes">Cantidad de Estudiantes</Label>
                <Input
                  id="cantidadEstudiantes"
                  name="cantidadEstudiantes"
                  type="number"
                  value={cantidadEstudiantes}
                  onChange={(e) => setCantidadEstudiantes(Number(e.target.value))}
                  disabled={!isEditing}
                />
              </div>
              {isEditing && (
                <Button onClick={handleSave} className="mt-4">
                  Guardar Cambios
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
