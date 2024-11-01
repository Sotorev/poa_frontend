
// ...existing code...

// Update schema by removing 'percentage'
const otherFinancingSourceSchema = z.object({
  financingSourceId: z.number({
    required_error: 'La fuente es requerida',
    invalid_type_error: 'La fuente debe ser un número',
  }),
  amount: z
    .number({
      required_error: 'El monto es requerido',
      invalid_type_error: 'El monto debe ser un número',
    })
    .nonnegative('El monto no puede ser negativo'),
})

// Update onSubmit to send contribution to parent without percentage
const onSubmit = (data: OtherFinancingSourceForm) => {
  const newContribution: OtherFinancingSource = {
    financingSourceId: data.financingSourceId,
    porcentaje: 0, // Percentage will be calculated in parent
    amount: data.amount,
  }
  onChangeContributions([...contributions, newContribution])
  reset()
  setIsAdding(false)
}

// Display percentages from contributions prop
{contributions.map((contribution, index) => {
  const fuente = financingSources.find(
    (source) => source.financingSourceId === contribution.financingSourceId
  )?.name
  return (
    <div key={index} className="flex items-center justify-between bg-green-100 p-2 rounded-md">
      <span className="text-green-800">
        {fuente}: {contribution.porcentaje.toFixed(2)}% - Q{contribution.amount.toFixed(2)}
      </span>
      // ...existing code...
    </div>
  )
})}

// ...existing code...
