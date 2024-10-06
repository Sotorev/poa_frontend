"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItemsProps {
  mobile?: boolean;
}

export default function NavItems({ mobile = false }: NavItemsProps) {
  const linkClass = mobile
    ? "block py-2 text-white hover:text-green-200"
    : "text-white hover:text-green-200";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={linkClass}>
            Gestión
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href="/users/managment" className="w-full">
              Usuarios
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/roles" className="w-full">
              Roles
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/permissions" className="w-full">
              Permisos
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className={linkClass}>
            POA
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            <Link href="/faculties" className="w-full">
              Facultad
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/monitoring" className="w-full">
              Monitoreo
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/statistics" className="w-full">
              Estadísticas
            </Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
