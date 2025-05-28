"use client"

import type React from "react"

import { Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useProductStore } from "@/lib/store"
import Link from "next/link"
import Image from "next/image"
import { useRouter, usePathname } from "next/navigation"

export function Header() {
  const { setSearchQuery, setCategoryFilter } = useProductStore()
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("search") as string
    setSearchQuery(query)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-center px-4">
        <div className="flex items-center gap-4 md:gap-6 justify-center w-full">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={e => {
              if (pathname === "/") {
                e.preventDefault();
                window.location.reload();
              }
            }}
          >
            <Image src="/logo.png" alt="Logo" className="h-8 w-auto" width={32} height={32} />
            <span className="font-bold text-xl md:text-2xl text-primary">AR you buying this</span>
          </Link>
          <form onSubmit={handleSearch} className="relative hidden md:flex items-center ml-6">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" name="search" placeholder="Search assets..." className="w-[200px] lg:w-[300px] pl-8" />
          </form>
        </div>
      </div>

      <div className="container md:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" name="search" placeholder="Search assets..." className="w-full pl-8" />
        </form>
      </div>
    </header>
  )
}
