'use client'

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { usePermissions } from "@/hooks/use-permissions"

interface ProtectedRouteProps {
	children: React.ReactNode
	moduleName: string
	action: 'Create' | 'Edit' | 'View' | 'Delete'
}

export function ProtectedRoute({ children, moduleName, action }: ProtectedRouteProps) {
	const { data: session, status } = useSession()
	const router = useRouter()
	const permissions = usePermissions()

	useEffect(() => {
		if (status === 'unauthenticated') return
		if (!session) {
			router.push('/iniciar-sesion')
		} else {
			const hasPermission = permissions[`can${action}`](moduleName)
			if (!hasPermission) {
				router.push('/no-autorizado')
			}
		}
	}, [session, status, router, permissions, moduleName, action])

	if (status === 'loading') {
		return <div>Loading...</div>
	}

	if (!session) {
		return null
	}

	return <>{children}</>
}