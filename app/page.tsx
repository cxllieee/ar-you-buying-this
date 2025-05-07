import { Header } from "@/components/header"
import { ProductGrid } from "@/components/product-grid"
import { Footer } from "@/components/footer"
import { CustomizeModal } from "@/components/customize-modal"
import { GenerateModal } from "@/components/generate-modal"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <ProductGrid />
      </main>
      <Footer />

      {/* These modals will be controlled via client components */}
      <CustomizeModal />
      <GenerateModal />
    </div>
  )
}
