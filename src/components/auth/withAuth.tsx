'use client'

import { useAuth } from '@/contexts/AuthContext'
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
		const [isAuthorized, setIsAuthorized] = useState(false)

		useEffect(() => {
			async function checkAuthorization() {
				console.log('Checking authorization. User:', user, 'Loading:', loading)

				if (!loading && !user) {
					console.log('No user found, redirecting to login')
					router.push('/login')
					return
				}

				if (user) {
					console.log('User found, checking permissions and roles')
					let authorized = true

					for (const { module, action } of requiredPermissions) {
						const hasPermissionResult = await hasPermission(user, module, action)
						console.log(`Checking permission: ${module}:${action}. Result:`, hasPermissionResult)
						if (!hasPermissionResult) {
							authorized = false
							break
						}
					}

					if (authorized) {
						if (requiredRoles.length > 0) {
							for (const role of requiredRoles) {
								const hasRoleResult = await hasRole(user, role)
								console.log(`Checking role: ${role}. Result:`, hasRoleResult)
								if (hasRoleResult) {
									break // If any required role is found, authorize and stop checking
								}
							}
						}
					}

					if (!authorized) {
						console.log('Authorization failed, redirecting to unauthorized')
						router.push('/no-autorizado')
					} else {
						console.log('Authorization successful')
						setIsAuthorized(true)
					}
				}
			}

			checkAuthorization()
		}, [user, loading, router])

		if (loading) {
			return <div>Loading...</div>
		}

		if (!isAuthorized) {
			return null
		}

		return <WrappedComponent {...props} user={user} />
	}
}