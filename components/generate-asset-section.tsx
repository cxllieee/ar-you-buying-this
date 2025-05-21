"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, MessageSquare, Camera, Wand2, Box, ArrowRight } from "lucide-react"
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
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isGenerating3D, setIsGenerating3D] = useState(false);
  const [generate3DError, setGenerate3DError] = useState<string | null>(null);

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

  const handleGenerateImage = async () => {
    setIsGeneratingImage(true);
    setImageError(null);
    setGeneratedImage(null);
    try {
      const response = await fetch("https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt })
      });
      if (!response.ok) throw new Error("Failed to generate image");
      const data = await response.json();
      setGeneratedImage(data.imageUrl);
      if (!formData.name) {
        const match = data.imageUrl.match(/generated-images\/(.*?)\.png/);
        if (match && match[1]) {
          setFormData({ ...formData, name: match[1] });
        }
      }
    } catch (err) {
      setImageError("Image generation failed. Try again.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerate3DModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating3D(true);
    setGenerate3DError(null);
    setGeneratedModel(null);
    try {
      if (!generatedImage) throw new Error('No generated image to use for 3D model.');
      
      // 1. Start 3D job
      const createRes = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/create-3d-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3uri: generatedImage })
      });
      if (!createRes.ok) throw new Error('Failed to start 3D generation job.');
      const createData = await createRes.json();
      const commandId = createData.commandId || createData['commandId'] || (typeof createData === 'string' && createData.match(/commandId: (.+)/)?.[1]);
      if (!commandId) throw new Error('No commandId returned from backend.');
      
      // 2. Poll for job status
      let status = '';
      let glbPresignedUrl = '';
      let usdzPresignedUrl = '';
      for (let i = 0; i < 60; i++) { // up to 5 min
        const checkRes = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/check-3d-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commandId })
        });
        const checkData = await checkRes.json();
        status = checkData.status;
        glbPresignedUrl = checkData['glb_presigned_url'] || '';
        usdzPresignedUrl = checkData['usdz_presigned_url'] || '';
        
        if (status === 'Success' && glbPresignedUrl && usdzPresignedUrl) break;
        if (status === 'Failed' || status === 'ExecutionTimedOut') throw new Error('3D generation failed.');
        await new Promise(res => setTimeout(res, 5000)); // wait 5s
      }
      
      if (status !== 'Success' || !glbPresignedUrl || !usdzPresignedUrl) {
        throw new Error('3D model not generated or URLs missing.');
      }

      // Use the presigned URLs directly
      setGeneratedModel(glbPresignedUrl);
      setFormData(prev => ({ ...prev, iosModelPath: usdzPresignedUrl }));
    } catch (err: any) {
      setGenerate3DError(err.message || '3D model generation failed.');
    } finally {
      setIsGenerating3D(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 md:gap-8 w-full max-w-4xl mx-auto px-2 md:px-0">
      <div className="flex-1 w-full">
        {/* 3-Step Visual Pipeline */}
        <div className="mb-4 md:mb-8">
          <div className="bg-slate-50 rounded-xl border border-slate-200 p-3 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg md:text-xl font-bold mb-1 text-center">How the 3D Asset Pipeline Works</h3>
            <p className="text-gray-500 mb-4 md:mb-6 text-sm md:text-base text-center">Create 3D assets in just 3 simple steps.</p>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-0">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center flex-1 px-2">
                <div className="bg-slate-200 rounded-full p-2 md:p-3 mb-1 md:mb-2">
                  <Wand2 className="h-7 w-7 md:h-8 md:w-8 text-slate-500" />
                </div>
                <div className="font-semibold text-base md:text-lg mb-0.5">1. Generate Image</div>
                <div className="text-gray-500 text-xs md:text-sm">Describe what you want. Our AI creates an image.</div>
              </div>
              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center mx-2 md:mx-4">
                <ArrowRight className="h-7 w-7 md:h-8 md:w-8 text-slate-300" />
              </div>
              {/* Step 2 */}
              <div className="flex flex-col items-center text-center flex-1 px-2">
                <div className="bg-slate-200 rounded-full p-2 md:p-3 mb-1 md:mb-2">
                  <ImageIcon className="h-7 w-7 md:h-8 md:w-8 text-slate-500" />
                </div>
                <div className="font-semibold text-base md:text-lg mb-0.5">2. Review Image</div>
                <div className="text-gray-500 text-xs md:text-sm">Check the result. Regenerate if needed.</div>
              </div>
              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center mx-2 md:mx-4">
                <ArrowRight className="h-7 w-7 md:h-8 md:w-8 text-slate-300" />
              </div>
              {/* Step 3 */}
              <div className="flex flex-col items-center text-center flex-1 px-2">
                <div className="bg-slate-200 rounded-full p-2 md:p-3 mb-1 md:mb-2">
                  <Box className="h-7 w-7 md:h-8 md:w-8 text-slate-500" />
                </div>
                <div className="font-semibold text-base md:text-lg mb-0.5">3. Create 3D Model</div>
                <div className="text-gray-500 text-xs md:text-sm">Turn your image into a 3D asset.</div>
              </div>
            </div>
          </div>
          {/* Divider for mobile */}
          <div className="block md:hidden mb-4">
            <hr className="border-t border-gray-200" />
          </div>
        </div>
        {/* End 3-Step Visual Pipeline */}
        {/* Concise instructions for mobile and desktop */}
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-bold mb-2">Create New 3D Asset</h2>
          <p className="text-gray-700 text-sm md:text-base">
            <span className="font-semibold">Describe your asset</span> and click <span className="font-semibold">Generate Image</span>. If you like the result, click <span className="font-semibold">Generate 3D Model</span>.
          </p>
        </div>
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4 w-full flex flex-row">
            <TabsTrigger value="text" className="w-1/2">Text to 3D</TabsTrigger>
            <TabsTrigger value="image" className="w-1/2">Image to 3D</TabsTrigger>
          </TabsList>
          <TabsContent value="text">
            <form className="flex flex-col gap-4">
              <Label htmlFor="asset-name">Asset Name</Label>
              <Input id="asset-name" placeholder="Enter asset name" className="mb-2" />
              <Label htmlFor="image-prompt">Description</Label>
              <Textarea
                id="image-prompt"
                placeholder="Describe the 3D model in detail"
                className="mb-2"
                value={imagePrompt}
                onChange={e => setImagePrompt(e.target.value)}
              />
              {imageError && <p className="text-red-500 mb-2">{imageError}</p>}
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
              <Label htmlFor="asset-material">Material</Label>
              <Input
                id="asset-material"
                placeholder="e.g., Mesh & Foam"
                value={formData.material}
                onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                required
              />
              <Label htmlFor="asset-color">Color</Label>
              <Input
                id="asset-color"
                placeholder="e.g., Black"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                required
              />
              <Label htmlFor="asset-price">Price (optional)</Label>
              <Input
                id="asset-price"
                type="number"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              />
              <Label htmlFor="asset-dimensions">Dimensions (optional)</Label>
              <Input
                id="asset-dimensions"
                placeholder='24"W x 24"D x 40"H'
                value={formData.dimensions}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, dimensions: e.target.value })}
              />
              <Button
                type="button"
                className="w-full mt-2 py-3 text-base"
                onClick={handleGenerateImage}
                disabled={isGeneratingImage || !imagePrompt}
              >
                {isGeneratingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Generate Image
              </Button>
              {generatedImage && (
                <Button
                  type="button"
                  className="w-full mt-2 py-3 text-base"
                  disabled={isGenerating3D}
                  onClick={handleGenerate3DModel}
                >
                  {isGenerating3D ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isGenerating3D ? 'Generating 3D Model...' : 'Generate 3D Model'}
                </Button>
              )}
              {generate3DError && <p className="text-red-500 mt-2">{generate3DError}</p>}
            </form>
          </TabsContent>
          <TabsContent value="image">
            <form className="flex flex-col gap-4">
              <Label htmlFor="image-upload">Upload Image</Label>
              <Input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="mb-2"
              />
              <Button type="button" className="w-full mb-2" onClick={handleCameraCapture}>
                Open Camera
              </Button>
              {imagePreview && (
                <div className="w-full flex justify-center mb-2">
                  <img src={imagePreview} alt="Preview" className="max-h-48 rounded-md object-contain" />
                </div>
              )}
              <Button
                type="button"
                className="w-full mt-2 py-3 text-base"
                onClick={/* TODO: implement image-to-3d handler */() => {}}
                disabled={!selectedImage}
              >
                Generate 3D Model
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
      {/* Right: Previews */}
      <div className="flex flex-col w-full md:w-[350px] flex-shrink-0 gap-6">
        {/* Image Preview */}
        <Card className="h-full w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Image Preview</CardTitle>
            <CardDescription>
              {generatedImage
                ? "Your generated image is ready to view"
                : "Your generated image will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[220px] bg-slate-100 rounded-md overflow-hidden flex items-center justify-center">
              {generatedImage ? (
                <Image src={generatedImage} alt="Generated preview" width={256} height={256} className="object-contain" />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Wand2 className="h-12 w-12 mb-4" />
                  <p>Enter a description and click Generate</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        {/* 3D Model Preview */}
        <Card className="h-full w-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">3D Model Preview</CardTitle>
            <CardDescription>
              {generatedModel
                ? "Your generated 3D model is ready to view"
                : "Your generated 3D model will appear here"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[220px] bg-slate-100 rounded-md overflow-hidden">
              {isGenerating3D ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Loader2 className="h-12 w-12 mb-4 animate-spin" />
                  <p>Generating 3D model...</p>
                </div>
              ) : generatedModel ? (
                <ModelViewer
                  src={generatedModel}
                  iosSrc={formData.iosModelPath || generatedModel.replace(".glb", ".usdz")}
                  alt="Generated 3D model"
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Wand2 className="h-12 w-12 mb-4" />
                  <p>Generate an image and 3D model to preview</p>
                </div>
              )}
            </div>
          </CardContent>
          {generatedModel && (
            <CardFooter>
              <Button className="w-full py-3 text-base" onClick={handleSave}>
                Save to My Assets
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  )
}
