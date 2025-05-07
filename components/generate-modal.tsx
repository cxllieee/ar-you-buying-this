"use client"

import { useEffect } from "react"

import { useState } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, MessageSquare } from "lucide-react"

export function GenerateModal() {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("text")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null)

  useEffect(() => {
    const handleOpenModal = () => setOpen(true)
    window.addEventListener("open-generate-modal", handleOpenModal)
    return () => window.removeEventListener("open-generate-modal", handleOpenModal)
  }, [])

  const handleGenerate = () => {
    setIsGenerating(true)

    // Simulate generation process
    setTimeout(() => {
      setIsGenerating(false)
      // In a real app, this would be the URL to the generated 3D model
      setGeneratedPreview("/placeholder.svg?height=400&width=400")
    }, 3000)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Generate New 3D Asset</DialogTitle>
          <DialogDescription>
            Create a new 3D model using AI. Describe what you want or upload a reference image.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="text" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="text">
              <MessageSquare className="h-4 w-4 mr-2" />
              Text to 3D
            </TabsTrigger>
            <TabsTrigger value="image">
              <ImageIcon className="h-4 w-4 mr-2" />
              Image to 3D
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div>
              <TabsContent value="text" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="product-name">Product Name</Label>
                  <Input id="product-name" placeholder="Modern Office Chair" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-description">Detailed Description</Label>
                  <Textarea
                    id="product-description"
                    placeholder="Describe the product in detail, including colors, materials, style, etc."
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select defaultValue="furniture">
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="furniture">Furniture</SelectItem>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="image" className="space-y-4 mt-0">
                <div className="space-y-2">
                  <Label htmlFor="product-name-image">Product Name</Label>
                  <Input id="product-name-image" placeholder="Modern Office Chair" />
                </div>

                <div className="space-y-2">
                  <Label>Reference Image</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center">
                      Drag and drop an image, or click to browse
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Upload Image
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="additional-notes"
                    placeholder="Any specific details or modifications to the reference image"
                  />
                </div>
              </TabsContent>

              <Button className="w-full mt-4" onClick={handleGenerate} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate 3D Model"
                )}
              </Button>
            </div>

            <div className="bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
              {generatedPreview ? (
                <img
                  src={generatedPreview || "/placeholder.svg"}
                  alt="Generated 3D model preview"
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="text-center p-6">
                  <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-30" />
                  <p className="text-muted-foreground mt-2">
                    {isGenerating ? "Generating preview..." : "Preview will appear here"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </Tabs>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          {generatedPreview && (
            <Button
              onClick={() => {
                alert(
                  "3D model saved to your assets! In a real application, this would add the model to your inventory.",
                )
                setOpen(false)
                setGeneratedPreview(null)
              }}
            >
              Save to My Assets
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
