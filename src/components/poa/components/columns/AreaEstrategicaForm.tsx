// components/columns/AreaEstrategicaForm.tsx
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { strategicAreaSchema } from '@/schemas/strategicAreaSchema';
import { z } from 'zod';
import { StrategicArea } from '@/hooks/useStrategicAreas';
import { Select } from '@/components/ui/select'; // Asumiendo que tienes un componente Select personalizado
import { Label } from '@/components/ui/label';

type StrategicAreaFormProps = {
  id: string;
  areas: StrategicArea[];
  currentValue: string;
  onSave: (id: string, value: string) => void;
};

type StrategicAreaFormValues = z.infer<typeof strategicAreaSchema>;

const AreaEstrategicaForm: React.FC<StrategicAreaFormProps> = ({ id, areas, currentValue, onSave }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<StrategicAreaFormValues>({
    resolver: zodResolver(strategicAreaSchema),
    defaultValues: {
      areaEstrategica: currentValue,
    },
  });

  const onSubmit: SubmitHandler<StrategicAreaFormValues> = data => {
    onSave(id, data.areaEstrategica);
  };

  return (
    <form onBlur={handleSubmit(onSubmit)}>
      <div>
        <Label htmlFor={`areaEstrategica-${id}`}>Área Estratégica</Label>
        <Select
          {...register('areaEstrategica')}
          defaultValue={currentValue}
        >
          <option value="">Selecciona un área estratégica</option>
          {areas.map(area => (
            <option key={area.strategicAreaId} value={area.name}>
              {area.name}
            </option>
          ))}
        </Select>
        {errors.areaEstrategica && <span className="text-red-500">{errors.areaEstrategica.message}</span>}
      </div>
    </form>
  );
};

export default AreaEstrategicaForm;
