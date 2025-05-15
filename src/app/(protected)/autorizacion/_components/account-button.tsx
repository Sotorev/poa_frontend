"use client"

import { Button } from "@/components/ui/button"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, LogOut, User, Settings } from "lucide-react"
import { signOut } from "next-auth/react"
import Link from "next/link"
export default function AccountButton({ username }: { username?: string }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-10 gap-2 pl-2 pr-2">
					<div className="flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
							<span className="text-sm font-semibold">{username?.charAt(0).toUpperCase()}</span>
						</div>
						<span className="text-sm font-medium">{username}</span>
					</div>
					<ChevronDown className="h-4 w-4 opacity-50" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end">
				{/* <DropdownMenuItem>
					<User className="mr-2 h-4 w-4" />
					<span>Perfil</span>
				</DropdownMenuItem>
				<DropdownMenuItem>
					<Settings className="mr-2 h-4 w-4" />
					<span>Configuración</span>
				</DropdownMenuItem> */}
				<DropdownMenuSeparator />
				<DropdownMenuItem
					className="cursor-pointer"
					onSelect={(event) => {
						event.preventDefault()
						signOut()
					}}
				>
					<LogOut className="mr-2 h-4 w-4" />
					<span>Cerrar sesión</span>
				</DropdownMenuItem>
				<Link href="/manuales-de-usuario" passHref>
					<DropdownMenuItem asChild>
						Manuales de usuario
					</DropdownMenuItem>
				</Link>
			</DropdownMenuContent>
		</DropdownMenu>
	)
}