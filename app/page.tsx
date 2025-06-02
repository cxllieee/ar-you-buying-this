"use client"

import { useState, useEffect } from "react"
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
import FeedbackCard from "@/components/FeedbackCard"
import { ModelViewer } from "@/components/model-viewer"

const Lottie = dynamic(() => import("lottie-react"), { ssr: false })

type RecentAsset = {
  modelId: string;
  commandId: string;
  timestamp_added: string;
  glbPresignedUrl?: string;
  usdzPresignedUrl?: string;
};

export default function Home() {
  const [showDemo, setShowDemo] = useState(false)
  const [activeTab, setActiveTab] = useState("browse")
  const [generateTab, setGenerateTab] = useState("text")
  const [customizeAsset, setCustomizeAsset] = useState(null)
  const [recentAssets, setRecentAssets] = useState<RecentAsset[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "recent") {
      setRecentLoading(true);
      fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/get-latest-generated', { method: 'POST' })
        .then(res => res.json())
        .then(data => {
          console.log("get-latest-generated data:", data);
          let items = [];
          if (Array.isArray(data.body)) {
            items = data.body;
          } else if (typeof data.body === 'string') {
            items = JSON.parse(data.body);
          } else if (Array.isArray(data)) {
            items = data;
          } else {
            items = [];
          }
          console.log("Parsed items:", items);
          // Batch call get-recent-presigned with all asset S3 URIs
          return fetch('https://litce2s8pg.execute-api.us-west-2.amazonaws.com/prod/get-recent-presigned', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              assets: Array.isArray(items) ? items.map((item) => ({
                modelId: item.modelId,
                commandId: item.commandId,
                timestamp_added: item.timestamp_added,
                glb_s3_uri: item.glb_s3_uri,
                usdz_s3_uri: item.usdz_s3_uri,
              })) : [],
            }),
          })
            .then(res => res.json())
            .then(data => {
              console.log("get-recent-presigned data:", data);
              let assets = data;
              if (typeof data.body === 'string') {
                assets = JSON.parse(data.body);
              } else if (Array.isArray(data.body)) {
                assets = data.body;
              } else if (Array.isArray(data)) {
                assets = data;
              } else {
                assets = [];
              }
              return assets;
            });
        })
        .then(setRecentAssets)
        .finally(() => setRecentLoading(false));
    }
  }, [activeTab]);

  if (!showDemo) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl w-full flex flex-col items-center gap-6">
          <div className="w-32 h-32 rounded-full shadow-xl bg-white flex items-center justify-center mb-1 animate-fade-in">
            <Lottie animationData={animationData} loop={true} style={{ width: '110px', height: '110px' }} />
          </div>
          <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x">AR You Buying This?</h1>
          <h2 className="text-xl font-semibold text-center text-blue-700 animate-fade-in">Transforming Retail with Generative 3D & AR</h2>
          <button
            className="mt-4 px-8 py-3 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white rounded-lg shadow-xl hover:scale-105 hover:shadow-2xl text-lg font-semibold transition-all duration-200 animate-fade-in"
            onClick={() => setShowDemo(true)}
          >
            Try Demo
          </button>
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
            <TabsList
              className="
                flex w-full mb-4 sm:mb-6
                bg-gradient-to-r from-purple-100 via-blue-100 to-pink-100
                rounded-xl shadow
                overflow-x-auto
                gap-2 px-2 py-1
                sm:overflow-x-visible sm:gap-4
              "
            >
              <TabsTrigger
                value="browse"
                className="
                  flex-shrink-0
                  min-w-[120px] max-w-[180px]
                  flex items-center justify-center gap-2
                  text-xs sm:text-lg font-semibold
                  text-blue-700 px-3 py-2 rounded-full
                  transition-all duration-150
                  data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-purple-700
                  break-words text-center leading-tight
                  sm:min-w-0 sm:max-w-none sm:whitespace-nowrap
                "
              >
                <Search className="h-5 w-5" />
                <span>Browse Assets</span>
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="
                  flex-shrink-0
                  min-w-[140px] max-w-[200px]
                  flex items-center justify-center gap-2
                  text-xs sm:text-lg font-semibold
                  text-blue-700 px-3 py-2 rounded-full
                  transition-all duration-150
                  data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-purple-700
                  break-words text-center leading-tight
                  sm:min-w-0 sm:max-w-none sm:whitespace-nowrap
                "
              >
                <span>Generated Assets</span>
              </TabsTrigger>
              <TabsTrigger
                value="generate"
                className="
                  flex-shrink-0
                  min-w-[120px] max-w-[160px]
                  flex items-center justify-center gap-2
                  text-xs sm:text-lg font-semibold
                  text-purple-700 px-3 py-2 rounded-full
                  transition-all duration-150
                  data-[state=active]:bg-white data-[state=active]:shadow data-[state=active]:text-purple-700
                  break-words text-center leading-tight
                  sm:min-w-0 sm:max-w-none sm:whitespace-nowrap
                "
              >
                <CuboidIcon className="h-5 w-5" />
                <span>Generate New</span>
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

            <TabsContent value="recent" className="mt-0">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold tracking-tight">Recently Generated Assets</h2>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {recentAssets.length} asset{recentAssets.length !== 1 ? "s" : ""} found
                    </span>
                  </div>
                </div>
                {recentLoading ? (
                  <div className="flex items-center justify-center h-[400px]">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-4 text-muted-foreground">Loading recently generated assets...</p>
                    </div>
                  </div>
                ) : Array.isArray(recentAssets) && recentAssets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[400px] text-center">
                    <h3 className="text-xl font-semibold">No recently generated assets found.</h3>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.isArray(recentAssets) && recentAssets.map((asset, idx) => (
                      <div key={asset.commandId || idx} className="border border-gray-200 rounded-lg p-4 bg-white shadow flex flex-col items-center">
                        <div className="w-full h-48 mb-2 flex items-center justify-center bg-slate-100 rounded">
                          {asset.glbPresignedUrl ? (
                            <ModelViewer
                              src={asset.glbPresignedUrl}
                              iosSrc={asset.usdzPresignedUrl}
                              alt={asset.modelId}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Preview</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <div className="w-full flex flex-col items-center mb-2">
        <span className="text-xs text-gray-500 text-center">Contributors: Callie Cheong (@calliecg), Lester Sim (@lestesim), Jennifer Lin (@awsjlin), Bryan Chen (@bryancwh), Yong Xuan (@yxchua)</span>
      </div>
      <Footer />
      <FeedbackCard />
      <CustomizeModal />
      <GenerateModal />
    </div>
  )
}
