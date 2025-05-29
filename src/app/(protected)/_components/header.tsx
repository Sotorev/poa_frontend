"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Settings, FileText, Menu, Home, BookOpen, ClipboardList, CheckSquare, BarChart2 } from "lucide-react"

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
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

import Logo from "@/assets/images/logo.png"
import Image from "next/image"
import { useCurrentUser } from "@/hooks/use-current-user"
import { usePermissions } from "@/hooks/use-permissions"
import clsx from "clsx"
import AccountButton from "../autorizacion/_components/account-button"
import { Role } from "@/types/Permission"
import { NotificationButton } from "@/components/notifications/NotificationButton"
import { PoaContext } from "@/contexts/PoaContext"
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from "@/components/ui/select"

type Action = 'Create' | 'Edit' | 'View' | 'Delete'


type NavItem = {
	title: string
	href: string
	icon: React.ElementType
	description: string
	requiredPermission?: { module: string; action: Action }
	requiredRoles?: Role[]
	subItems?: NavItem[]
}

const navItems: NavItem[] = [
	{
		title: "Inicio",
		href: "/inicio",
		icon: Home,
		description: "Página principal",
		requiredPermission: { module: "Dashboard", action: "View" }
	},
	{
		title: "Facultades",
		href: "/facultades/gestion",
		icon: BookOpen,
		description: "Gestión de facultades",
		requiredRoles: ['Vicerrector', 'Administrador']
	},
	{
		title: "Autorización",
		href: "/autorizacion",
		icon: User,
		description: "Gestión de usuarios",
		requiredPermission: { module: "Auth", action: "Edit" },
		requiredRoles: ['Administrador'],
		subItems: [
			{ title: "Usuarios", href: "/autorizacion/usuarios", description: "Gestión de usuarios", requiredPermission: { module: "Auth", action: "View" }, icon: User },
			{ title: "Roles", href: "/autorizacion/roles", description: "Gestión de roles", requiredPermission: { module: "Auth", action: "View" }, icon: Settings },
		],
	},
	{
		title: "POA",
		href: "/poa",
		icon: ClipboardList,
		description: "Plan Operativo Anual",
		// requiredRoles: ['Vicerrector', 'Decano', 'Administrador'],
		subItems: [
			{ title: "Gestión", href: "/poa/gestion", description: "Gestión del POA", requiredRoles: ['Vicerrector', 'Decano', "Administrador", "Coordinador Pedagógico", "Directora", "Directora académica"], icon: Settings },
			{ title: "Crear evento", href: "/poa/crear", description: "Crear, editar o eliminar evento de POA", requiredRoles: ['Decano', "Formulador", "Administrador", "Coordinador Pedagógico", "Directora", "Directora académica"], icon: FileText },
			{ title: "Aprobación", href: "/poa/aprobacion", description: "Aprobación del POA", requiredRoles: ['Vicerrector', "Administrador", "Vicerrector académico", "Vicerrector administrativo", "Rector", "Tesorería"], icon: CheckSquare },
		],
	},
	{
		title: "PEI",
		href: "/pei",
		icon: BarChart2,
		description: "Plan Estratégico Institucional",
		requiredRoles: ['Vicerrector', "Administrador", "Vicerrector académico", "Vicerrector administrativo", "Rector"],
		subItems: [
			{ title: "Gestión", href: "/pei/crear", description: "Gestionar plan estratégico institucional", requiredRoles: ['Vicerrector', "Administrador", "Vicerrector académico", "Vicerrector administrativo", "Rector"], icon: FileText },
			{ title: "ODS Gestión", href: "/pei/ods/gestion", description: "Gestión de ODS", requiredRoles: ["Administrador"], icon: Settings },
		],
	},
	{
		title: "Reportes",
		href: "/reportes",
		icon: BarChart2,
		description: "Reportes",
		requiredRoles: ['Vicerrector', "Administrador", "Vicerrector académico", "Vicerrector administrativo"],
	},
	{
		title: "Ejecución",
		href: "poa/ejecucion",
		icon: CheckSquare,
		description: "Ejecución del POA",
		requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'],
		subItems: [
			{ title: "Ejecutar", href: "/poa/ejecucion", description: "Eventos ejecutados", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
			{ title: "Finalizar", href: "/poa/finalizar", description: "Finalizar el POA", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
		],
	},
	{
		title: "Propuestas",
		href: "/propuestas",
		icon: FileText,
		description: "Propuestas",
		requiredRoles: ['Coordinador Pedagógico', "Administrador"],
		subItems: [
			{ title: "Area y Objetivo Estratégico", href: "/propuestas/area-objetivo-estrategico", description: "Propuestas de área y objetivo estratégico", requiredRoles: ['Coordinador Pedagógico', "Administrador"], icon: FileText },
			{ title: "Estrategias", href: "/propuestas/estrategias", description: "Propuestas de estrategias", requiredRoles: ['Coordinador Pedagógico', "Administrador"], icon: FileText },
			{ title: "Intervenciones", href: "/propuestas/intervenciones", description: "Propuestas de intervenciones", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
			// { title: "Campus", href: "/propuestas/campus", description: "Propuestas de campus", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
			// { title: "Fuente de financiamiento", href: "/propuestas/fuentes-de-financiamiento", description: "Propuestas de fuentes de financiamiento", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
			{ title: "Tipos de compra", href: "/propuestas/tipos-de-compra", description: "Propuestas de tipos de compra", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
			{ title: "Recursos", href: "/propuestas/recursos", description: "Propuestas de recursos", requiredRoles: ['Decano', 'Administrador', 'Directora', 'Directora académica', 'Coordinador Pedagógico', 'Formulador'], icon: FileText },
		],
	},
]

export default function Header() {
	const user = useCurrentUser()
	const pathname = usePathname()
	const permissions = usePermissions()
	const { selectedYear, setSelectedYear, poas } = React.useContext(PoaContext)

	// obtener los años en los que han existido POAs
	const years: number[] = poas.map(poa => {
		return Number(poa.year)
	})

	const checkAccess = (item: NavItem): boolean => {
		if (item.requiredPermission) {
			const permissionKey = `can${item.requiredPermission.action}` as keyof typeof permissions;
			return permissions[permissionKey](item.requiredPermission.module as any);
		}
		if (item.requiredRoles && item.requiredRoles.length > 0) {
			return permissions.hasRole(item.requiredRoles)
		}
		return true
	}

	const filteredNavItems = navItems.filter(checkAccess)

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				<div className="mr-4 hidden md:flex">
					<Link href="/inicio" className="mr-6 flex items-center space-x-2">
						<Image src={Logo} alt="UMES Logo" className="h-16 w-auto" />
						{/* <span className="hidden font-bold sm:inline-block">UMES Gestión POA</span> */}
					</Link>
					<NavigationMenu>
						<NavigationMenuList>
							{filteredNavItems.map((item) => (
								<NavigationMenuItem key={item.title}>
									{item.subItems ? (
										<>
											<NavigationMenuTrigger className="bg-transparent">{item.title}</NavigationMenuTrigger>
											<NavigationMenuContent>
												<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
													{item.subItems.filter(checkAccess).map((subItem) => (
														<ListItem key={subItem.title} title={subItem.title} href={subItem.href}>
															{subItem.description}
														</ListItem>
													))}
												</ul>
											</NavigationMenuContent>
										</>
									) : (
										<NavigationMenuLink href={item.href} className={clsx(navigationMenuTriggerStyle(), "bg-transparent", pathname === item.href && "text-primary")}>
											{item.title}
										</NavigationMenuLink>
									)}
								</NavigationMenuItem>
							))}
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
						<MobileNav navItems={filteredNavItems} permissions={permissions} />
					</SheetContent>
				</Sheet>
				<div className="flex flex-1 items-center justify-end gap-4 md:gap-6">
					<Select
						value={selectedYear.toString()}
						onValueChange={(value) => setSelectedYear(parseInt(value))}
					>
						<SelectTrigger className="w-32 bg-primary/5 hover:bg-primary/10 transition-colors">
							<SelectValue placeholder={`POA ${selectedYear + 1}`}>
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="items-center">
							{years.map((year, index) => (
								<SelectItem
									key={year}
									value={year.toString()}
									className={`hover:bg-primary/5 ${index === 0 ? 'opacity-50' : ''}`}
									disabled={index === 0}
								>
									POA {year + 1} {index === 0}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="flex items-center gap-4">
						<NotificationButton />
						<AccountButton username={user?.username} />
					</div>
				</div>
			</div>
		</header>
	)
}

// ... (MobileNav and ListItem components remain the same)

type MobileNavProps = {
	navItems: NavItem[];
	permissions: ReturnType<typeof usePermissions>;
};

function MobileNav({ navItems, permissions }: MobileNavProps) {
	const pathname = usePathname();

	return (
		<div className="flex flex-col space-y-3">
			<Link href="/inicio" className="flex items-center space-x-2">
				<Image src={Logo} alt="UMES Logo" className="h-8 w-auto" />
				<span className="font-bold">UMES Gestión POA</span>
			</Link>
			<div className="space-y-1">
				{navItems.map((item) => (
					<React.Fragment key={item.title}>
						<Button variant="ghost" className={clsx("w-full justify-start", pathname === item.href && "bg-muted")} asChild>
							<Link href={item.href}>
								<item.icon className="mr-2 h-4 w-4" />
								{item.title}
							</Link>
						</Button>
						{item.subItems && (
							<div className="ml-4 space-y-1">
								{item.subItems.filter(subItem => {
									if (subItem.requiredPermission) {
										const permissionKey = `can${subItem.requiredPermission.action}` as keyof typeof permissions;
										return permissions[permissionKey](subItem.requiredPermission.module as any);
									}
									if (subItem.requiredRoles && subItem.requiredRoles.length > 0) {
										return permissions.hasRole(subItem.requiredRoles);
									}
									return true;
								}).map((subItem) => (
									<Button key={subItem.title} variant="ghost" className={clsx("w-full justify-start", pathname === subItem.href && "bg-muted")} asChild>
										<Link href={subItem.href}>{subItem.title}</Link>
									</Button>
								))}
							</div>
						)}
					</React.Fragment>
				))}
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