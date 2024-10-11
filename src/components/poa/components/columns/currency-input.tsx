import React, { useState, useEffect } from 'react'
import { NumericFormat } from 'react-number-format'

interface CurrencyInputProps {
  value: number | undefined
  onChange: (value: number | undefined) => void
  width?: string
}

export default function CurrencyInput({ value, onChange, width = 'w-64' }: CurrencyInputProps) {
  const [inputValue, setInputValue] = useState<string>('')

  useEffect(() => {
    if (value !== undefined) {
      setInputValue(value.toString())
    }
  }, [value])

  const handleValueChange = (values: any) => {
    const { floatValue } = values
    onChange(floatValue)
  }

  return (
    <NumericFormat
      value={inputValue}
      onValueChange={handleValueChange}
      thousandSeparator=","
      decimalSeparator="."
      prefix="Q "
      decimalScale={2}
      fixedDecimalScale
      allowNegative={false}
      className={`${width} px-4 py-2 text-green-800 bg-green-50 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition duration-150 ease-in-out`}
      placeholder="Q 0.00"
    />
  )
}