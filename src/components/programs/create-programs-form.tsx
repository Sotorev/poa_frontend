import React from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { DialogClose } from '@/components/ui/dialog'

type Campus = {
  campusId: number
  name: string
}

type ProgramFormData = {
  name: string
  campusId?: number
  director: string
}

const programFormSchema = z.object({
  name: z.string().nonempty('El nombre es requerido'),
  director: z.string().nonempty('El director es requerido'),
  campusId: z.number().int().positive('Debe seleccionar una sede').optional(),
})

interface ProgramFormProps {
  onSubmit: (data: ProgramFormData) => Promise<void>
  initialData?: ProgramFormData | null
  onCancel: () => void
  campuses: Campus[]
}

export const ProgramForm: React.FC<ProgramFormProps> = ({
  onSubmit,
  initialData,
  onCancel,
  campuses,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ProgramFormData>({
    resolver: zodResolver(programFormSchema),
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
        <Label htmlFor="campusId">Sede</Label>
        <Controller
          name="campusId"
          control={control}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value ? Number(value) : undefined)}
              value={field.value !== undefined ? field.value.toString() : ''}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar sede" />
              </SelectTrigger>
              <SelectContent>
                {campuses.map((campus) => (
                  <SelectItem key={campus.campusId} value={campus.campusId.toString()}>
                    {campus.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.campusId && <p className="text-red-500 text-sm">{errors.campusId.message}</p>}
      </div>
      <div className="flex justify-end space-x-2">
        <DialogClose asChild>
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        </DialogClose>
        <Button type="submit">{initialData ? 'Actualizar' : 'Crear'} Carrera</Button>
      </div>
    </form>
  )
}
