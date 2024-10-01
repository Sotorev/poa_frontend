"use client"

import { logout } from "@/lib/actions"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
	return (
		<form action={logout}>
			<Button type="submit" variant="outline" className="w-full">
				Sign out
			</Button>
		</form>
	)
}