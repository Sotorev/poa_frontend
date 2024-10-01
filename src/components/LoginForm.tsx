"use client"

import { useFormState } from "react-dom"
import { login } from "@/lib/actions"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LoginForm() {
	const [state, formAction] = useFormState(login, { success: false, error: "" })

	return (
		<div className="w-full max-w-[400px] space-y-4">
			<div className="space-y-2 text-center">
				<h1 className="text-3xl font-bold tracking-tighter">Iniciar sesión en POA</h1>
				<p className="text-sm text-muted-foreground">Ingrese sus credenciales para acceder a su cuenta</p>
			</div>
			<form action={formAction} className="space-y-4">
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
				{state.error && (
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>{state.error}</AlertDescription>
					</Alert>
				)}
				<Button className="w-full" type="submit" disabled={state.success}>
					{!state ? (
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