"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/assets/images/logo.png'

export default function Header() {
	const { user, logout, loading } = useAuth()
	const [dropdownOpen, setDropdownOpen] = useState(false)

	if (loading || !user) {
		return null
	}

	return (
		<header className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<Image src={Logo} alt="POA Logo" className="h-auto w-20 mr-2" priority={true} />
						</Link>
					</div>
					<nav className="hidden md:flex space-x-8 font-semibold">
						<Link href="/dashboard" className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out">Dashboard</Link>
						<Link href="/usuarios/gestion" className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out">Usuarios</Link>
						<Link href="/pei" className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out">PEI</Link>
						<Link href="/poa" className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out">POA</Link>
						<Link href="/reportes" className="text-[#007041] hover:text-[#2e8f66] transition duration-150 ease-in-out">Reportes</Link>
					</nav>
					<div className="flex items-center space-x-4">
						<button className="text-gray-700 hover:text-[#007041] transition duration-150 ease-in-out relative">
							<Bell className="h-6 w-6" />
							<span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">3</span>
						</button>
						<div className="relative">
							<button
								className="flex items-center space-x-2 text-gray-700 hover:text-[#007041] transition duration-150 ease-in-out"
								onClick={() => setDropdownOpen(!dropdownOpen)}
							>
								<div className="w-8 h-8 rounded-full bg-[#007041] text-white flex items-center justify-center">
									<span className="text-sm font-semibold">{user.username.charAt(0).toUpperCase()}</span>
								</div>
								<span className="font-semibold">{user.username}</span>
								<ChevronDown className="h-4 w-4" />
							</button>
							{dropdownOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
									<button
										onClick={() => {
											logout();
											setDropdownOpen(false);
										}}
										className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full transition duration-150 ease-in-out"
									>
										<LogOut className="h-4 w-4 mr-2" />
										Cerrar sesión
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			{/* Separator line */}
			<div className="h-1 bg-gradient-to-r from-[#007041] to-[#2e8f66]"></div>
		</header>
	)
}