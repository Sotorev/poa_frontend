// src/components/poa/eventManagement/fields/financing-source.tsx
"use client"

import { useContext, useMemo, useEffect, useState } from "react"
import { EventContext } from "../context.event"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Plus } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UseFormReturn, Controller, FieldError } from "react-hook-form"
import { z } from "zod"
import { createFullEventSchema } from "@/schemas/event-schema"

// Types
import { FinancingSourceRequest } from "../formView/schema.eventPlanningForm"

// Helper function to calculate totals for UMES/External from a list of financings
const calculateTypeTotal = (
  financings: FinancingSourceRequest[], 
  isUmesType: boolean, 
  allFinancingSources: Array<{financingSourceId: number; category: string; isDeleted?: boolean}> | undefined
) => {
  return financings.reduce((acc, contribution) => {
    if (contribution.isDeleted) return acc;
    const sourceDetails = allFinancingSources?.find(s => s.financingSourceId === contribution.financingSourceId);
    if (!sourceDetails || sourceDetails.isDeleted) return acc;
    const contributionIsUMES = sourceDetails.category === "UMES";
    if ((isUmesType && contributionIsUMES) || (!isUmesType && sourceDetails.category === "Otra")) {
      return acc + (contribution.amount || 0);
    }
    return acc;
  }, 0);
};

interface FinancingSectionsProps {
  allFinancingsFromField: FinancingSourceRequest[];
  onFieldChange: (...event: any[]) => void;
  formRef: UseFormReturn<z.infer<typeof createFullEventSchema>>;
  fieldError?: FieldError;
}

function FinancingSections({ allFinancingsFromField, onFieldChange, formRef, fieldError }: FinancingSectionsProps) {
  const { financingSources: contextFinancingSources } = useContext(EventContext);
  
  const umesTotal = useMemo(() => 
    calculateTypeTotal(allFinancingsFromField, true, contextFinancingSources), 
    [allFinancingsFromField, contextFinancingSources]
  );
  const externalTotal = useMemo(() => 
    calculateTypeTotal(allFinancingsFromField, false, contextFinancingSources), 
    [allFinancingsFromField, contextFinancingSources]
  );

  useEffect(() => {
    formRef.setValue('totalCost', umesTotal + externalTotal, { shouldValidate: true });
  }, [umesTotal, externalTotal, formRef]);

  useEffect(() => {
    const grandTotal = umesTotal + externalTotal;
    let changed = false;

    const updatedFinancings = allFinancingsFromField.map(fin => {
      if (fin.isDeleted) return { ...fin, percentage: 0 };
      const currentAmount = fin.amount || 0;
      let newPercentage = 0;
      if (grandTotal > 0) {
        newPercentage = parseFloat(((currentAmount / grandTotal) * 100).toFixed(2));
      }
      newPercentage = isNaN(newPercentage) ? 0 : newPercentage;
      const currentPercentage = parseFloat((fin.percentage || 0).toFixed(2));

      if (currentPercentage !== newPercentage) {
        changed = true;
        return { ...fin, percentage: newPercentage };
      }
      return fin;
    });

    if (changed) {
      onFieldChange(updatedFinancings);
    }
  }, [allFinancingsFromField, umesTotal, externalTotal, onFieldChange]);

  const commonCallbacks = {
    onAppendContribution: (newContribution: FinancingSourceRequest) => {
      onFieldChange([...allFinancingsFromField, { ...newContribution, percentage: 0, amount: newContribution.amount || 0, financingSourceId: newContribution.financingSourceId || 0 }]);
    },
    onUpdateContribution: (index: number, updatedItem: FinancingSourceRequest) => {
      const updatedList = [...allFinancingsFromField];
      updatedList[index] = { 
        ...updatedItem, 
        amount: updatedItem.amount || 0, 
        financingSourceId: updatedItem.financingSourceId || 0,
        percentage: updatedItem.percentage || 0
      };
      onFieldChange(updatedList);
    },
    onRemoveContribution: (index: number) => {
      const itemToRemove = allFinancingsFromField[index];
      if (itemToRemove.eventFinancingId) {
        const updatedList = allFinancingsFromField.map((item, i) => i === index ? { ...item, isDeleted: true, amount: 0 } : item);
        onFieldChange(updatedList);
      } else {
        const updatedList = allFinancingsFromField.filter((_, i) => i !== index);
        onFieldChange(updatedList);
      }
    },
  };

  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-700">Financiamiento UMES</h4>
        <FinancingSource
          contributions={allFinancingsFromField}
          {...commonCallbacks}
          onTotalCostChangeForType={() => {}}
          isUMES={true}
          title="Financiamiento UMES"
        />
      </div>
      <div>
        <h4 className="text-sm font-semibold mb-2 text-gray-700">Financiamiento Externo</h4>
        <FinancingSource
          contributions={allFinancingsFromField}
          {...commonCallbacks}
          onTotalCostChangeForType={() => {}}
          isUMES={false}
          title="Financiamiento Externo"
        />
      </div>
      {fieldError?.message && (
        <p className="text-xs text-red-500 mt-2 ml-1">{fieldError.message}</p>
      )}
    </div>
  );
}

