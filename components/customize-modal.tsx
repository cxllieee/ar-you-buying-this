"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ModelViewer } from "@/components/model-viewer"
import type { Product } from "@/lib/types"
import { products } from "@/lib/products"

export function CustomizeModal() {
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [customizations, setCustomizations] = useState({
    color: "original",
    material: "original",
    size: 100, // percentage of original size
  })

  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const product = (e as CustomEvent).detail || products[0]
      setSelectedProduct(product)
      setOpen(true)
    }

    window.addEventListener("open-customize-modal", handleOpenModal)
    return () => window.removeEventListener("open-customize-modal", handleOpenModal)
  }, [])

  if (!selectedProduct) return null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Customize {selectedProduct.name}</DialogTitle>
          <DialogDescription>
            Modify the appearance and properties of this product to match your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
          <div className="h-[400px] bg-slate-100 rounded-md overflow-hidden">
            <ModelViewer
              src={selectedProduct.modelPath}
              iosSrc={selectedProduct.iosModelPath}
              poster={
                selectedProduct.posterPath.startsWith("/")
                  ? selectedProduct.posterPath
                  : `/${selectedProduct.posterPath}`
              }
              alt={`3D model of ${selectedProduct.name}`}
            />
          </div>

          <Tabs defaultValue="color">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="color">Color</TabsTrigger>
              <TabsTrigger value="material">Material</TabsTrigger>
              <TabsTrigger value="dimensions">Dimensions</TabsTrigger>
            </TabsList>

            <TabsContent value="color" className="space-y-4">
              <RadioGroup
                value={customizations.color}
                onValueChange={(value) => setCustomizations({ ...customizations, color: value })}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="original" id="original-color" />
                    <Label htmlFor="original-color">Original</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="black" id="black" />
                    <Label htmlFor="black">Black</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="white" id="white" />
                    <Label htmlFor="white">White</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="brown" id="brown" />
                    <Label htmlFor="brown">Brown</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="gray" id="gray" />
                    <Label htmlFor="gray">Gray</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="custom" id="custom-color" />
                    <Label htmlFor="custom-color">Custom</Label>
                  </div>
                </div>

                {customizations.color === "custom" && (
                  <div className="mt-4">
                    <Label htmlFor="custom-color-input">Custom Color (Hex)</Label>
                    <Input id="custom-color-input" placeholder="#000000" className="mt-1" />
                  </div>
                )}
              </RadioGroup>
            </TabsContent>

            <TabsContent value="material" className="space-y-4">
              <RadioGroup
                value={customizations.material}
                onValueChange={(value) => setCustomizations({ ...customizations, material: value })}
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="original" id="original-material" />
                    <Label htmlFor="original-material">Original</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="wood" id="wood" />
                    <Label htmlFor="wood">Wood</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="metal" id="metal" />
                    <Label htmlFor="metal">Metal</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fabric" id="fabric" />
                    <Label htmlFor="fabric">Fabric</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="leather" id="leather" />
                    <Label htmlFor="leather">Leather</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="plastic" id="plastic" />
                    <Label htmlFor="plastic">Plastic</Label>
                  </div>
                </div>
              </RadioGroup>
            </TabsContent>

            <TabsContent value="dimensions" className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <Label htmlFor="size-slider">Size Adjustment</Label>
                  <span>{customizations.size}%</span>
                </div>
                <Slider
                  id="size-slider"
                  min={50}
                  max={150}
                  step={5}
                  value={[customizations.size]}
                  onValueChange={(value) => setCustomizations({ ...customizations, size: value[0] })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="width">Width (inches)</Label>
                  <Input id="width" type="number" placeholder="Width" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">Height (inches)</Label>
                  <Input id="height" type="number" placeholder="Height" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="depth">Depth (inches)</Label>
                  <Input id="depth" type="number" placeholder="Depth" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              alert("Customization saved! In a real application, this would update the 3D model.")
              setOpen(false)
            }}
          >
            Save Customizations
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
