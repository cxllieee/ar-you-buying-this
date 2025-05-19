"use client"

import { useEffect, useRef } from "react"

interface ModelViewerProps {
  src: string
  iosSrc: string
  poster?: string
  alt: string
  modelType?: string
}

export function ModelViewer({ src, iosSrc, poster, alt, modelType = 'default' }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const stableContainer = containerRef.current;
    if (!stableContainer) return

    // Create model-viewer element
    const modelViewer = document.createElement("model-viewer")
    modelViewer.setAttribute("src", src)
    modelViewer.setAttribute("ios-src", iosSrc)
    if (poster) {
      modelViewer.setAttribute("poster", poster)
    }
    modelViewer.setAttribute("alt", alt)
    modelViewer.setAttribute("shadow-intensity", "1")
    modelViewer.setAttribute("camera-controls", "")
    modelViewer.setAttribute("auto-rotate", "")
    modelViewer.setAttribute("ar", "")
    modelViewer.setAttribute("ar-modes", "webxr scene-viewer quick-look")
    modelViewer.setAttribute("ar-scale", "auto")
    modelViewer.setAttribute("data-product-id", src.split("/").pop()?.split(".")[0] || "")
    modelViewer.style.width = "100%"
    modelViewer.style.height = "100%"
    modelViewer.style.backgroundColor = "#f1f5f9" // Add a light background color

    // Conditionally set additional attributes based on model type
    if (modelType === 'advanced') {
      modelViewer.setAttribute("environment-image", "neutral")
      modelViewer.setAttribute("exposure", "1")
    }

    // Clear container and append model-viewer
    stableContainer.innerHTML = ""
    stableContainer.appendChild(modelViewer)

    return () => {
      if (stableContainer) {
        stableContainer.innerHTML = ""
      }
    }
  }, [src, iosSrc, poster, alt, modelType])

  return <div ref={containerRef} className="w-full h-full" />
}
