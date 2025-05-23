"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { useProductStore } from "@/lib/store"
import type { Product } from "@/lib/types"

interface ProductGridProps {
  onCustomize?: (product: any) => void;
}

export function ProductGrid({ onCustomize }: ProductGridProps) {
  const { searchQuery, categoryFilter } = useProductStore()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/assets')
        if (!response.ok) {
          throw new Error('Failed to fetch products')
        }
        const data = await response.json()
        if (Array.isArray(data.items)) {
          // Filter out invalid products (missing id, name, or modelPath)
          const validProducts = data.items.filter(
            (item: any) =>
              item &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.modelPath === 'string'
          )
          setProducts(validProducts)
        } else if (Array.isArray(data)) {
          const validProducts = data.filter(
            (item: any) =>
              item &&
              typeof item.id === 'string' &&
              typeof item.name === 'string' &&
              typeof item.modelPath === 'string'
          )
          setProducts(validProducts)
        } else {
          setProducts([])
          setError(data.error || 'Unexpected response from server')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        setProducts([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = !categoryFilter || product.category === categoryFilter
        return matchesSearch && matchesCategory
      })
    : []

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading assets...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] text-center">
        <h3 className="text-xl font-semibold text-red-500">Error loading assets</h3>
        <p className="text-muted-foreground mt-2">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Available Assets</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {filteredProducts.length} asset{filteredProducts.length !== 1 ? "s" : ""} found
          </span>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] text-center">
          <h3 className="text-xl font-semibold">No assets found</h3>
          <p className="text-muted-foreground mt-2">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts
            .filter(product => product.modelPath)
            .map(product => (
              <ProductCard key={product.id} product={product} onCustomize={onCustomize} />
            ))}
        </div>
      )}
    </div>
  )
}
