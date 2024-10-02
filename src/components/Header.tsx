"use client";
import React from 'react'
import Link from 'next/link'
import { Bell, User, ChevronDown, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import Image from 'next/image'
import Logo from '@/assets/images/logo.png'
import { useState } from 'react'

export default function Header() {
	const { user, logout, loading } = useAuth()
	const [dropdownOpen, setDropdownOpen] = useState(false)

	if (loading || !user) {
		return null; // Don't render anything if loading or no user
	}

	return (
		<header className="bg-white shadow-md">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center py-4">
					<div className="flex items-center">
						<Link href="/" className="flex items-center">
							<Image src={Logo} alt="POA Logo" className="h-auto w-20 mr-2" />
						</Link>
					</div>
					<nav className="hidden md:flex space-x-8 font-bold">
						<Link href="/" className="text-[#007041] hover:text-[#2e8f66]">Usuarios</Link>
						<Link href="/pei" className="text-[#007041] hover:text-[#2e8f66]">PEI</Link>
						<Link href="/" className="text-[#007041] hover:text-[#2e8f66]">POA</Link>
						<Link href="/dashboard" className="text-[#007041] hover:text-[#2e8f66]">Estadísticas</Link>
						<Link href="/" className="text-[#007041] hover:text-[#2e8f66]">Reportes</Link>
					</nav>
					<div className="flex items-center space-x-4">
						<button className="text-gray-700 hover:text-[#007041]">
							<Bell className="h-6 w-6" />
						</button>
						<div className="relative">
							<button
								className="flex items-center space-x-2 text-gray-700 hover:text-[#007041]"
								onClick={() => setDropdownOpen(!dropdownOpen)}
							>
								<User className="h-6 w-6" />
								<span>{user.username}</span>
								<ChevronDown className="h-4 w-4" />
							</button>
							{dropdownOpen && (
								<div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
									<button
										onClick={() => {
											logout();
											setDropdownOpen(false);
										}}
										className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
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
		</header>
	)
}