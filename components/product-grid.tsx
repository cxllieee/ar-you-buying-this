"use client"

import { useState, useEffect } from "react"
import { ProductCard } from "@/components/product-card"
import { useProductStore } from "@/lib/store"
import { products } from "@/lib/products"

export function ProductGrid() {
  const { searchQuery, categoryFilter } = useProductStore()
  const [filteredProducts, setFilteredProducts] = useState(products)

  useEffect(() => {
    const filtered = products.filter((product) => {
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = !categoryFilter || product.category === categoryFilter
      return matchesSearch && matchesCategory
    })
    setFilteredProducts(filtered)
  }, [searchQuery, categoryFilter])

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
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
