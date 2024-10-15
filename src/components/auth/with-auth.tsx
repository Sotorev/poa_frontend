'use client'

import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { ComponentType, useEffect, useState } from 'react'
import { hasPermission, hasRole } from '@/lib/auth'

interface AuthProps {
	requiredPermissions?: { module: string; action: string }[]
	requiredRoles?: string[]
}

export function withAuth<P extends object>(
	WrappedComponent: ComponentType<P>,
	{ requiredPermissions = [], requiredRoles = [] }: AuthProps
) {
	return function WithAuth(props: P) {
		const { user, loading } = useAuth()
		const router = useRouter()
		const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)

		useEffect(() => {
			let isMounted = true

			async function checkAuthorization() {
				if (!user) {
					if (isMounted) setIsAuthorized(false)
					router.push('/iniciar-sesion')
					return
				}

				let authorized = true

				for (const { module, action } of requiredPermissions) {
					const hasPermissionResult = await hasPermission(user, module, action)
					if (!hasPermissionResult) {
						authorized = false
						break
					}
				}

				if (authorized && requiredRoles.length > 0) {
					authorized = await Promise.any(requiredRoles.map(role => hasRole(user, role)))
				}

				if (isMounted) {
					setIsAuthorized(authorized)
					if (!authorized) {
						router.push('/no-autorizado')
					}
				}
			}

			if (!loading) {
				checkAuthorization()
			}

			return () => {
				isMounted = false
			}
		}, [user, loading, router, requiredPermissions, requiredRoles])

		if (loading || isAuthorized === null) {
			return <div>Loading...</div>
		}

		if (!isAuthorized) {
			return null
		}

		return <WrappedComponent {...props} user={user} />
	}
}