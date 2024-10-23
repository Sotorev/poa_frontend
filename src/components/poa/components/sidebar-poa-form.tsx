import React from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Link } from "react-scroll"
import { Pin } from 'lucide-react'
import { cn } from "@/lib/utils"

export interface SidebarProps {
	sections: { name: string, icon: React.ComponentType<any> }[]
	activeSection: string | null
	onSetActive: (section: string) => void
	isSidebarFixed: boolean
	isSidebarVisible: boolean
	setIsSidebarFixed: React.Dispatch<React.SetStateAction<boolean>>
	sidebarRef: React.RefObject<HTMLDivElement>
}

export const Sidebar: React.FC<SidebarProps> = ({
	sections,
	activeSection,
	onSetActive,
	isSidebarFixed,
	isSidebarVisible,
	setIsSidebarFixed,
	sidebarRef
}) => {
	return (
		<TooltipProvider>
			<aside
				ref={sidebarRef}
				className={`fixed left-0 top-0 h-full bg-primary shadow-lg transition-all duration-300 ease-in-out z-50 flex flex-col justify-between ${isSidebarFixed || isSidebarVisible ? 'w-16 opacity-100' : 'w-0 opacity-0'
					}`}
			>
				<ScrollArea className="flex-grow">
					<nav className="p-2 flex flex-col items-center space-y-4">
						{sections.map((section) => (
							<Tooltip key={section.name}>
								<TooltipTrigger asChild>
									<div>
										<Link
											className='text-white hover:text-primary'
											to={section.name}
											spy={true}
											smooth={true}
											offset={-70}
											duration={500}
											onClick={() => onSetActive(section.name)}
										>
											<Button
												variant={activeSection === section.name ? "secondary" : "ghost"}
												size="icon"
												className={cn(
													"w-12 h-12 rounded-lg transition-colors duration-200",
													isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0',
													activeSection === section.name ? 'bg-primary text-white' : 'text-white'
												)}
											>
												{React.createElement(section.icon, { className: "h-6 w-6" })}
												<span className="sr-only">{section.name}</span>
											</Button>
										</Link>
									</div>
								</TooltipTrigger>
								<TooltipContent side="right" className="bg-primary text-white py-1 px-2 text-sm rounded">
									<p>{section.name}</p>
								</TooltipContent>
							</Tooltip>
						))}
					</nav>
				</ScrollArea>
				<div className="p-2 flex justify-center">
					<Tooltip>
						<TooltipTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setIsSidebarFixed(!isSidebarFixed)}
								className={`w-8 h-8 rounded-lg hover:bg-primary transition-colors duration-200 ${isSidebarFixed || isSidebarVisible ? 'opacity-100' : 'opacity-0'
									}`}
							>
								<Pin className={`h-4 w-4 text-white`} />
								<span className="sr-only">Fijar barra lateral</span>
							</Button>
						</TooltipTrigger>
						<TooltipContent side="right" className="bg-primary text-white py-1 px-2 text-sm rounded">
							<p>{isSidebarFixed ? 'Desfijar barra lateral' : 'Fijar barra lateral'}</p>
						</TooltipContent>
					</Tooltip>
				</div>
			</aside>
		</TooltipProvider>
	)
}
