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
import dynamic from "next/dynamic"
import animationData from "../animation/Animation - 1747803212907.json"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")
  const [generateTab, setGenerateTab] = useState("text")
  const [customizeAsset, setCustomizeAsset] = useState(null)

  if (!showDemo) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl w-full flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full shadow-xl bg-white flex items-center justify-center mb-2 animate-fade-in">
            <Lottie animationData={animationData} loop={true} style={{ width: '110px', height: '110px' }} />
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">AR You Buying This?</h1>
          <h2 className="text-xl font-semibold text-center text-blue-700 animate-fade-in">Transforming Retail with Generative 3D & AR</h2>
          <section className="bg-white/80 rounded-2xl p-6 shadow-2xl w-full border border-blue-100 animate-fade-in">
            <p className="text-gray-700 mb-2">
              Instantly turn text or images into high-fidelity 3D assets using AI, and view them in your space with web-based AR. Shop smarter, reduce returns, and experience the future of retail.
            </p>
            <h3 className="font-semibold mb-1">How it works:</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-1 mb-2">
              <li>Browse 3D retail assets</li>
              <li>Generate your own assets</li>
              <li>Preview them in your space using your device&apos;s camera</li>
            </ol>
            <p className="text-gray-700 mb-2">
              Can&apos;t find what you want? Just describe it—our AI will create a 3D model for you. Place it in your room, walk around it, and customize in real time.
            </p>
            <h3 className="font-semibold mb-1">Get started:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Browse assets</li>
              <li>Generate new ones</li>
              <li>Preview in AR</li>
              <li>Customize as you like</li>
            </ul>
            <div className="w-full flex flex-col items-center mt-4">
              <span className="text-xs text-gray-500 text-center">Contributors: Callie Cheong (@calliecg), Lester Sim (@lestesim), Jennifer Lin (@awsjlin), Bryan Chen (@bryancwh), Yong Xuan (@yxchua)</span>
            </div>
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
            className="mt-6 px-8 py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl text-lg font-semibold transition-all duration-200 animate-fade-in"
            onClick={() => setShowDemo(true)}
          >
            Try Demo
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-1 py-4 sm:px-2 sm:py-8">
        <div className="w-full max-w-full sm:max-w-5xl bg-white/80 rounded-2xl shadow-2xl border border-blue-100 p-2 sm:p-4 md:p-8 animate-fade-in overflow-x-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="flex w-full mb-4 sm:mb-6 bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100 rounded-xl shadow overflow-x-auto">
              <TabsTrigger value="browse" className="flex-1 min-w-0 flex items-center justify-center gap-2 text-base sm:text-lg font-semibold text-blue-700 px-2 sm:px-6 py-2 min-h-[44px]">
                <Search className="h-5 w-5" />
                <span className="truncate">Browse Assets</span>
              </TabsTrigger>
              <TabsTrigger value="generate" className="flex-1 min-w-0 flex items-center justify-center gap-2 text-base sm:text-lg font-semibold text-purple-700 px-2 sm:px-6 py-2 min-h-[44px]">
                <CuboidIcon className="h-5 w-5" />
                <span className="truncate">Generate New</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-0">
              <ProductGrid onCustomize={asset => {
                setShowDemo(true)
                setActiveTab("generate")
                setGenerateTab("image")
                setCustomizeAsset(asset)
              }} />
            </TabsContent>

            <TabsContent value="generate" className="mt-0">
              <GenerateAssetSection
                initialTab={generateTab}
                preloadedAsset={customizeAsset}
                onTabChange={setGenerateTab}
                onClearCustomize={() => setCustomizeAsset(null)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <div className="w-full flex flex-col items-center mb-2">
        <span className="text-xs text-gray-500 text-center">Contributors: Callie Cheong (@calliecg), Lester Sim (@lestesim), Jennifer Lin (@awsjlin), Bryan Chen (@bryancwh), Yong Xuan (@yxchua)</span>
      </div>
      <Footer />
      <CustomizeModal />
      <GenerateModal />
    </div>
  )
}
