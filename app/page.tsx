"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"
import { CustomizeModal } from "@/components/customize-modal"
import { GenerateModal } from "@/components/generate-modal"
import { GenerateAssetSection } from "@/components/generate-asset-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CuboidIcon, Search } from "lucide-react"
import Image from "next/image"

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")

  if (!showDemo) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
        <div className="max-w-2xl w-full flex flex-col items-center gap-6">
          <Image src="/logo.png" alt="AR You Buying This Logo" width={120} height={120} />
          <h1 className="text-3xl font-bold text-center">AR You Buying This?</h1>
          <h2 className="text-xl font-semibold text-center text-blue-700">Transforming Retail with Generative 3D & AR</h2>
          <section className="bg-slate-50 rounded-lg p-4 shadow w-full">
            <p className="text-gray-700 mb-2">
              Instantly turn text or images into high-fidelity 3D assets using AI, and view them in your space with web-based AR. Shop smarter, reduce returns, and experience the future of retail.
            </p>
            <h3 className="font-semibold mb-1">How it works:</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-2">
              <li>Browse 3D retail assets</li>
              <li>Generate your own assets</li>
              <li>Preview them in your space using your device's camera</li>
            </ol>
            <p className="text-gray-700 mb-2">
              Can't find what you want? Just describe it—our AI will create a 3D model for you. Place it in your room, walk around it, and customize in real time.
            </p>
            <h3 className="font-semibold mb-1">Get started:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Browse assets</li>
              <li>Generate new ones</li>
              <li>Preview in AR</li>
              <li>Customize as you like</li>
            </ul>
          </section>
          <a
            href="https://github.com/cxllieee/ar-you-buying-this"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline text-center"
          >
            View the code on GitHub
          </a>
          <button
            className="mt-6 px-8 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 text-lg font-semibold transition"
            onClick={() => setShowDemo(true)}
          >
            Try Demo
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6">
        <Tabs defaultValue="browse" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Browse Assets</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <CuboidIcon className="h-4 w-4" />
              <span>Generate New</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="mt-0">
            <ProductGrid />
          </TabsContent>

          <TabsContent value="generate" className="mt-0">
            <GenerateAssetSection />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
      <CustomizeModal />
      <GenerateModal />
    </div>
  )
}
