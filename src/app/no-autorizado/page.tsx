'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/auth-context'
import { AlertTriangle } from 'lucide-react'

export default function Unauthorized() {
	const router = useRouter()
	const { user, loading } = useAuth()

	useEffect(() => {
		if (!loading && user) {
			router.push('/')
		}
	}, [user, loading, router])

	if (loading) {
		return null // or a loading spinner
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="text-center">
					<AlertTriangle className="mx-auto h-12 w-12 text-yellow-400" />
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						401 - No autorizado
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						No tienes permiso para acceder a esta página.
					</p>
				</div>
				<div className="mt-8 space-y-6">
					<div className="text-center">
						<Link
							href="/iniciar-sesion"
							className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#007041] hover:bg-[#2e8f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007041]"
						>
							Volver al inicio de sesión
						</Link>
					</div>
					<div className="text-center">
						<Link
							href="/"
							className="font-medium text-[#007041] hover:text-[#2e8f66]"
						>
							Ir a la página principal
						</Link>
					</div>
				</div>
			</div>
		</div>
	)
}