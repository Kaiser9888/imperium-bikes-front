"use client"

import { useState, useCallback, useEffect } from "react"

// ============================================================
// TIPOS
// ============================================================

export interface ImageItem {
    id: string
    file: File
    preview: string
    isMain: boolean
}

export interface PublishFormData {
    // Bloco Fixo
    title: string
    categoryId: string
    subcategoryId: string  // JSON string
    price: string
    description: string
    images: ImageItem[]

    // Condicionais
    condition?: "new" | "used"
    stock?: string
    frameSize?: string
    wheelSize?: string
    tireWidth?: string
    size?: string
    estimatedTime?: string
}

const STORAGE_KEY = "publish_draft"

const DEFAULT_FORM_DATA: PublishFormData = {
    title: "",
    categoryId: "",
    subcategoryId: "",
    price: "",
    description: "",
    images: [],
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function usePublishForm() {
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<PublishFormData>(() => {
        if (typeof window === "undefined") return DEFAULT_FORM_DATA
        try {
            const saved = localStorage.getItem(STORAGE_KEY)
            return saved ? { ...DEFAULT_FORM_DATA, ...JSON.parse(saved) } : DEFAULT_FORM_DATA
        } catch {
            return DEFAULT_FORM_DATA
        }
    })
    const [isSaving, setIsSaving] = useState(false)
    const [lastSaved, setLastSaved] = useState<string | null>(null)

    const totalSteps = 5

    // Salvar rascunho no localStorage
    const saveDraft = useCallback(() => {
        setIsSaving(true)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
        setLastSaved(new Date().toLocaleTimeString("pt-BR"))
        setTimeout(() => setIsSaving(false), 500)
    }, [formData])

    // Auto-save a cada 30s
    useEffect(() => {
        const timer = setInterval(saveDraft, 30000)
        return () => clearInterval(timer)
    }, [saveDraft])

    const updateField = useCallback(<K extends keyof PublishFormData>(
      field: K,
      value: PublishFormData[K]
    ) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const updateMultipleFields = useCallback((fields: Partial<PublishFormData>) => {
        setFormData(prev => ({ ...prev, ...fields }))
    }, [])

    const addImage = useCallback((file: File) => {
        const newImage: ImageItem = {
            id: `img-${Date.now()}`,
            file,
            preview: URL.createObjectURL(file),
            isMain: false,
        }
        setFormData(prev => ({
            ...prev,
            images: prev.images.length === 0
              ? [{ ...newImage, isMain: true }]
              : [...prev.images, newImage]
        }))
    }, [])

    const removeImage = useCallback((id: string) => {
        setFormData(prev => {
            const filtered = prev.images.filter(img => img.id !== id)
            if (filtered.length > 0 && !filtered.some(img => img.isMain)) {
                filtered[0].isMain = true
            }
            return { ...prev, images: filtered }
        })
    }, [])

    const setMainImage = useCallback((id: string) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map(img => ({
                ...img,
                isMain: img.id === id,
            }))
        }))
    }, [])

    const reorderImages = useCallback((images: ImageItem[]) => {
        setFormData(prev => ({ ...prev, images }))
    }, [])

    const nextStep = useCallback(() => {
        setStep(prev => Math.min(prev + 1, totalSteps - 1))
    }, [totalSteps])

    const prevStep = useCallback(() => {
        setStep(prev => Math.max(prev - 1, 0))
    }, [])

    const goToStep = useCallback((stepIndex: number) => {
        setStep(Math.max(0, Math.min(stepIndex, totalSteps - 1)))
    }, [totalSteps])

    const clearDraft = useCallback(() => {
        if (confirm("Tem certeza que deseja limpar todo o rascunho?")) {
            setFormData(DEFAULT_FORM_DATA)
            setStep(0)
            localStorage.removeItem(STORAGE_KEY)
        }
    }, [])

    // Determinar campos condicionais
    const getConditionalFields = useCallback(() => {
        let parsed: { categoryId?: string; modalities?: string[]; attributes?: string[] } = {}
        try {
            parsed = JSON.parse(formData.subcategoryId || "{}")
        } catch {}

        const categoryId = parsed.categoryId || ""
        const hasModalities = (parsed.modalities || []).length > 0
        const modalityIds = parsed.modalities || []
        const attributeIds = parsed.attributes || []

        const fields = {
            showCondition: false,
            showStock: false,
            showFrameSize: false,
            showWheelSize: false,
            showTireWidth: false,
            showSize: false,
            showEstimatedTime: false,
        }

        // Serviços
        if (categoryId === "ferramentas") {
            fields.showEstimatedTime = true
            return fields
        }

        // Bikes, Quadros, Peças: têm condição e estoque
        if (["bicicletas", "quadros", "garfos-suspensoes", "transmissao", "freios", "rodas-pneus", "cockpit", "pedais"].includes(categoryId)) {
            fields.showCondition = true
            fields.showStock = true
        }

        // Tamanho do Quadro
        if (["bicicletas", "quadros"].includes(categoryId)) {
            fields.showFrameSize = true
        }

        // Tamanho do Aro
        if (["bicicletas", "quadros", "rodas-pneus"].includes(categoryId) ||
          attributeIds.some(a => a.includes("aro"))) {
            fields.showWheelSize = true
        }

        // Vestuário: tamanho P/M/G
        if (categoryId === "vestuario" || categoryId === "equipamentos") {
            fields.showSize = true
        }

        return fields
    }, [formData.subcategoryId])

    return {
        step,
        formData,
        totalSteps,
        isSaving,
        lastSaved,
        conditionalFields: getConditionalFields(),
        updateField,
        updateMultipleFields,
        addImage,
        removeImage,
        setMainImage,
        reorderImages,
        nextStep,
        prevStep,
        goToStep,
        clearDraft,
        saveDraft,
    }
}