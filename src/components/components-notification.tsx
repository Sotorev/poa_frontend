'use client'

import { useState, useEffect } from "react"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"

interface NotificationProps {
  message: string
  type: "success" | "error" | "info"
  duration?: number
  onClose: () => void
}

export function Notification({ message, type, duration = 3000, onClose }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      if (onClose) {
        onClose()
      }
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  const icons = {
    success: <CheckCircle className="h-5 w-5 text-green-400" />,
    error: <XCircle className="h-5 w-5 text-red-400" />,
    info: <AlertCircle className="h-5 w-5 text-blue-400" />
  }

  const bgColors = {
    success: "bg-green-50",
    error: "bg-red-50",
    info: "bg-blue-50"
  }

  const textColors = {
    success: "text-green-800",
    error: "text-red-800",
    info: "text-blue-800"
  }

  return (
    <div className={`fixed bottom-4 right-4 p-4 rounded-md shadow-lg ${bgColors[type]} ${textColors[type]}`}>
      <div className="flex items-center">
        {icons[type]}
        <span className="ml-3">{message}</span>
      </div>
    </div>
  )
}