"use client"

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { Bell, ChevronDown, LogOut, User, Settings, FileText } from 'lucide-react'
import { useSession, signOut } from "next-auth/react"
import Logo from '@/assets/images/logo.png'
import QuetzalIcon from '@/assets/images/quetzal-icon.png'

export default function Header() {
	const [dropdownOpen, setDropdownOpen] = useState(false)
	const [canAccessUsers, setCanAccessUsers] = useState(false)
	const [canAccessPEI, setCanAccessPEI] = useState(false)
	const [canAccessPOA, setCanAccessPOA] = useState(false)
	const [canAccessReports, setCanAccessReports] = useState(false)
	const { data: session, status } = useSession()
	const pathname = usePathname()
	useEffect(() => {
		console.log({ session, status })

		if (status === 'authenticated' && session?.user) {
			const role = session.user.role?.roleName
			setCanAccessUsers(role === "Administrador")
			setCanAccessPEI(["Administrador", "Vice Rector"].includes(role))
			setCanAccessPOA(["Administrador", "Vice Rector", "Dean"].includes(role))
			setCanAccessReports(["Administrador", "Vice Rector", "Pedagogical Coordinator"].includes(role))
		}
	}, [session, status])

	const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
		const isActive = pathname === href
		return (
			<Link
				href={href}
				className={`relative text-[#007041] hover:text-white hover:bg-[#007041] transition duration-150 ease-in-out px-4 py-2 rounded-md text-sm font-medium ${isActive ? 'bg-[#007041] text-white' : ''
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

	if (status === 'loading') {
		return <div className="h-16 bg-white shadow-md flex items-center justify-center">Cargando...</div>
	}

	return (
		<header className="bg-white shadow-md" role="banner">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Link href="/inicio" className="flex items-center">
							<Image src={Logo} alt="Logo" className="h-auto w-28 mr-3" width={112} height={40} priority={true} />
						</Link>
					</div>
					{status === 'authenticated' && (
						<nav className="hidden md:flex space-x-1" aria-label="Main Navigation">
							<NavLink href="/inicio">Dashboard</NavLink>
							{canAccessUsers && <NavLink href="/usuarios/gestion">Usuarios</NavLink>}
							{canAccessPEI && <NavLink href="/pei">PEI</NavLink>}
							{canAccessPOA && <NavLink href="/poa">POA</NavLink>}
							<NavLink href="/poa/eventos">Crear Evento</NavLink>
							{canAccessReports && <NavLink href="/reportes">Reportes</NavLink>}
						</nav>
					)}
					<div className="flex items-center space-x-4">
						{status === 'authenticated' && session?.user && (
							<>
								<button
									className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out relative p-2 rounded-full hover:bg-green-50"
									aria-label="Notificaciones"
								>
									<Bell className="h-6 w-6" />
									<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
										3
									</span>
								</button>
								<div className="relative">
									<button
										className="flex items-center space-x-3 text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out bg-green-50 rounded-full px-4 py-2"
										onClick={() => setDropdownOpen(!dropdownOpen)}
										aria-expanded={dropdownOpen}
										aria-haspopup="true"
									>
										<div className="w-8 h-8 rounded-full bg-[#007041] text-white flex items-center justify-center">
											<span className="text-sm font-semibold">{session.user.username.charAt(0).toUpperCase()}</span>
										</div>
										<span className="font-medium">{session.user.username}</span>
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
												onClick={() => setDropdownOpen(false)}
											>
												<User className="h-5 w-5 mr-3 text-[#007041]" />
												Perfil
											</Link>
											{session.user.role?.roleName === "Administrador" && (
												<Link
													href="/configuracion"
													className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 w-full transition duration-150 ease-in-out"
													role="menuitem"
													onClick={() => setDropdownOpen(false)}
												>
													<Settings className="h-5 w-5 mr-3 text-[#007041]" />
													Configuración
												</Link>
											)}
											<Link
												href="/mis-actividades"
												className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-green-50 w-full transition duration-150 ease-in-out"
												role="menuitem"
												onClick={() => setDropdownOpen(false)}
											>
												<FileText className="h-5 w-5 mr-3 text-[#007041]" />
												Mis Actividades
											</Link>
											<button
												onClick={() => {
													setDropdownOpen(false);
													signOut();
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
							</>
						)}
					</div>
				</div>
			</div>
			<div className="h-1 bg-gradient-to-r from-[#007041] via-[#2e8f66] to-[#007041]"></div>
		</header>
	)
}