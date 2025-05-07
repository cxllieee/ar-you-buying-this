"use client"

import { useEffect, useRef } from "react"

interface ModelViewerProps {
  src: string
  iosSrc: string
  poster: string
  alt: string
}

export function ModelViewer({ src, iosSrc, poster, alt }: ModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Create model-viewer element
    const modelViewer = document.createElement("model-viewer")
    modelViewer.setAttribute("src", src)
    modelViewer.setAttribute("ios-src", iosSrc)
    modelViewer.setAttribute("poster", poster)
    modelViewer.setAttribute("alt", alt)
    modelViewer.setAttribute("shadow-intensity", "1")
    modelViewer.setAttribute("camera-controls", "")
    modelViewer.setAttribute("auto-rotate", "")
    modelViewer.setAttribute("ar", "")
    modelViewer.style.width = "100%"
    modelViewer.style.height = "100%"
    modelViewer.style.backgroundColor = "#f1f5f9" // Add a light background color

    // Clear container and append model-viewer
    containerRef.current.innerHTML = ""
    containerRef.current.appendChild(modelViewer)

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = ""
      }
    }
  }, [src, iosSrc, poster, alt])

  return <div ref={containerRef} className="w-full h-full" />
}
