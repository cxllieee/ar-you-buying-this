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

export default function Home() {
  const [activeTab, setActiveTab] = useState("browse")

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

      {/* These modals will be controlled via client components */}
      <CustomizeModal />
      <GenerateModal />
    </div>
  )
}
