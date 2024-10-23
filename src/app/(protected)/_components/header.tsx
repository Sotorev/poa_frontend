"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, LogOut, User, Settings, FileText, Menu } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
	NavigationMenu,
	NavigationMenuContent,
	NavigationMenuItem,
	NavigationMenuLink,
	NavigationMenuList,
	NavigationMenuTrigger,
	navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import Logo from "@/assets/images/logo.png"
import QuetzalIcon from "@/assets/icons/quetzal.svg"
import Image from "next/image"

const poaItems = [
	{ title: "Panel de Control", href: "/poa" },
	{ title: "Proyectos", href: "/poa/proyectos" },
	{ title: "Informes", href: "/poa/informes" },
	{ title: "Calendario", href: "/poa/calendario" },
]

const peiItems = [
	{ title: "Visión General", href: "/pei" },
	{ title: "Objetivos Estratégicos", href: "/pei/objetivos" },
	{ title: "Indicadores", href: "/pei/indicadores" },
	{ title: "Evaluación", href: "/pei/evaluacion" },
]

export default function Header() {
	const pathname = usePathname()
	const { data: session, status } = useSession()

	if (status === "loading") {
		return <div className="h-16 bg-white shadow-md flex items-center justify-center">Cargando...</div>
	}

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-14 items-center">
				<div className="mr-4 hidden md:flex">
					<Link href="/inicio" className="mr-6 flex items-center space-x-2">
						<Image src={Logo} alt="UMES Logo" className="h-8 w-auto" />
						<span className="hidden font-bold sm:inline-block">UMES Gestión POA</span>
					</Link>
					<NavigationMenu>
						<NavigationMenuList>
							<NavigationMenuItem>
								<NavigationMenuTrigger>POA</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
										<li className="row-span-3">
											<NavigationMenuLink asChild>
												<a
													className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
													href="/poa"
												>
													<div className="mb-2 mt-4 text-lg font-medium">POA</div>
													<p className="text-sm leading-tight text-muted-foreground">
														Plan Operativo Anual de la Universidad Mesoamericana
													</p>
												</a>
											</NavigationMenuLink>
										</li>
										{poaItems.map((item) => (
											<ListItem key={item.title} title={item.title} href={item.href}>
												{item.description}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<NavigationMenuTrigger>PEI</NavigationMenuTrigger>
								<NavigationMenuContent>
									<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
										{peiItems.map((item) => (
											<ListItem key={item.title} title={item.title} href={item.href}>
												{item.description}
											</ListItem>
										))}
									</ul>
								</NavigationMenuContent>
							</NavigationMenuItem>
							<NavigationMenuItem>
								<Link href="/reportes" legacyBehavior passHref>
									<NavigationMenuLink className={navigationMenuTriggerStyle()}>
										Reportes
									</NavigationMenuLink>
								</Link>
							</NavigationMenuItem>
						</NavigationMenuList>
					</NavigationMenu>
				</div>
				<Sheet>
					<SheetTrigger asChild>
						<Button variant="ghost" className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden">
							<Menu className="h-5 w-5" />
							<span className="sr-only">Toggle Menu</span>
						</Button>
					</SheetTrigger>
					<SheetContent side="left" className="pr-0">
						<MobileNav />
					</SheetContent>
				</Sheet>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">
						{/* Add search functionality here if needed */}
					</div>
					<nav className="flex items-center space-x-2">
						<Button variant="ghost" size="icon" className="relative">
							<Bell className="h-5 w-5" />
							<span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
							<span className="sr-only">Notifications</span>
						</Button>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button variant="ghost" className="relative h-8 w-8 rounded-full">
									{/* <Image
										src={session?.user?.image || "/placeholder-avatar.png"}
										alt={session?.user?.name || "User"}
										className="h-8 w-8 rounded-full"
									/> */}
									<User className="h-8 w-8 rounded-full" />
									<span className="text-sm font-semibold">{session.user.username.charAt(0).toUpperCase()}</span>

								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent className="w-56" align="end" forceMount>
								<DropdownMenuItem asChild>
									<Link href="/perfil">
										<User className="mr-2 h-4 w-4" />
										<span>Perfil</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/configuracion">
										<Settings className="mr-2 h-4 w-4" />
										<span>Configuración</span>
									</Link>
								</DropdownMenuItem>
								<DropdownMenuItem asChild>
									<Link href="/mis-actividades">
										<FileText className="mr-2 h-4 w-4" />
										<span>Mis Actividades</span>
									</Link>
								</DropdownMenuItem>
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
							</DropdownMenuContent>
						</DropdownMenu>
					</nav>
				</div>
			</div>
		</header>
	)
}

function MobileNav() {
	return (
		<div className="flex flex-col space-y-3">
			<Link href="/" className="flex items-center space-x-2">
				<Image src={Logo} alt="UMES Logo" className="h-8 w-auto" />
				<span className="font-bold">UMES POA System</span>
			</Link>
			<div className="space-y-1">
				<Button variant="ghost" className="w-full justify-start" asChild>
					<Link href="/poa">POA</Link>
				</Button>
				<Button variant="ghost" className="w-full justify-start" asChild>
					<Link href="/pei">PEI</Link>
				</Button>
				<Button variant="ghost" className="w-full justify-start" asChild>
					<Link href="/reportes">Reportes</Link>
				</Button>
			</div>
		</div>
	)
}

const ListItem = React.forwardRef<
	React.ElementRef<"a">,
	React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
	return (
		<li>
			<NavigationMenuLink asChild>
				<a
					ref={ref}
					className={cn(
						"block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
						className
					)}
					{...props}
				>
					<div className="text-sm font-medium leading-none">{title}</div>
					<p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
						{children}
					</p>
				</a>
			</NavigationMenuLink>
		</li>
	)
})
ListItem.displayName = "ListItem"