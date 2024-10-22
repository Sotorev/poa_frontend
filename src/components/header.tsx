"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Bell, ChevronDown, LogOut, User, Settings, FileText } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import Logo from '@/assets/images/logo.png'
import QuetzalIcon from '@/assets/images/quetzal-icon.png' // Assuming you've added the quetzal icon to your assets
import { hasPermission } from '@/lib/auth'

export default function Header() {
	const { user, logout, loading } = useAuth()
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [canAccessUsers, setCanAccessUsers] = useState(false)
	const [canAccessPEI, setCanAccessPEI] = useState(false)
	const [canAccessPOA, setCanAccessPOA] = useState(false)
	const [canAccessReports, setCanAccessReports] = useState(false)
	const pathname = usePathname()

	useEffect(() => {
		if (user) {
			hasPermission(user, 'Auth', 'View').then(setCanAccessUsers)
			hasPermission(user, 'PEI', 'View').then(setCanAccessPEI)
			hasPermission(user, 'POA', 'View').then(setCanAccessPOA)
			hasPermission(user, 'Reports', 'View').then(setCanAccessReports)
		}
	}, [user])

	if (!user || loading) {
		return null
	}

	const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
		const isActive = pathname === href
		return (
			<Link
				href={href}
				className={`relative text-[#007041] hover:text-white hover:bg-[#007041] transition duration-150 ease-in-out px-4 py-2 rounded-md text-sm font-medium ${
					isActive ? 'bg-[#007041] text-white' : ''
				}`}
			>
				{children}
				{isActive && (
					<Image
						src={QuetzalIcon}
						alt="Active"
						className="absolute -top-2 -right-2 w-6 h-6"
						width={24}
						height={24}
					/>
				)}
			</Link>
		)
	}

	return (
		<header className="bg-white shadow-md" role="banner">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<Image src={Logo} alt="Logo" className="h-auto w-28 mr-3" priority={true} />
						</Link>
					</div>
					<nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
						<NavLink href="/">Dashboard</NavLink>
						{canAccessUsers && <NavLink href="/usuarios/gestion">Usuarios</NavLink>}
						{canAccessPEI && <NavLink href="/pei">PEI</NavLink>}
						{canAccessPOA && <NavLink href="/poa">POA</NavLink>}
						<NavLink href="/poa/eventosForms">Crear Evento Formulario</NavLink>
						<NavLink href="/poa/eventosTable">Crear Evento Tabla</NavLink>
						<NavLink href="/poa/AprovacionPOA">Aprobar POA</NavLink>
						{canAccessReports && <NavLink href="/reportes">Reportes</NavLink>}
					</nav>
					<div className="flex items-center space-x-4">
						<button
							className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out relative p-2 rounded-full hover:bg-green-50"
							aria-label="Notificaciones"
						>
							<Bell className="h-6 w-6" />
							<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span>
						</button>
						<div className="relative">
							<button
								className="flex items-center space-x-3 text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out bg-green-50 rounded-full px-4 py-2"
								onClick={() => setDropdownOpen(!dropdownOpen)}
								aria-expanded={dropdownOpen}
								aria-haspopup="true"
							>
								<div className="w-8 h-8 rounded-full bg-[#007041] text-white flex items-center justify-center">
									<span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
								</div>
								<span className="font-medium">{user.username}</span>
								<ChevronDown className="h-4 w-4" />
							</button>
							{dropdownOpen && (
								<div
									className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-10"
									role="menu"
									aria-orientation="vertical"
									aria-labelledby="user-menu"
								>
									<Link
										href="/perfil"
										className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 w-full transition duration-150 ease-in-out"
										role="menuitem"
									>
										<User className="h-5 w-5 mr-3 text-[#007041]" />
										Perfil
									</Link>
									{user.role.roleName == "Administrador" && (
										<Link
											href="/configuracion"
											className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 w-full transition duration-150 ease-in-out"
											role="menuitem"
										>
											<Settings className="h-5 w-5 mr-3 text-[#007041]" />
											Configuración
										</Link>
									)}
									<Link
										href="/mis-actividades"
										className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 w-full transition duration-150 ease-in-out"
										role="menuitem"
									>
										<FileText className="h-5 w-5 mr-3 text-[#007041]" />
										Mis Actividades
									</Link>
									<button
										onClick={() => {
											logout();
											setDropdownOpen(false);
										}}
										className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 w-full transition duration-150 ease-in-out"
										role="menuitem"
									>
										<LogOut className="h-5 w-5 mr-3 text-[#007041]" />
										Cerrar sesión
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<div className="h-1 bg-gradient-to-r from-[#007041] via-[#2e8f66] to-[#007041]"></div>
		</header>
	)
}