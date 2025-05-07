"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Wand2 } from "lucide-react"
import { ModelViewer } from "@/components/model-viewer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function GenerateAssetSection() {
  const [prompt, setPrompt] = useState("")
  const [name, setName] = useState("")
  const [category, setCategory] = useState("furniture")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState<string | null>(null)
  const [generationComplete, setGenerationComplete] = useState(false)

  const handleGenerate = () => {
    if (!prompt || !name) return

    setIsGenerating(true)

    // Simulate AI generation process
    setTimeout(() => {
      // In a real implementation, this would call an API to generate a 3D model
      setGeneratedModel("/models/office_chair.glb") // Using existing model as placeholder
      setIsGenerating(false)
      setGenerationComplete(true)
    }, 3000)
  }

  const handleSave = () => {
    alert("Model saved to your assets! In a real application, this would save the model to your account.")
    setPrompt("")
    setName("")
    setGeneratedModel(null)
    setGenerationComplete(false)
  }

  const handleReset = () => {
    setPrompt("")
    setName("")
    setGeneratedModel(null)
    setGenerationComplete(false)
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Create New 3D Asset</h2>
        <p className="text-muted-foreground mt-2">
          Describe what you want to create and our AI will generate a 3D model for you
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="asset-name">Asset Name</Label>
            <Input
              id="asset-name"
              placeholder="Enter a name for your asset"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-description">Detailed Description</Label>
            <Textarea
              id="asset-description"
              placeholder="Describe the 3D model in detail (e.g., A modern office chair with mesh back, adjustable height, and black leather seat)"
              className="min-h-[120px]"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset-category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="asset-category">
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

          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleGenerate} disabled={isGenerating || !prompt || !name}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate 3D Model
                </>
              )}
            </Button>

            <Button variant="outline" onClick={handleReset} disabled={isGenerating}>
              Reset
            </Button>
          </div>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Preview</CardTitle>
              <CardDescription>
                {generationComplete
                  ? "Your generated 3D model is ready to view"
                  : "Your generated 3D model will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <div className="w-full h-[300px] bg-slate-100 rounded-md overflow-hidden">
                {generatedModel ? (
                  <ModelViewer
                    src={generatedModel}
                    iosSrc={generatedModel.replace(".glb", ".usdz")}
                    poster="/OfficeChairBG.png"
                    alt="Generated 3D model"
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-12 w-12 animate-spin mb-4" />
                        <p>Generating your 3D model...</p>
                        <p className="text-sm mt-2">This may take a few moments</p>
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-12 w-12 mb-4" />
                        <p>Enter a description and click Generate</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
            {generationComplete && (
              <CardFooter>
                <Button className="w-full" onClick={handleSave}>
                  Save to My Assets
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>

      {generationComplete && (
        <div className="mt-6">
          {/* View in AR Card removed as per request */}
        </div>
      )}
    </div>
  )
}
