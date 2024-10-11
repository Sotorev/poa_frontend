"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ChevronDown, ChevronUp, Edit, Plus, Search, X } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'

interface SectionProps {
  name: string
  isActive: boolean
}

interface Role {
  roleId: number
  roleName: string
  isDeleted: boolean
}

interface TeamMember {
  userId: number
  firstName: string
  lastName: string
  role: Role
  email: string
}

export function EquipoResponsableSection({ name, isActive }: SectionProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newMember, setNewMember] = useState<TeamMember>({
    userId: 0,
    firstName: "",
    lastName: "",
    role: { roleId: 0, roleName: "", isDeleted: false },
    email: ""
  })
  const [roles, setRoles] = useState<Role[]>([])
  const { user, loading } = useAuth()

  // Obtener roles desde el backend
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        if (!response.ok) {
          throw new Error('Error al obtener los roles')
        }
        const rolesData = await response.json()
        setRoles(rolesData)
      } catch (error) {
        console.error('Error al cargar los roles', error)
      }
    }

    fetchRoles()
  }, [])

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        if (!loading && user) {
          const userId = user.userId
          console.log("User ID:", userId)

          // Obtener datos del usuario
          const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${userId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          console.log("Fetching user data:", userResponse)
          if (!userResponse.ok) {
            throw new Error('Error al obtener datos del usuario')
          }
          const userData = await userResponse.json()
          console.log("User data received:", userData)
          const facultyId = userData.facultyId
          console.log("Faculty ID:", facultyId)

          // Obtener el poaId para esa facultad
          const poaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas?facultyId=${facultyId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          console.log("Fetching POA data:", poaResponse)
          if (!poaResponse.ok) {
            throw new Error('Error al obtener el POA')
          }
          const poaData = await poaResponse.json()
          console.log("POA data received:", poaData)

          // Asumimos que hay un solo POA para la facultad
          const poa = poaData[0]
          if (!poa) {
            throw new Error('No se encontró el POA para la facultad')
          }
          const poaId = poa.poaId
          console.log("POA ID:", poaId)

          // Obtener los miembros del equipo desde poa_team
          const poaTeamResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams?poaId=${poaId}`, {
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          })
          console.log("Fetching POA Team data:", poaTeamResponse)
          if (!poaTeamResponse.ok) {
            throw new Error('Error al obtener el equipo del POA')
          }
          const poaTeamData = await poaTeamResponse.json()
          console.log("POA Team data received:", poaTeamData)

          // Obtener los datos de los usuarios del equipo
          const teamMemberPromises = poaTeamData.map(async (member: any) => {
            const memberResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${member.userId}`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            console.log(`Fetching data for team member ${member.userId}:`, memberResponse)
            if (!memberResponse.ok) {
              throw new Error(`Error al obtener datos del miembro ${member.userId}`)
            }
            const memberData = await memberResponse.json()
            console.log(`Data received for team member ${member.userId}:`, memberData)

            // Obtener el rol del usuario
            const roleResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/roles/${memberData.roleId}`, {
              credentials: 'include',
              headers: {
                'Content-Type': 'application/json',
              },
            })
            console.log(`Fetching role for user ${memberData.userId}:`, roleResponse)
            if (!roleResponse.ok) {
              throw new Error(`Error al obtener el rol del usuario ${memberData.userId}`)
            }
            const roleData = await roleResponse.json()
            console.log(`Role data for user ${memberData.userId}:`, roleData)

            return {
              userId: memberData.userId,
              firstName: memberData.firstName,
              lastName: memberData.lastName,
              email: memberData.email,
              role: roleData
            }
          })

          const teamMembersData = await Promise.all(teamMemberPromises)
          console.log("All team members data:", teamMembersData)

          setTeamMembers(teamMembersData)
        }
      } catch (error) {
        console.error("Error al cargar los miembros del equipo", error)
      }
    }

    fetchTeamMembers()
  }, [user, loading])

  const handleEdit = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = async () => {
    try {
      console.log("Saving team members:", teamMembers)
      setIsEditing(false)
    } catch (error) {
      console.error("Error al guardar los cambios", error)
    }
  }

  const handleAddMember = async () => {
    try {
      if (newMember.firstName && newMember.lastName && newMember.email && newMember.role.roleId) {
        console.log("Adding new member:", newMember)

        const createUserResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            firstName: newMember.firstName,
            lastName: newMember.lastName,
            email: newMember.email,
            username: newMember.email,
            password: 'defaultpassword',
            roleId: newMember.role.roleId,
            facultyId: user?.facultyId,
            isDeleted: false
          }),
        })
        console.log("Create user response:", createUserResponse)
        if (!createUserResponse.ok) {
          throw new Error('Error al crear el usuario')
        }
        const createdUser = await createUserResponse.json()
        console.log("Created user:", createdUser)

        const facultyId = user?.facultyId
        console.log("Faculty ID:", facultyId)
        const poaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas?facultyId=${facultyId}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        })
        console.log("Fetching POA data:", poaResponse)
        if (!poaResponse.ok) {
          throw new Error('Error al obtener el POA')
        }
        const poaData = await poaResponse.json()
        console.log("POA data received:", poaData)
        const poa = poaData[0]
        if (!poa) {
          throw new Error('No se encontró el POA para la facultad')
        }
        const poaId = poa.poaId
        console.log("POA ID:", poaId)

        const addMemberResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            poaId: poaId,
            userId: createdUser.userId,
            isDeleted: false
          }),
        })
        console.log("Add member to POA Team response:", addMemberResponse)
        if (!addMemberResponse.ok) {
          throw new Error('Error al agregar el usuario al equipo')
        }
        const addedMember = await addMemberResponse.json()
        console.log("Added member to POA Team:", addedMember)

        // Obtener el rol del usuario
        const role = roles.find(r => r.roleId === newMember.role.roleId)

        setTeamMembers([...teamMembers, {
          userId: createdUser.userId,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          email: createdUser.email,
          role: role || { roleId: 0, roleName: '', isDeleted: false }
        }])
        setNewMember({
          userId: 0,
          firstName: "",
          lastName: "",
          role: { roleId: 0, roleName: "", isDeleted: false },
          email: ""
        })
      }
    } catch (error) {
      console.error("Error al agregar el miembro", error)
    }
  }

  const handleRemoveMember = async (userId: number) => {
    try {
      console.log("Removing member with ID:", userId)
      const facultyId = user?.facultyId
      console.log("Faculty ID:", facultyId)
      const poaResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poas?facultyId=${facultyId}`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log("Fetching POA data:", poaResponse)
      if (!poaResponse.ok) {
        throw new Error('Error al obtener el POA')
      }
      const poaData = await poaResponse.json()
      console.log("POA data received:", poaData)
      const poa = poaData[0]
      if (!poa) {
        throw new Error('No se encontró el POA para la facultad')
      }
      const poaId = poa.poaId
      console.log("POA ID:", poaId)

      const removeMemberResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/poateams/${poaId}/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      console.log("Remove member from POA Team response:", removeMemberResponse)
      if (!removeMemberResponse.ok) {
        throw new Error('Error al eliminar el usuario del equipo')
      }
      const removedMember = await removeMemberResponse.json()
      console.log("Removed member from POA Team:", removedMember)

      setTeamMembers(teamMembers.filter(member => member.userId !== userId))
    } catch (error) {
      console.error("Error al eliminar el miembro", error)
    }
  }

  const filteredMembers = teamMembers.filter(member =>
    `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.roleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
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
            <div className="space-y-4">
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Buscar miembros del equipo"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-grow"
                  />
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Email</TableHead>
                    {isEditing && <TableHead>Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.userId}>
                      <TableCell>{member.firstName} {member.lastName}</TableCell>
                      <TableCell>{member.role.roleName}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      {isEditing && (
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveMember(member.userId)}
                            aria-label="Eliminar miembro"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {isEditing && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Agregar nuevo miembro
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar nuevo miembro del equipo</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Nombre"
                        value={newMember.firstName}
                        onChange={(e) => setNewMember({...newMember, firstName: e.target.value})}
                      />
                      <Input
                        placeholder="Apellido"
                        value={newMember.lastName}
                        onChange={(e) => setNewMember({...newMember, lastName: e.target.value})}
                      />
                      <Input
                        placeholder="Email"
                        type="email"
                        value={newMember.email}
                        onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      />
                      <Select
                        value={newMember.role.roleId ? newMember.role.roleId.toString() : ""}
                        onValueChange={(value) => {
                          const selectedRole = roles.find(r => r.roleId === parseInt(value))
                          setNewMember({
                            ...newMember,
                            role: selectedRole || { roleId: 0, roleName: '', isDeleted: false }
                          })
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue>{newMember.role.roleName || "Seleccionar rol"}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map(role => (
                            <SelectItem key={role.roleId} value={role.roleId.toString()}>
                              {role.roleName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleAddMember}>Agregar miembro</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
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
