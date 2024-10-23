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
		if (status === 'loading') return // Do nothing while loading
		if (!session) {
			router.push('/login') // Redirect to login if not authenticated
		} else {
			const hasPermission = permissions[`can${action}`](moduleName)
			if (!hasPermission) {
				router.push('/unauthorized') // Redirect to unauthorized page if no permission
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