"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CuboidIcon as Cube } from "lucide-react"
import type { Product } from "@/lib/types"
import { ModelViewer } from "@/components/model-viewer"

interface ProductCardProps {
  product: Product
  onCustomize?: (product: Product) => void
}

export function ProductCard({ product, onCustomize }: ProductCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  // Use a default poster if the product's poster path is not available
  const posterPath = product.posterPath
    ? (product.posterPath.startsWith("/") ? product.posterPath : `/${product.posterPath}`)
    : "/placeholder.svg";

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0 relative h-[300px] bg-slate-100">
        <ModelViewer
          src={product.modelPath}
          iosSrc={product.iosModelPath}
          alt={`3D model of ${product.name}`}
          data-product-id={product.id}
        />
        <div className="absolute top-2 right-2 flex gap-1">
          {product.isNew && <Badge className="bg-green-500 hover:bg-green-600">New</Badge>}
          {product.isCustomizable && (
            <Badge variant="outline" className="bg-background/80">
              Customizable
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <CardTitle className="text-lg">{product.name}</CardTitle>
          <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

        {showDetails && (
          <div className="mt-4 space-y-2 text-sm border-t pt-2">
            <div className="grid grid-cols-3 gap-1">
              <span className="font-medium">Dimensions:</span>
              <span className="col-span-2">{product.dimensions}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-medium">Material:</span>
              <span className="col-span-2">{product.material}</span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <span className="font-medium">Color:</span>
              <span className="col-span-2">{product.color}</span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0 flex flex-col gap-2">
        <div className="flex gap-2 w-full">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide Details" : "Show Details"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onCustomize ? onCustomize(product) : window.dispatchEvent(new CustomEvent("open-customize-modal", { detail: product }))}
          >
            <Cube className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
