"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Upload, ImageIcon, MessageSquare, Camera, Wand2, Box, ArrowRight, Sparkles } from "lucide-react"
import { ModelViewer } from "@/components/model-viewer"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Image from "next/image"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { AlertTriangle, CheckCircle } from "lucide-react"

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

// Techy, playful waiting/progress component
type TechyWaitingProps = {
  label: string;
  percent: number;
  color?: string;
  icon?: React.ReactNode;
};

function TechyWaiting({ label, percent, color = "from-purple-400 via-blue-500 to-pink-400", icon = <Sparkles className="h-10 w-10 text-white drop-shadow-lg animate-pulse" /> }: TechyWaitingProps) {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full py-6 animate-fade-in">
      <div className={`mb-4 w-20 h-20 flex items-center justify-center rounded-full bg-gradient-to-tr ${color} shadow-xl animate-spin-slow`}>
        {icon}
      </div>
      <div className="font-bold text-lg mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-500 to-pink-400 drop-shadow">{label}</div>
      <div className="w-full max-w-xs h-3 rounded-full bg-gradient-to-r from-slate-200 via-slate-300 to-slate-100 overflow-hidden mb-2">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${percent}%` }} />
      </div>
      {/* <div className="text-xs text-gray-500">{percent}% complete</div> */}
      <div className="mt-4 px-4 py-2 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 border border-purple-200 rounded-lg text-purple-700 flex items-center gap-2 shadow">
        <Sparkles className="h-4 w-4 text-purple-400 animate-pulse" />
        <span>Hang tight! Our AI is working its magic.</span>
      </div>
    </div>
  )
}

// Add prop type for initialTab
interface GenerateAssetSectionProps {
  initialTab?: string;
  preloadedAsset?: any;
  onTabChange?: (tab: string) => void;
  onClearCustomize?: () => void;
}

const CONTENT_GUIDELINES = [
  "Violence and gore",
  "Abuse and harassment content",
  "Hate speech and extremist content",
  "Nudity and sexually explicit material",
  "Self-harm related content",
  "Chemical, biological, radiological and nuclear (CBRN) weapons/threats",
  "Profanity and insults",
  "Cultural appropriation and harmful stereotypes",
  "Content that could cause physical/emotional harm",
  "Deceptive political or social misinformation (e.g. human faces/models)"
];

const NOT_ALLOWED_KEYWORDS = [
  "Violence",
  "Adult content",
  "Hate speech",
  "Weapons",
  "Harassment",
  "Misinformation"
];

function ContentGuidelinesDropdown() {
  return (
    <Accordion type="single" collapsible className="mb-2">
      <AccordionItem value="guidelines">
        <AccordionTrigger className="text-purple-700 font-medium text-base flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-purple-400" /> Content Guidelines
        </AccordionTrigger>
        <AccordionContent>
          <div className="mb-2">
            <div className="font-semibold text-green-700 mb-1 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" /> What's Allowed
            </div>
            <div className="flex flex-wrap gap-2 mb-2 bg-green-50 p-2 rounded">
              <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs">Furniture</span>
              <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs">Office items</span>
              <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs">Decor</span>
              <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs">Retail products</span>
              <span className="bg-green-200 text-green-900 px-2 py-0.5 rounded text-xs">Abstract designs</span>
            </div>
          </div>
          <div className="mb-2">
            <div className="font-semibold text-red-700 mb-1 flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-red-500" /> Not Allowed
            </div>
            <div className="flex flex-wrap gap-2 mb-2 bg-red-50 p-2 rounded">
              {NOT_ALLOWED_KEYWORDS.map((item) => (
                <span key={item} className="bg-red-200 text-red-900 px-2 py-0.5 rounded text-xs font-medium">{item}</span>
              ))}
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Content is automatically checked. Focus on furniture, decor, and retail items for best results.
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

const MODEL_INFOS = {
  tripoSR: {
    title: "TripoSR",
    url: "https://www.triposrai.com/",
    description: "TripoSR is a state-of-the-art, open-source model for fast 3D reconstruction from a single image, collaboratively developed by Tripo AI and Stability AI. It generates a 3D asset in about 1-2 minutes."
  },
  "step1x-3d": {
    title: "Step1X-3D",
    url: "https://github.com/stepfun-ai/Step1X-3D",
    description: "Step1X-3D generates high-quality 3D assets with detailed geometry and versatile texture maps. It excels at aligning surface geometry and textures, but may take up to 10 minutes to generate."
  }
};

function ModelInfoDropdown({ mode }: { mode: 'tripoSR' | 'step1x-3d' }) {
  const info = MODEL_INFOS[mode];
  if (!info) return null;
  return (
    <Accordion type="single" collapsible className="mb-2">
      <AccordionItem value="info">
        <AccordionTrigger className="text-blue-700 font-medium text-base flex items-center gap-2">
          <span>About {info.title}</span>
        </AccordionTrigger>
        <AccordionContent>
          <div className="text-sm text-gray-700">
            <a href={info.url} target="_blank" rel="noopener noreferrer" className="underline text-blue-600 font-semibold">{info.title}</a>: {info.description}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Update function signature to accept props
export function GenerateAssetSection({ initialTab = "text", preloadedAsset, onTabChange, onClearCustomize }: GenerateAssetSectionProps) {
  const [activeTab, setActiveTab] = useState(initialTab)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedModel, setGeneratedModel] = useState<{ glb: string; usdz: string } | null>(null)
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
  const [modelJobs, setModelJobs] = useState<{ [key: string]: string }>({});
  const [generatedModels, setGeneratedModels] = useState<{ [key: string]: { glb: string; usdz: string } | null }>({
    tripoSR: null,
    "step1x-3d": null,
  });
  const [isGenerating3D, setIsGenerating3D] = useState<{ [key: string]: boolean }>({
    tripoSR: false,
    "step1x-3d": false,
  });
  const [generate3DError, setGenerate3DError] = useState<{ [key: string]: string | null }>({
    tripoSR: null,
    "step1x-3d": null,
  });

  useEffect(() => {
    if (preloadedAsset && preloadedAsset.id) {
      fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/asset-presigned-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: JSON.stringify({ item_id: preloadedAsset.id }) })
      })
        .then(res => res.json())
        .then(data => {
          // Parse the body field for s3_presigned_url
          let url = null;
          if (data.body) {
            try {
              const parsed = JSON.parse(data.body);
              url = parsed.s3_presigned_url;
            } catch {}
          }
          if (url) {
            setImagePreview(url);
            // Do not setGeneratedImage here
          }
        })
        .catch(() => {
          setImagePreview(null);
        });
      setFormData(formData => ({
        ...formData,
        name: preloadedAsset.name || '',
        description: preloadedAsset.description || ''
      }));
      setActiveTab('image');
    }
  }, [preloadedAsset]);

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
      // If the reference image is from a preloaded asset (S3 URI), send JSON
      if (imagePreview && imagePreview.startsWith('https://') && !selectedImage) {
        const s3uri = presignedUrlToS3Uri(imagePreview);
        const response = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/image-to-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            s3uri,
            prompt: formData.description,
            item_id: formData.name || ''
          })
        });
        if (!response.ok) throw new Error('Failed to generate image');
        const data = await response.json();
        setGeneratedImage(data.imageUrl || data.presignedUrl);
      } else if (selectedImage) {
        // Fallback to file upload (current behavior)
        const requestData = new FormData();
        requestData.append('image', selectedImage);
        requestData.append('prompt', formData.description || '');
        const response = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/image-to-image', {
          method: 'POST',
          body: requestData
        });
        if (!response.ok) throw new Error('Failed to generate image');
        const data = await response.json();
        setGeneratedImage(data.imageUrl || data.presignedUrl);
      }
    } catch (err) {
      setImageError('Image generation failed. Try again.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateTextToImage = async () => {
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
  
  //   if (!imagePrompt) return;
  //   setIsGeneratingImage(true);
  //   setImageError(null);
  //   setGeneratedImage(null);
  //   try {
  //     const body = {
  //       prompt: imagePrompt,
  //       assetName: formData.name,
  //     };
  //     const response = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/generate-image', {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(body),
  //     });
  //     if (!response.ok) throw new Error('Failed to generate image');
  //     const data = await response.json();
  //     setGeneratedImage(data.imageUrl || data.presignedUrl);
  //   } catch (err) {
  //     setImageError('Image generation failed. Try again.');
  //   } finally {
  //     setIsGeneratingImage(false);
  //   }
  // };

  function presignedUrlToS3Uri(url: string): string | null {
    // Example: https://bucket.s3.amazonaws.com/key.png?... => s3://bucket/key.png
    try {
      const match = url.match(/^https:\/\/(.+?)\.s3\.amazonaws\.com\/(.+?)(\?|$)/);
      if (!match) return null;
      return `s3://${match[1]}/${match[2]}`;
    } catch {
      return null;
    }
  }

  const handleGenerate3DModel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating3D({ tripoSR: true, "step1x-3d": true });
    setGenerate3DError({ tripoSR: null, "step1x-3d": null });
    try {
      if (!generatedImage) throw new Error('No generated image to use for 3D model.');
      const s3uri = presignedUrlToS3Uri(generatedImage);
      if (!s3uri) throw new Error('Could not extract S3 URI from image URL.');
      // 1. Start 3D job
      const createRes = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/create-3d-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ s3uri })
      });
      if (!createRes.ok) throw new Error('Failed to start 3D generation job.');
      const createData = await createRes.json();
      if (createData.results) {
        setModelJobs(createData.results);
        // Poll both jobs
        Object.entries(createData.results).forEach(([modeName, commandId]) => {
          poll3DJob(commandId as string, modeName);
        });
      }
      if (!Object.keys(createData.results).length) throw new Error('No commandIds returned from backend.');
    } catch (err: any) {
      setGenerate3DError(prev => ({ ...prev, tripoSR: err.message || '3D model generation failed.', "step1x-3d": err.message || '3D model generation failed.' }));
    }
  };

  const handleSaveToS3 = async () => {
    if (!selectedImage) return;
    const formDataToSend = new FormData();
    formDataToSend.append('image', selectedImage);
    formDataToSend.append('name', formData.name || 'uploaded-image');
    try {
      const response = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/upload-image', {
        method: 'POST',
        body: formDataToSend,
      });
      const data = await response.json();
      if (data.s3uri) {
        alert(`Saved to: ${data.s3uri}`);
      } else {
        alert('Failed to save image to S3.');
      }
    } catch (err) {
      alert('Error saving image to S3.');
    }
  };

  const poll3DJob = async (commandId: string, modeName: string) => {
    setIsGenerating3D(prev => ({ ...prev, [modeName]: true }));
    setGenerate3DError(prev => ({ ...prev, [modeName]: null }));
    try {
      let status = '';
      let glbPresignedUrl = '';
      let usdzPresignedUrl = '';
      for (let i = 0; i < 60; i++) {
        const checkRes = await fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/check-3d-job', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ commandId, modelName: modeName }),
        });
        const checkData = await checkRes.json();
        status = checkData.status;
        glbPresignedUrl = checkData['glb_presigned_url'] || '';
        usdzPresignedUrl = checkData['usdz_presigned_url'] || '';
        if (status === 'Success' && (glbPresignedUrl || usdzPresignedUrl)) break;
        if (status === 'Failed' || status === 'ExecutionTimedOut') throw new Error('3D generation failed.');
        await new Promise(res => setTimeout(res, 5000));
      }
      if (status !== 'Success' || (!glbPresignedUrl && !usdzPresignedUrl)) throw new Error('3D model not generated or URL missing.');
      setGeneratedModels(prev => ({
        ...prev,
        [modeName]: { glb: glbPresignedUrl, usdz: usdzPresignedUrl },
      }));
    } catch (err: any) {
      setGenerate3DError(prev => ({ ...prev, [modeName]: err.message || '3D model generation failed.' }));
    } finally {
      setIsGenerating3D(prev => ({ ...prev, [modeName]: false }));
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
                <div className="bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full p-2 md:p-3 mb-1 md:mb-2 shadow-lg">
                  <Wand2 className="h-7 w-7 md:h-8 md:w-8 text-white" />
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
                <div className="bg-gradient-to-tr from-blue-400 to-cyan-400 rounded-full p-2 md:p-3 mb-1 md:mb-2 shadow-lg">
                  <ImageIcon className="h-7 w-7 md:h-8 md:w-8 text-white" />
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
                <div className="bg-gradient-to-tr from-green-400 to-emerald-400 rounded-full p-2 md:p-3 mb-1 md:mb-2 shadow-lg">
                  <Box className="h-7 w-7 md:h-8 md:w-8 text-white" />
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
                placeholder="e.g., A modern black office chair with mesh back and gold legs. Include material and color in your description for best results."
                className="mb-2"
                value={imagePrompt}
                onChange={e => setImagePrompt(e.target.value)}
              />
              <ContentGuidelinesDropdown />
              {imageError && <p className="text-red-500 mb-2">{imageError}</p>}
              <Button
                type="button"
                className="w-full mt-2 py-3 text-base"
                onClick={handleGenerateTextToImage}
                disabled={isGeneratingImage || !imagePrompt}
              >
                {isGeneratingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Generate Image
              </Button>
              {generatedImage && (
                <Button
                  type="button"
                  className="w-full mt-2 py-3 text-base"
                  disabled={isGenerating3D.tripoSR}
                  onClick={handleGenerate3DModel}
                >
                  {isGenerating3D.tripoSR ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isGenerating3D.tripoSR ? 'Generating 3D Model...' : 'Generate 3D Model'}
                </Button>
              )}
              {generate3DError.tripoSR && <p className="text-red-500 mt-2">{generate3DError.tripoSR}</p>}
            </form>
          </TabsContent>
          <TabsContent value="image">
            <form className="flex flex-col gap-4">
              <Label>Reference Image</Label>
              <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2">
                {imagePreview ? (
                  <div className="relative w-full aspect-square">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-contain rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setImagePreview(null);
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
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Upload Image
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
              <Label htmlFor="asset-name-image">Asset Name</Label>
              <Input
                id="asset-name-image"
                placeholder="Enter asset name"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
              />
              <Label htmlFor="customisation-prompt">Customisation Prompt</Label>
              <Textarea
                id="customisation-prompt"
                placeholder="e.g., Make the chair legs gold, add a logo on the backrest. Include material and color in your description for best results."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
              <ContentGuidelinesDropdown />
              <Button
                type="button"
                className="w-full mt-2 py-3 text-base"
                onClick={handleGenerateImage}
                disabled={!(selectedImage || imagePreview) || !formData.description}
              >
                {isGeneratingImage ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Generate Image
              </Button>
              {generatedImage && (
                <Button
                  type="button"
                  className="w-full mt-2 py-3 text-base"
                  disabled={isGenerating3D.tripoSR}
                  onClick={handleGenerate3DModel}
                >
                  {isGenerating3D.tripoSR ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  {isGenerating3D.tripoSR ? 'Generating 3D Model...' : 'Generate 3D Model'}
                </Button>
              )}
              {generate3DError.tripoSR && <p className="text-red-500 mt-2">{generate3DError.tripoSR}</p>}
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
            <div className="w-full h-[220px] bg-gradient-to-br from-slate-100 via-blue-50 to-pink-50 rounded-md overflow-hidden flex items-center justify-center">
              {isGeneratingImage ? (
                <TechyWaiting label="Generating Image..." percent={60} color="from-pink-400 via-blue-400 to-purple-400" />
              ) : generatedImage ? (
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
        {([
          'tripoSR',
          'step1x-3d',
        ] as const).map((mode) => (
          <Card key={mode} className="h-full w-full mb-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{mode} 3D Model Preview</CardTitle>
              <CardDescription>
                {generatedModels[mode]
                  ? "Your generated 3D model is ready to view"
                  : "Your generated 3D model will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[220px] bg-gradient-to-br from-slate-100 via-blue-50 to-pink-50 rounded-md overflow-hidden">
                {isGenerating3D[mode] ? (
                  <TechyWaiting label={`Generating 3D Model (${mode})...`} percent={40} color="from-blue-400 via-purple-400 to-pink-400" icon={<Box className="h-10 w-10 text-white drop-shadow-lg animate-bounce" />} />
                ) : generatedModels[mode] ? (
                  <ModelViewer
                    src={generatedModels[mode]?.glb || ''}
                    iosSrc={generatedModels[mode]?.usdz || ''}
                    alt={`Generated 3D model (${mode})`}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <Wand2 className="h-12 w-12 mb-4" />
                    <p>Generate an image and 3D model to preview</p>
                  </div>
                )}
              </div>
              <ModelInfoDropdown mode={mode} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
