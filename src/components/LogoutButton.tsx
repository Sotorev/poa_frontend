"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LogoutButton() {
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState("")
	const router = useRouter()

	const handleLogout = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault()
		setIsLoading(true)
		setError("")

		try {
			const response = await fetch("http://localhost:4000/api/logout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include", // This is important for including cookies
			})

			if (!response.ok) {
				const data = await response.json()
				throw new Error(data.message || "Error al cerrar sesión")
			}

			// If logout is successful, redirect to login page
			router.push("/login")
		} catch (err) {
			setError(err instanceof Error ? err.message : "Error al cerrar sesión")
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<div className="w-full max-w-[400px] space-y-4">
			<form onSubmit={handleLogout} className="space-y-4">
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
							Cerrando sesión...
						</>
					) : (
						"Sign out"
					)}
				</Button>
			</form>
		</div>
	)
}