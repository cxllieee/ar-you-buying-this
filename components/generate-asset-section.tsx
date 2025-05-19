"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, MessageSquare, Camera, Wand2 } from "lucide-react"
import { ModelViewer } from "@/components/model-viewer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"

interface AssetData {
  id: string
  name: string
  description: string
  price: number
  category: string
  modelPath: string
  iosModelPath: string
  posterPath: string
  dimensions: string
  material: string
  color: string
  isCustomizable: boolean
}

export function GenerateAssetSection() {
  const [activeTab, setActiveTab] = useState("text")
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<Partial<AssetData>>({
    name: "",
    description: "",
    category: "furniture",
    price: 0,
    dimensions: "",
    material: "",
    color: "",
    isCustomizable: true
  })

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      const video = document.createElement('video')
      video.srcObject = stream
      await video.play()
      
      const canvas = document.createElement('canvas')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx?.drawImage(video, 0, 0)
      
      stream.getTracks().forEach(track => track.stop())
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
          setSelectedImage(file)
          setImagePreview(URL.createObjectURL(blob))
        }
      }, 'image/jpeg')
    } catch (_error) {
      console.error('Error accessing camera:', _error)
      alert('Unable to access camera. Please check your permissions.')
    }
  }

  const handleGenerate = async () => {
    if (!formData.name || (!formData.description && !selectedImage)) return

    setIsGenerating(true)

    try {
      const requestData = new FormData()
      requestData.append('name', formData.name)
      requestData.append('description', formData.description || '')
      requestData.append('category', formData.category || 'furniture')
      requestData.append('price', formData.price?.toString() || '0')
      requestData.append('dimensions', formData.dimensions || '')
      requestData.append('material', formData.material || '')
      requestData.append('color', formData.color || '')
      requestData.append('isCustomizable', formData.isCustomizable?.toString() || 'true')
      
      if (selectedImage) {
        requestData.append('image', selectedImage)
      }

      const response = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/generate-asset', {
        method: 'POST',
        body: requestData
      })

      if (!response.ok) {
        throw new Error('Failed to generate 3D model')
      }

      const data = await response.json()
      setGeneratedModel(data.modelUrl)
    } catch (_error) {
      console.error('Error generating 3D model:', _error)
      alert('Failed to generate 3D model. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setFormData({
      name: "",
      description: "",
      category: "furniture",
      price: 0,
      dimensions: "",
      material: "",
      color: "",
      isCustomizable: true
    })
    setSelectedImage(null)
    setImagePreview(null)
    setGeneratedModel(null)
  }

  const handleSave = async () => {
    if (!generatedModel) return;
    try {
      const saveData = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        material: formData.material,
        color: formData.color,
        price: formData.price,
        dimensions: formData.dimensions,
        modelUrl: generatedModel
      };
      const response = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/save-generated-asset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saveData)
      });
      if (!response.ok) throw new Error('Failed to save asset');
      alert('3D model saved to your assets!');
      handleReset();
    } catch {
      alert('Failed to save asset.');
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Create New 3D Asset</h2>
        <p className="text-muted-foreground mt-2">
          Describe what you want to create and our AI will generate a 3D model for you
        </p>
      </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <TabsContent value="text" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  placeholder="Enter asset name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-description">Description</Label>
                <Textarea
                  id="asset-description"
                  placeholder="Describe the 3D model in detail"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  required
                >
                  <SelectTrigger id="asset-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="furniture">Furniture</SelectItem>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-material">Material</Label>
                <Input
                  id="asset-material"
                  placeholder="e.g., Mesh & Foam"
                  value={formData.material}
                  onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-color">Color</Label>
                <Input
                  id="asset-color"
                  placeholder="e.g., Black"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-price">Price (optional)</Label>
                <Input
                  id="asset-price"
                  type="number"
                  placeholder="Enter price"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset-dimensions">Dimensions (optional)</Label>
                <Input
                  id="asset-dimensions"
                  placeholder='24"W x 24"D x 40"H'
                  value={formData.dimensions}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dimensions: e.target.value })}
                />
              </div>
            </TabsContent>

            <TabsContent value="image" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label htmlFor="asset-name-image">Asset Name</Label>
                <Input
                  id="asset-name-image"
                  placeholder="Enter asset name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Reference Image</Label>
                <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2">
                  {imagePreview ? (
                    <div className="relative w-full aspect-square">
                      <Image
                        src={imagePreview}
                        alt="Preview"
                        width={200}
                        height={200}
                        className="w-full h-full object-contain rounded-md"
                      />
                      <Button
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          setSelectedImage(null)
                          setImagePreview(null)
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground text-center">
                        Drag and drop an image, or click to browse
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Upload Image
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleCameraCapture}
                        >
                          <Camera className="h-4 w-4 mr-2" />
                          Take Photo
                        </Button>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="additional-notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="additional-notes"
                  placeholder="Any specific details or modifications to the reference image"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </TabsContent>

            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={handleGenerate}
                disabled={isGenerating || !formData.name || !formData.description || !formData.category || !formData.material || !formData.color}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Loader2 className="mr-2 h-4 w-4" />
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
                  {generatedModel
                    ? "Your generated 3D model is ready to view"
                    : "Your generated 3D model will appear here"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[300px] bg-slate-100 rounded-md overflow-hidden">
                  {generatedModel ? (
                    <ModelViewer
                      src={generatedModel}
                      iosSrc={generatedModel.replace(".glb", ".usdz")}
                      poster={imagePreview || "/placeholder.svg"}
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
              {generatedModel && (
                <CardFooter>
                  <Button className="w-full" onClick={handleSave}>
                    Save to My Assets
                  </Button>
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}
