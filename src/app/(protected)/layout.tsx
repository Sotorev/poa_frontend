"use client";
import Header from '@/app/(protected)/_components/header'
import exp from 'constants'
import { useSession } from 'next-auth/react'
import React from 'react'

interface ProtectedLayoutProps {
	children: React.ReactNode
}

const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
	const { data: session } = useSession()

	if (!session) {
		return <div>Cargando...</div>
	}
	return (
		<div className='h-full w-full flex flex-col flex-grow gap-y-10 bg-gray-100'>
			<Header />
			{children}
		</div>
	)
}

export default ProtectedLayout