export function EventFinancings({ form }: { form: UseFormReturn<z.infer<typeof createFullEventSchema>> }) {
  return (
    <Controller
      name="financings"
      control={form.control}
      defaultValue={[]}
      render={({ field, fieldState: { error } }) => {
        const normalizedFinancings = (Array.isArray(field.value) ? field.value : []).map(fin => ({
          financingSourceId: fin.financingSourceId || 0, 
          amount: fin.amount || 0,
          percentage: fin.percentage || 0,
          eventFinancingId: fin.eventFinancingId,
          isDeleted: fin.isDeleted || false,
        })) as FinancingSourceRequest[];

        return <FinancingSections 
                  allFinancingsFromField={normalizedFinancings} 
                  onFieldChange={field.onChange} 
                  formRef={form} 
                  fieldError={error}
                />;
      }}
    />
  );
}

interface FinancingSourceProps {
  contributions: FinancingSourceRequest[] 
  onAppendContribution: (contribution: FinancingSourceRequest) => void
  onRemoveContribution: (index: number) => void
  onUpdateContribution: (index: number, contribution: FinancingSourceRequest) => void
  onTotalCostChangeForType: (totalCost: number) => void
  isUMES: boolean
  title: string
}

export function FinancingSource({
  contributions,
  onAppendContribution,
  onRemoveContribution,
  onUpdateContribution,
  isUMES,
  title
}: FinancingSourceProps) {
  const { financingSources } = useContext(EventContext)
  const [inputValues, setInputValues] = useState<Record<number, string>>({});

  const filteredSelectableSources = useMemo(() => {
    return financingSources?.filter(
      (source) => !source.isDeleted && (isUMES ? source.category === "UMES" : source.category === "Otra"),
    )
  }, [financingSources, isUMES])

  const isNoAplica = (financingSourceId: number) => {
    const source = financingSources?.find(src => src.financingSourceId === financingSourceId);
    return source?.name === "No Aplica";
  }

  const handleSourceChange = (index: number, value: string) => {
    const financingSourceId = Number.parseInt(value, 10)
    const originalItem = contributions[index];
    if (!originalItem) return;
    const amount = isNoAplica(financingSourceId) ? 0 : originalItem.amount;
    onUpdateContribution(index, { 
        ...originalItem, 
        financingSourceId, 
        amount, 
        percentage: originalItem.percentage || 0
    });
  }

  const limitDecimalPlaces = (value: string): string => {
    if (!value) return '';
    const parts = value.split('.');
    if (parts.length > 1 && parts[1].length > 2) {
      return `${parts[0]}.${parts[1].substring(0, 2)}`;
    }
    return value;
  };

  const handleInputChange = (index: number, value: string) => {
    const numericRegex = /^[0-9]*\.?[0-9]*$/;
    if (value === '' || numericRegex.test(value)) {
      setInputValues({ ...inputValues, [index]: limitDecimalPlaces(value) });
      const originalItem = contributions[index];
      if (!originalItem) return;
      const amount = value ? Number.parseFloat(limitDecimalPlaces(value)) || 0 : 0;
      onUpdateContribution(index, { 
          ...originalItem, 
          amount, 
          percentage: originalItem.percentage || 0
        });
    }
  };

  const commitValueChange = (index: number, value: string) => {
    const originalItem = contributions[index];
    if (!originalItem) return;
    const amount = value ? Number.parseFloat(limitDecimalPlaces(value)) || 0 : 0;
    onUpdateContribution(index, { 
        ...originalItem, 
        amount, 
        percentage: originalItem.percentage || 0
    });
    setInputValues(prev => ({ ...prev, [index]: amount.toFixed(2) }));
  };
  
  const handleActualRemoveContribution = (originalIndex: number) => {
    onRemoveContribution(originalIndex);
  };

  const handleAddContribution = () => {
    if (!filteredSelectableSources || filteredSelectableSources.length === 0) return;
    const newContribution: FinancingSourceRequest = {
      financingSourceId: filteredSelectableSources[0].financingSourceId,
      percentage: 0,
      amount: 0,
      isDeleted: false,
    };
    onAppendContribution(newContribution);
  }

  const displayedContributionsAndIndices = useMemo(() => {
    return contributions
      .map((contribution, originalIndex) => ({ contribution, originalIndex }))
      .filter(({ contribution }) => {
        if (contribution.isDeleted) return false;
        const sourceDetails = financingSources?.find(s => s.financingSourceId === contribution.financingSourceId);
        if (!sourceDetails || sourceDetails.isDeleted) return false;
        const contributionIsUMES = sourceDetails.category === "UMES";
        return isUMES ? contributionIsUMES : (sourceDetails.category === "Otra");
      });
  }, [contributions, financingSources, isUMES]);

  return (
    <div className="space-y-3 p-3 border rounded-md bg-slate-50/50 min-h-[100px]">
      {displayedContributionsAndIndices.map(({ contribution, originalIndex }) => {
          const isSourceNoAplica = isNoAplica(contribution.financingSourceId);
          const displayValue = inputValues[originalIndex] !== undefined
            ? inputValues[originalIndex]
            : (isSourceNoAplica ? "0.00" : (contribution.amount ? contribution.amount.toFixed(2) : ""));

          return (
            <div key={originalIndex} className="flex items-end gap-3">
              <div className="flex-1 min-w-0">
                <label htmlFor={`source-${originalIndex}-${isUMES}`} className="block text-xs font-medium mb-1 text-gray-600">
                  Fuente
                </label>
                <Select
                  value={contribution.financingSourceId ? contribution.financingSourceId.toString() : ''}
                  onValueChange={(value) => handleSourceChange(originalIndex, value)}
                  disabled={contribution.isDeleted}
                >
                  <SelectTrigger id={`source-${originalIndex}-${isUMES}`} className="border-primary h-9 text-xs">
                    <SelectValue placeholder="Seleccionar fuente" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredSelectableSources?.map((source) => (
                      <SelectItem key={source.financingSourceId} value={source.financingSourceId.toString()} className="text-xs">
                        {source.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-shrink-0">
                <label htmlFor={`amount-${originalIndex}-${isUMES}`} className="block text-xs font-medium mb-1 text-gray-600">
                  Monto
                </label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative">
                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                          Q
                        </span>
                        <Input
                          id={`amount-${originalIndex}-${isUMES}`}
                          type="text"
                          inputMode="decimal"
                          value={displayValue}
                          onChange={(e) => handleInputChange(originalIndex, e.target.value)}
                          className={`border-primary ${isSourceNoAplica || contribution.isDeleted ? "opacity-70 cursor-not-allowed" : ""} pl-6 pr-2 py-1 h-9 w-36 text-xs`}
                          disabled={isSourceNoAplica || contribution.isDeleted}
                          onBlur={(e) => {
                            if (!isSourceNoAplica && !contribution.isDeleted) {
                              commitValueChange(originalIndex, e.target.value);
                            }
                          }}
                          placeholder="0.00"
                        />
                      </div>
                    </TooltipTrigger>
                    {isSourceNoAplica && (
                      <TooltipContent>
                        <p className="text-xs">No se puede ingresar un valor porque está seleccionado "No Aplica"</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-2 pt-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleActualRemoveContribution(originalIndex)}
                    className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600"
                    disabled={contribution.isDeleted}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <span className={`text-sm font-medium text-primary min-w-[50px] text-right ${contribution.isDeleted ? 'line-through text-gray-400' : ''}`}>
                    {(contribution.percentage !== undefined ? contribution.percentage : 0).toFixed(2)}%
                  </span>
                </div>
            </div>
          )
        })}
      {displayedContributionsAndIndices.length === 0 && (
        <p className="text-xs text-gray-500 italic text-center py-2">No hay aportes de tipo {isUMES ? "UMES" : "Externo"}.</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddContribution}
        className="text-primary border-primary hover:bg-primary/10 text-xs mt-2"
      >
        <Plus className="h-3 w-3 mr-1.5" />
        Agregar Aporte{isUMES ? " UMES" : " Externo"}
      </Button>
    </div>
  )
}