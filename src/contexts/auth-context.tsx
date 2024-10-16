'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { UserPayload } from '@/lib/server-auth'
import { login as authLogin, logout as authLogout, getSession } from '@/lib/auth'

interface AuthContextType {
	user: UserPayload | null
	loading: boolean
	login: (username: string, password: string) => Promise<void>
	logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserPayload | null>(null)
	const [loading, setLoading] = useState(true)
	const router = useRouter()

	const loadUserFromSession = useCallback(async () => {
		try {
			const userData = await getSession()
			console.log('Session data loaded:', userData)
			setUser(userData)
		} catch (error) {
			console.error('Failed to load user session:', error)
			router.push('/iniciar-sesion')
		} finally {
			setLoading(false)
		}
	}, [router])

	useEffect(() => {
		loadUserFromSession()
	}, [loadUserFromSession])

	const login = async (username: string, password: string) => {
		setLoading(true)
		try {
			const userData = await authLogin(username, password)
			console.log('User logged in:', userData)
			setUser(userData)
			router.push('/')
		} catch (error) {
			console.error('Login error:', error)
			router.push('/iniciar-sesion') // Redirect to login page if login fails
			throw error
		} finally {
			setLoading(false)
		}
	}

	const logout = async () => {
		setLoading(true)
		try {
			await authLogout()
			setUser(null)
			console.log('User logged out')
			router.push('/iniciar-sesion')
		} catch (error) {
			console.error('Logout error:', error)
		} finally {
			setLoading(false)
		}
	}

	return (
		<AuthContext.Provider value={{ user, loading, login, logout }}>
			{children}
		</AuthContext.Provider>
	)
}

export function useAuth() {
	const context = useContext(AuthContext)
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider')
	}
	return context
}