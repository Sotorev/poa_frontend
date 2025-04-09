"use client"

import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"

interface PhaseIndicatorProps {
  phases: {
    number: number
    name: string
    hasError: boolean
  }[]
  currentPhase?: number
  onPhaseClick?: (phase: number) => void
}

export function PhaseIndicator({ phases, currentPhase, onPhaseClick }: PhaseIndicatorProps) {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto ">
      {phases.map((phase, index) => (
        <div
          key={phase.number}
          className="flex flex-col items-center relative group"
          onClick={() => onPhaseClick?.(phase.number)}
          role="button"
          tabIndex={0}
        >
          <div
            className={cn(
              "flex items-center justify-center w-12 h-12 rounded-full text-base font-medium transition-all border-2",
              phase.hasError
                ? "border-destructive bg-destructive/10 text-destructive"
                : currentPhase === phase.number
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 bg-gray-50 text-gray-400",
              "hover:opacity-90 cursor-pointer",
            )}
          >
            {phase.hasError ? <AlertCircle className="h-5 w-5" /> : phase.number}
          </div>
          <span className="mt-2 text-sm text-gray-600">{phase.name}</span>
          {index < phases.length - 1 && (
            <div
              className={cn(
                "absolute top-6 left-[calc(100%+0.5rem)] w-[calc(100%-3rem)] h-[2px]",
                currentPhase && phase.number < currentPhase ? "bg-primary" : "bg-gray-200",
              )}
            />
          )}
        </div>
      ))}
    </div>
  )
}

