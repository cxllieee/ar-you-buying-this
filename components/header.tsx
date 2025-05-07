"use client"

import type React from "react"

import { useState } from "react"
import { Search, ShoppingCart, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useProductStore } from "@/lib/store"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setSearchQuery, setCategoryFilter } = useProductStore()

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get("search") as string
    setSearchQuery(query)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[240px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Button variant="ghost" onClick={() => setCategoryFilter("")}>
                  All Products
                </Button>
                <Button variant="ghost" onClick={() => setCategoryFilter("office")}>
                  Office
                </Button>
                <Button variant="ghost" onClick={() => setCategoryFilter("furniture")}>
                  Furniture
                </Button>
                <Button variant="ghost" onClick={() => setCategoryFilter("retail")}>
                  Retail
                </Button>
                <Button variant="ghost" onClick={() => setCategoryFilter("industrial")}>
                  Industrial
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
          <a href="/" className="flex items-center gap-2">
            <span className="font-bold text-xl md:text-2xl text-primary">AR you buying this</span>
          </a>
        </div>

        <div className="hidden md:flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setCategoryFilter("")}>
              All
            </Button>
            <Button variant="ghost" onClick={() => setCategoryFilter("office")}>
              Office
            </Button>
            <Button variant="ghost" onClick={() => setCategoryFilter("furniture")}>
              Furniture
            </Button>
            <Button variant="ghost" onClick={() => setCategoryFilter("retail")}>
              Retail
            </Button>
            <Button variant="ghost" onClick={() => setCategoryFilter("industrial")}>
              Industrial
            </Button>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <form onSubmit={handleSearch} className="relative hidden md:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              name="search"
              placeholder="Search products..."
              className="w-[200px] lg:w-[300px] pl-8"
            />
          </form>

          <Button variant="outline" size="icon" className="relative">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
              0
            </span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                Create
                <span className="hidden md:inline">New</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent("open-customize-modal"))}>
                Customize Existing Asset
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.dispatchEvent(new CustomEvent("open-generate-modal"))}>
                Generate New Asset
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="container md:hidden px-4 pb-2">
        <form onSubmit={handleSearch} className="relative flex items-center">
          <Search className="absolute left-2.5 h-4 w-4 text-muted-foreground" />
          <Input type="search" name="search" placeholder="Search products..." className="w-full pl-8" />
        </form>
      </div>
    </header>
  )
}
