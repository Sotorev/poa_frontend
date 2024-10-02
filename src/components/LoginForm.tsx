"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")
	const router = useRouter()

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsLoading(true)
		setError("")

		const formData = new FormData(event.currentTarget)
		const username = formData.get("username") as string
		const password = formData.get("password") as string

		try {
			const response = await fetch("http://localhost:4000/api/auth/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username, password }),
				credentials: "include", // This is important for including cookies
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.message || "Error al iniciar sesión")
			}

			// If login is successful, redirect to dashboard
			router.push("/")
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al iniciar sesión")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full max-w-[400px] space-y-4">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold tracking-tighter">Iniciar sesión en POA</h1>
				<p className="text-sm text-muted-foreground">Ingrese sus credenciales para acceder a su cuenta</p>
			</div>
			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="username" className="sr-only">
						Nombre de usuario
					</Label>
					<Input
						id="username"
						name="username"
						placeholder="Nombre de usuario"
						required
						className="w-full rounded-md border-gray-300 shadow-sm"
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="password" className="sr-only">
						Contraseña
					</Label>
					<Input
						id="password"
						name="password"
						type="password"
						placeholder="Contraseña"
						required
						className="w-full rounded-md border-gray-300 shadow-sm"
					/>
				</div>
				{error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{error}</AlertDescription>
					</Alert>
				)}
				<Button className="w-full" type="submit" disabled={isLoading}>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Iniciando sesión...
						</>
					) : (
						"Iniciar sesión"
					)}
				</Button>
			</form>
			<p className="text-center text-sm text-muted-foreground">
				¿No tienes una cuenta?
				<br />
				<a href="#" className="font-medium text-primary hover:underline">
					Contacta a tu administrador
				</a>
			</p>
		</div>
	)
}