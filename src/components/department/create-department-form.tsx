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

type DepartmentFormData = {
  name: string
  facultyId?: number
  director: string
}

const departmentFormSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  director: z.string().nonempty('El director es requerido'),
  facultyId: z.number().int().positive('Debe seleccionar una facultad').optional(),
})

interface DepartmentFormProps {
  onSubmit: (data: DepartmentFormData) => Promise<void>
  initialData?: DepartmentFormData | null
  onCancel: () => void
  faculties: Faculty[]
}

export const DepartmentForm: React.FC<DepartmentFormProps> = ({
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
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
    defaultValues: initialData || {},
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" {...register('name')} />
        {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
      </div>
      <div>
        <Label htmlFor="director">Director</Label>
        <Input id="director" {...register('director')} />
        {errors.director && <p className="text-red-500 text-sm">{errors.director.message}</p>}
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
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'} Departamento</Button>
      </div>
    </form>
  )
}
