'use client'

import * as React from "react"
import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function TotalComponent() {
  const [value, setValue] = useState<string>("")

  const formatCurrency = (val: string) => {
    const number = parseFloat(val.replace(/[^\d.-]/g, ""))
    if (isNaN(number)) return ""
    return new Intl.NumberFormat("es-GT", {
      style: "currency",
      currency: "GTQ",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(number)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/[^\d.-]/g, "")
    const number = parseFloat(inputValue)
    if (!isNaN(number)) {
      const formattedValue = new Intl.NumberFormat("es-GT", {
        style: "currency",
        currency: "GTQ",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(number)
      setValue(formattedValue.replace("GTQ", "").trim())
    } else {
      setValue("")
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="total" className="text-sm font-medium text-gray-700">
        Total
      </Label>
      <div className="relative w-48">
        <Input
          id="total"
          type="text"
          inputMode="numeric"
          defaultValue={value}
          onChange={handleChange}
          className="pl-8 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 text-sm"
          placeholder="0.00"
        />
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
          Q
        </span>
      </div>
    </div>
  )
}