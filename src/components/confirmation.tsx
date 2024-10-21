'use client'

import { useEffect, useRef, useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Trash2, X, Send } from "lucide-react"
import { Label } from "@/components/ui/label"

type Comment = {
  id: number
  author: string
  content: string
  timestamp: string
}

type ComponentProps = {
  buttonText?: string
}

export function ConfirmationComponent({ buttonText = "Enviar comentario" }: ComponentProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const [comments, setComments] = useState<Comment[]>([
    { id: 0, author: "Juan Pérez", content: "Primer comentario", timestamp: "19 de octubre de 2024, 18:20" },
    { id: 1, author: "María García", content: "Segundo comentario", timestamp: "19 de octubre de 2024, 18:25" },
    { id: 2, author: "Carlos López", content: "Tercer comentario", timestamp: "19 de octubre de 2024, 18:30" },
    { id: 3, author: "Ana Martínez", content: "Cuarto comentario", timestamp: "19 de octubre de 2024, 18:35" },
    { id: 4, author: "Usuario Actual", content: "Quinto comentario", timestamp: "19 de octubre de 2024, 18:40" },
  ])
  const [newComment, setNewComment] = useState("")
  const currentUser = "Usuario Actual" // Simulamos un usuario actual
  const [isOpen, setIsOpen] = useState(true)

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [comments])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: comments.length + 1,
        author: currentUser,
        content: newComment,
        timestamp: new Date().toLocaleString('es-ES', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      }
      setComments([...comments, newCommentObj])
      setNewComment("")
    }
  }

  const handleDeleteComment = (id: number) => {
    setComments(comments.filter(comment => comment.id !== id))
  }

  if (!isOpen) return null

  return (
    <div className="relative w-[600px] mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e6f7f1] to-[#0f766e] opacity-50 blur-xl"></div>
      <div className="relative bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#0f766e] text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Confirmación</h2>
          <Button
            onClick={() => setIsOpen(false)}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#0a5c54] rounded-full"
            aria-label="Cerrar hilo de comentarios"
          >
            <X size={24} />
          </Button>
        </div>
        <div className="text-sm text-[#0f766e] px-4 py-2 bg-[#e6f7f1] bg-opacity-50">Evento predeterminado</div>
        <ScrollArea className="h-[300px] w-full" ref={scrollAreaRef}>
          <div className="p-3 space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-2 rounded-lg shadow ${
                  comment.author === currentUser
                    ? "bg-[#e6f7f1] bg-opacity-70 border-l-4 border-[#0f766e]"
                    : "bg-white bg-opacity-70 border border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`font-semibold ${
                    comment.author === currentUser ? "text-[#0f766e]" : "text-gray-700"
                  }`}>
                    {comment.author}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                    <button
                      onClick={() => handleDeleteComment(comment.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                      aria-label={`Eliminar comentario de ${comment.author}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-gray-700 break-words overflow-hidden word-break break-all">{comment.content}</p>
              </div>
            ))}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="p-3 bg-gray-50 bg-opacity-70 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="comment" className="text-sm text-gray-600 mb-1">
              Opcional
            </Label>
            <Textarea
              id="comment"
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="flex-grow bg-white bg-opacity-70 min-h-[60px] resize-y"
            />
            <Button type="submit" className="bg-[#0f766e] hover:bg-[#0a5c54] text-white self-end">
              <Send size={18} className="mr-2" />
              {buttonText}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}