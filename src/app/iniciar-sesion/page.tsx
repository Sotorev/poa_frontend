'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/auth-context'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '@/assets/images/logo.png'

export default function LoginPage() {
	const [username, setUsername] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState('')
	const { user, loading, login } = useAuth()

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setError('')

		try {
			await login(username, password)
		} catch (error) {
			if (error instanceof Error) {
				setError(error.message || 'Nombre de usuario o contraseña inválidos')
			} else {
				setError('Ocurrió un error durante el inicio de sesión')
			}
		}
	}

	if (loading) {
		return <div className="min-h-screen flex items-center justify-center">Cargando...</div>
	}

	if (user) {
		return null
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
			<div className="max-w-md w-full space-y-8">
				<div className="flex flex-col items-center">
					<Image src={Logo} alt="Universidad Mesoamericana Logo" width={150} height={150} />
					<h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
						Iniciar sesión
					</h2>
					<p className="mt-2 text-center text-sm text-gray-600">
						Sistema de Gestión POA
					</p>
				</div>
				<form className="mt-8 space-y-6" onSubmit={handleSubmit}>
					<input type="hidden" name="remember" defaultValue="true" />
					<div className="rounded-md shadow-sm -space-y-px">
						<div>
							<label htmlFor="username" className="sr-only">
								Nombre de usuario
							</label>
							<input
								id="username"
								name="username"
								type="text"
								autoComplete="username"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-[#007041] focus:border-[#007041] focus:z-10 sm:text-sm"
								placeholder="Nombre de usuario"
								value={username}
								onChange={(e) => setUsername(e.target.value)}
							/>
						</div>
						<div>
							<label htmlFor="password" className="sr-only">
								Contraseña
							</label>
							<input
								id="password"
								name="password"
								type="password"
								autoComplete="current-password"
								required
								className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-[#007041] focus:border-[#007041] focus:z-10 sm:text-sm"
								placeholder="Contraseña"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
							/>
						</div>
					</div>

					<div className="flex items-center justify-between">
						<div className="flex items-center">
							<input
								id="remember-me"
								name="remember-me"
								type="checkbox"
								className="h-4 w-4 text-[#007041] focus:ring-[#007041] border-gray-300 rounded"
							/>
							<label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
								Recordarme
							</label>
						</div>

						<div className="text-sm">
							<Link href="/forgot-password" className="font-medium text-[#007041] hover:text-[#2e8f66]">
								¿Olvidó su contraseña?
							</Link>
						</div>
					</div>

					<div>
						<button
							type="submit"
							className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#007041] hover:bg-[#2e8f66] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#007041]"
						>
							Iniciar sesión
						</button>
					</div>
				</form>
				{error && (
					<p className="mt-2 text-center text-sm text-red-600" role="alert">
						{error}
					</p>
				)}
			</div>
		</div>
	)
}