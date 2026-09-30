"use client"

import { useAuth } from "@clerk/nextjs"
import { useEffect, useState } from "react"
import { API_BASE_URL } from "@/lib/api-config"

type ProductImageProps = {
  src?: string | null
  alt: string
  className?: string
  fallback?: string
}

function resolveImageUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src
  if (src.startsWith("/api/files/")) return `${API_BASE_URL}${src}`
  return src
}

export function ProductImage({ src, alt, className, fallback = "/placeholder.svg" }: ProductImageProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const [protectedImage, setProtectedImage] = useState<{ source: string; url: string } | null>(null)

  useEffect(() => {
    if (!src) return

    const source = src
    const url = resolveImageUrl(source)
    const apiOrigin = new URL(API_BASE_URL).origin
    const isProtectedApiImage = new URL(url, window.location.origin).origin === apiOrigin &&
      new URL(url, window.location.origin).pathname.startsWith("/api/files/images/")

    if (!isProtectedApiImage) {
      return
    }

    if (!isLoaded) return
    if (!isSignedIn) {
      return
    }

    const controller = new AbortController()
    let objectUrl: string | null = null

    async function loadProtectedImage() {
      try {
        const token = await getToken()
        if (!token) throw new Error("Sessão não autenticada")

        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
          cache: "no-store",
        })
        if (!response.ok) throw new Error(`Imagem indisponível (${response.status})`)

        objectUrl = URL.createObjectURL(await response.blob())
        if (!controller.signal.aborted) setProtectedImage({ source, url: objectUrl })
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Não foi possível carregar a imagem do produto:", error)
          setProtectedImage({ source, url: fallback })
        }
      }
    }

    void loadProtectedImage()
    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fallback, getToken, isLoaded, isSignedIn, src])

  const url = src ? resolveImageUrl(src) : fallback
  const parsedUrl = src ? new URL(url, typeof window === "undefined" ? API_BASE_URL : window.location.origin) : null
  const isProtectedApiImage = parsedUrl?.origin === new URL(API_BASE_URL).origin && parsedUrl.pathname.startsWith("/api/files/images/")
  const displayUrl = isProtectedApiImage
    ? protectedImage && protectedImage.source === src ? protectedImage.url : fallback
    : url

  return <img src={displayUrl} alt={alt} className={className} />
}
