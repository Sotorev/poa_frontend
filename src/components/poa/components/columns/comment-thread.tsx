// src/components/columns/comment-thread.tsx

'use client';

import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash2, X, Send } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from 'react-toastify';

const commentSchema = z.object({
  entityType: z.string(),
  entityId: z.number(),
  userId: z.number(),
  comment: z.string().min(1, "El comentario no puede estar vacío"),
});

type CommentInput = z.infer<typeof commentSchema>;

type Comment = {
  commentId: number;
  entityType: string;
  entityId: number;
  userId: number;
  comment: string;
  timestamp: string;
  parentCommentId: number | null;
  isDeleted: boolean;
  Replies: Comment[];
};

interface CommentThreadProps {
  isOpen: boolean;
  onClose: () => void;
  entityId: number;
  entityName: string;
}

export function CommentThread({ isOpen, onClose, entityId, entityName }: CommentThreadProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const currentUserId = 1; // Reemplaza con el userId real

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommentInput>({
    resolver: zodResolver(commentSchema),
    defaultValues: {
      entityType: "Event",
      entityId: entityId,
      userId: currentUserId,
      comment: "",
    },
  });

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/entity/Event/${entityId}`);
      if (!response.ok) {
        throw new Error(`Error al obtener comentarios: ${response.statusText}`);
      }
      const data = await response.json();
      setComments(data.comments);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [comments]);

  const onSubmit = async (data: CommentInput) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al enviar el comentario: ${errorData.message || response.statusText}`);
      }
      reset();
      fetchComments();
    } catch (err) {
      setError((err as Error).message);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/comment/${commentId}`, {
        method: "DELETE",
        credentials: 'include',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Error al eliminar el comentario: ${errorData.message || response.statusText}`);
      }
      setComments(comments.filter(comment => comment.commentId !== commentId));
      toast.success("Comentario eliminado exitosamente.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="relative w-[600px] mx-auto">
      <div className="absolute inset-0 bg-gradient-to-br from-[#e6f7f1] to-[#0f766e] opacity-50 blur-xl"></div>
      <div className="relative bg-white bg-opacity-80 backdrop-blur-sm rounded-lg shadow-lg overflow-hidden">
        <div className="bg-[#0f766e] text-white p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Hilo de comentarios</h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-[#0a5c54] rounded-full"
            aria-label="Cerrar hilo de comentarios"
          >
            <X size={24} />
          </Button>
        </div>
        <div className="text-sm text-[#0f766e] px-4 py-2 bg-[#e6f7f1] bg-opacity-50">
          Evento: {entityName}
        </div>
        <ScrollArea className="h-[300px] w-full" ref={scrollAreaRef}>
          <div className="p-3 space-y-3">
            {loading ? (
              <p>Cargando comentarios...</p>
            ) : error ? (
              <p className="text-red-500">Error: {error}</p>
            ) : comments.length === 0 ? (
              <p>No hay comentarios disponibles.</p>
            ) : (
              comments.map((comment) => (
                <div
                  key={comment.commentId}
                  className={`p-2 rounded-lg shadow ${
                    comment.userId === currentUserId
                      ? "bg-[#e6f7f1] bg-opacity-70 border-l-4 border-[#0f766e]"
                      : "bg-white bg-opacity-70 border border-gray-200"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span
                      className={`font-semibold ${
                        comment.userId === currentUserId ? "text-[#0f766e]" : "text-gray-700"
                      }`}
                    >
                      {comment.userId === currentUserId ? "Usuario Actual" : `Usuario ${comment.userId}`}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {new Date(comment.timestamp).toLocaleString("es-ES")}
                      </span>
                      {comment.userId === currentUserId && (
                        <button
                          onClick={() => handleDeleteComment(comment.commentId)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                          aria-label={`Eliminar comentario de Usuario ${comment.userId}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-700 break-words overflow-hidden word-break break-all">
                    {comment.comment}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit(onSubmit)} className="p-3 bg-gray-50 bg-opacity-70 border-t border-gray-200">
          <div className="flex flex-col space-y-2">
            <Textarea
              placeholder="Escribe un comentario..."
              {...register("comment")}
              className="flex-grow bg-white bg-opacity-70 min-h-[60px] resize-y"
            />
            {errors.comment && <span className="text-red-500 text-sm">{errors.comment.message}</span>}
            <Button type="submit" className="bg-[#0f766e] hover:bg-[#0a5c54] text-white self-end">
              <Send size={18} className="mr-2" />
              Enviar comentario
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
