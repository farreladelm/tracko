"use client"

import Image from "next/image"
import Link from "next/link"
import { logoutAction } from "@/app/actions"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User } from "lucide-react"

interface HeaderProps {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/dashboard" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative h-12 w-12">
              <Image
                src="/tracko-logo.png"
                alt="Tracko Logo"
                fill
                sizes="48px"
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block">Tracko</span>
          </Link>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger className="relative h-10 w-10 rounded-full overflow-hidden outline-none focus:ring-2 focus:ring-zinc-200 dark:focus:ring-zinc-800">
                <Avatar size="lg" className="h-full w-full">
                  <AvatarImage src={user.image || ""} alt={user.name || "User"} />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800">
                    <User className="h-5 w-5 text-zinc-500" />
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <form action={logoutAction}>
                  <DropdownMenuItem variant="destructive" className="cursor-pointer">
                    <button type="submit" className="w-full flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Keluar</span>
                    </button>
                  </DropdownMenuItem>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
