"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, ChevronDown, LogOut, User, Settings, FileText, Menu, Home, BookOpen, ClipboardList, CheckSquare, BarChart2 } from "lucide-react"
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
import { useCurrentUser } from "@/hooks/use-current-user"
import clsx from "clsx"
import AccountButton from "../usuarios/_components/account-button"

const navItems = [
	{
		title: "Inicio",
		href: "/inicio",
		icon: Home,
		description: "Página principal",
	},
	{
		title: "Facultades",
		href: "/facultades/gestion",
		icon: BookOpen,
		description: "Gestión de facultades",
	},
	{
		title: "Usuarios",
		href: "/usuarios/gestion",
		icon: BookOpen,
		description: "Gestión de facultades",
	},
	{
		title: "POA",
		href: "/poa",
		icon: ClipboardList,
		description: "Plan Operativo Anual",
		subItems: [
			{ title: "Gestión", href: "/poa/gestion", description: "Gestión del POA" },
			{ title: "Crear", href: "/poa/crear", description: "Crear nuevo POA" },
			{ title: "Aprobación", href: "/poa/aprobacion", description: "Aprobación del POA" },
		],
	},
	{
		title: "PEI",
		href: "/pei",
		icon: BarChart2,
		description: "Plan Estratégico Institucional",
		subItems: [
			{ title: "Crear", href: "/pei/crear", description: "Crear nuevo PEI" },
			{ title: "ODS Gestión", href: "/pei/ods/gestion", description: "Gestión de ODS" },
		],
	},
]

export default function Header() {
	const user = useCurrentUser();
	const pathname = usePathname();

	return (
		<header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container flex h-16 items-center">
				<div className="mr-4 hidden md:flex">
					<Link href="/inicio" className="mr-6 flex items-center space-x-2">
						<Image src={Logo} alt="UMES Logo" className="h-10 w-auto" />
						<span className="hidden font-bold sm:inline-block">UMES Gestión POA</span>
					</Link>
					<NavigationMenu>
						<NavigationMenuList>
							{navItems.map((item) => (
								<NavigationMenuItem key={item.title}>
									{item.subItems ? (
										<>
											<NavigationMenuTrigger className="bg-transparent">{item.title}</NavigationMenuTrigger>
											<NavigationMenuContent>
												<ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
													{item.subItems.map((subItem) => (
														<ListItem key={subItem.title} title={subItem.title} href={subItem.href}>
															{subItem.description}
														</ListItem>
													))}
												</ul>
											</NavigationMenuContent>
										</>
									) : (
										<Link href={item.href} legacyBehavior passHref>
											<NavigationMenuLink className={clsx(navigationMenuTriggerStyle(), "bg-transparent", pathname === item.href && "text-primary")}>
												{item.title}
											</NavigationMenuLink>
										</Link>
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
						<MobileNav />
					</SheetContent>
				</Sheet>
				<div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
					<div className="w-full flex-1 md:w-auto md:flex-none">
						{/* Add search functionality here if needed */}
					</div>
					<nav className="flex items-center space-x-2">
						{/* <Button variant="ghost" size="icon" className="relative">
							<Bell className="h-5 w-5" />
							<span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-600" />
							<span className="sr-only">Notifications</span>
						</Button> */}
						<AccountButton username={user?.username} />
					</nav>
				</div>
			</div>
		</header>
	)
}

function MobileNav() {
	const pathname = usePathname();

	return (
		<div className="flex flex-col space-y-3">
			<Link href="/inicio" className="flex items-center space-x-2">
				<Image src={Logo} alt="UMES Logo" className="h-8 w-auto" />
				<span className="font-bold">UMES POA System</span>
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
								{item.subItems.map((subItem) => (
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