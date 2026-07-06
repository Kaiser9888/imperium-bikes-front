// hooks/publish/usePublishForm.ts
"use client"

import { useState, useCallback, useEffect } from 'react'
import { ProductFormData, ProductCondition, ShippingType, ProductImage } from '@/types/publish/product'

const STORAGE_KEY = 'imperium_publish_draft'

const initialFormData: ProductFormData = {
    categoryId: '',
    subcategoryId: '',
    title: '',
    brand: '',
    model: '',
    description: '',
    condition: '',
    stock: 1,
    images: [],
    price: 0,
    negotiable: false,
    shippingType: '',
    city: '',
    state: '',
    hasSecurePayment: false,
    featured: false,
}

export function usePublishForm() {
    const [step, setStep] = useState(0)
    const [formData, setFormData] = useState<ProductFormData>(initialFormData)
    const [isDirty, setIsDirty] = useState(false)
    const [lastSaved, setLastSaved] = useState<Date | null>(null)
    const [isSaving, setIsSaving] = useState(false)

    // Carregar rascunho do localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                setFormData(prev => ({ ...prev, ...parsed }))
            } catch {}
        }
    }, [])

    // Salvar rascunho no localStorage quando houver mudanças
    useEffect(() => {
        if (isDirty) {
            const timer = setTimeout(() => {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(formData))
                setLastSaved(new Date())
                setIsDirty(false)
                setIsSaving(false)
            }, 2000)
            return () => clearTimeout(timer)
        }
    }, [formData, isDirty])

    const updateField = useCallback(<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setIsDirty(true)
        setIsSaving(true)
    }, [])

    const updateMultipleFields = useCallback((fields: Partial<ProductFormData>) => {
        setFormData(prev => ({ ...prev, ...fields }))
        setIsDirty(true)
        setIsSaving(true)
    }, [])

    const addImage = useCallback((image: ProductImage) => {
        setFormData(prev => ({
            ...prev,
            images: [...prev.images, image].map((img, i) => ({ ...img, displayOrder: i }))
        }))
        setIsDirty(true)
    }, [])

    const removeImage = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index).map((img, i) => ({ ...img, displayOrder: i }))
        }))
        setIsDirty(true)
    }, [])

    const setMainImage = useCallback((index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.map((img, i) => ({ ...img, isMain: i === index }))
        }))
        setIsDirty(true)
    }, [])

    const reorderImages = useCallback((fromIndex: number, toIndex: number) => {
        setFormData(prev => {
            const newImages = [...prev.images]
            const [removed] = newImages.splice(fromIndex, 1)
            newImages.splice(toIndex, 0, removed)
            return { ...prev, images: newImages.map((img, i) => ({ ...img, displayOrder: i })) }
        })
        setIsDirty(true)
    }, [])

    const clearDraft = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY)
        setFormData(initialFormData)
        setStep(0)
        setIsDirty(false)
    }, [])

    const nextStep = useCallback(() => {
        setStep(prev => Math.min(prev + 1, 4))
    }, [])

    const prevStep = useCallback(() => {
        setStep(prev => Math.max(prev - 1, 0))
    }, [])

    const goToStep = useCallback((s: number) => {
        setStep(s)
    }, [])

    return {
        step,
        formData,
        isDirty,
        lastSaved,
        isSaving,
        updateField,
        updateMultipleFields,
        addImage,
        removeImage,
        setMainImage,
        reorderImages,
        clearDraft,
        nextStep,
        prevStep,
        goToStep,
        totalSteps: 5,
    }
}