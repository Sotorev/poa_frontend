import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'

type Faculty = {
  facultyId: number
  name: string
}

type CampusFormData = {
  name: string
  city: string
  department: string
  facultyId?: number
  currentStudentCount?: number
}

const campusFormSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  city: z.string().nonempty('La ciudad es requerida'),
  department: z.string().nonempty('El departamento es requerido'),
  facultyId: z.number().int().positive('Debe seleccionar una facultad').optional(),
  currentStudentCount: z.number().int().min(0, 'Debe ser un número positivo').optional(),
})

interface CampusFormProps {
  onSubmit: (data: CampusFormData) => Promise<void>
  initialData?: CampusFormData | null
  onCancel: () => void
  faculties: Faculty[]
}

export const CampusForm: React.FC<CampusFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  faculties,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CampusFormData>({
    resolver: zodResolver(campusFormSchema),
    defaultValues: initialData || {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="city">Ciudad</Label>
          <Input id="city" {...register('city')} />
          {errors.city && <p className="text-red-500 text-sm">{errors.city.message}</p>}
        </div>
        <div>
          <Label htmlFor="department">Departamento</Label>
          <Input id="department" {...register('department')} />
          {errors.department && <p className="text-red-500 text-sm">{errors.department.message}</p>}
        </div>
      </div>
      <div>
        <Label htmlFor="currentStudentCount">Cantidad de estudiantes actuales</Label>
        <Input
          id="currentStudentCount"
          type="number"
          {...register('currentStudentCount', { valueAsNumber: true })}
        />
        {errors.currentStudentCount && (
          <p className="text-red-500 text-sm">{errors.currentStudentCount.message}</p>
        )}
      </div>
      <div>
        <Label htmlFor="facultyId">Facultad</Label>
        <Controller
          name="facultyId"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
              value={field.value !== undefined ? field.value.toString() : ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar facultad" />
              </SelectTrigger>
              <SelectContent>
                {faculties.map((faculty) => (
                  <SelectItem key={faculty.facultyId} value={faculty.facultyId.toString()}>
                    {faculty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.facultyId && <p className="text-red-500 text-sm">{errors.facultyId.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'} Sede</Button>
      </div>
    </form>
  )
}
