/* eslint-disable @typescript-eslint/no-explicit-any */
// app/publicar/page.tsx
"use client"

import { useUser } from "@clerk/nextjs"
import { usePublishForm } from "@/hooks/publish/usePublishForm"
import { PublishHeader } from "@/components/publish/PublishHeader"
import { PublishStepper } from "@/components/publish/PublishStepper"
import { CategoryStep } from "@/components/publish/CategoryStep"
import { DetailsStep } from "@/components/publish/DetailsStep"
import { PhotosStep } from "@/components/publish/PhotosStep"
import { PricingStep } from "@/components/publish/PricingStep"
import { ReviewStep } from "@/components/publish/ReviewStep"
import { PublishNavigation } from "@/components/publish/PublishNavigation"
import { SaveDraftIndicator } from "@/components/publish/SaveDraftIndicator"
import { ProductImage, ProductFormData } from "@/types/publish/product"

export default function PublicarPage() {
  const { isSignedIn, isLoaded } = useUser()
  const {
    step, formData, totalSteps, isSaving, lastSaved, conditionalFields,
    updateMultipleFields,
    addImage, removeImage, setMainImage, reorderImages,
    nextStep, prevStep, goToStep, clearDraft
  } = usePublishForm()

  if (!isLoaded) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  )

  // Converte ImageItem[] para ProductImage[]
  const productImages: ProductImage[] = formData.images.map((img, index) => ({
    url: img.preview,
    isMain: img.isMain,
    displayOrder: index,
    file: img.file,
  }))

  // Handlers adaptados para PhotosStep
  const handleAddImage = (image: ProductImage) => {
    if (image.file) addImage(image.file)
  }
  const handleRemoveImage = (index: number) => {
    const img = formData.images[index]
    if (img) removeImage(img.id)
  }
  const handleSetMainImage = (index: number) => {
    const img = formData.images[index]
    if (img) setMainImage(img.id)
  }
  const handleReorderImages = (from: number, to: number) => {
    const newImages = [...formData.images]
    const [moved] = newImages.splice(from, 1)
    newImages.splice(to, 0, moved)
    reorderImages(newImages)
  }

  // Converte PublishFormData para ProductFormData
  const productFormData: ProductFormData = {
    title: formData.title,
    brand: "",
    model: "",
    description: formData.description,
    price: parseFloat(formData.price) || 0,
    condition: formData.condition === "new" ? "NEW" : formData.condition === "used" ? "USED" : "NEW",
    categoryId: formData.categoryId,
    subcategoryId: formData.subcategoryId,
    stock: parseInt(formData.stock || "1"),
    images: productImages,
    negotiable: false,
    shippingType: "",
    city: "",
    state: "",
    hasSecurePayment: false,
    featured: false,
  }

  return (
    <div className="min-h-screen bg-background">
      <PublishHeader onClear={clearDraft} />
      <PublishStepper currentStep={step} totalSteps={totalSteps} onStepClick={goToStep} />
      <SaveDraftIndicator isSaving={isSaving} lastSaved={lastSaved} />

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24">
        {step === 0 && (
          <CategoryStep
            categoryId={formData.categoryId}
            subcategoryId={formData.subcategoryId}
            onCategoryChange={(categoryId, subcategoryId) =>
              updateMultipleFields({ categoryId, subcategoryId })
            }
          />
        )}
        {step === 1 && (
          <DetailsStep
            title={formData.title}
            description={formData.description}
            condition={formData.condition}
            stock={formData.stock}
            frameSize={formData.frameSize}
            wheelSize={formData.wheelSize}
            size={formData.size}
            estimatedTime={formData.estimatedTime}
            conditionalFields={conditionalFields}
            onChange={updateMultipleFields}
          />
        )}
        {step === 2 && (
          <PhotosStep
            images={productImages}
            onAdd={handleAddImage}
            onRemove={handleRemoveImage}
            onSetMain={handleSetMainImage}
            onReorder={handleReorderImages}
          />
        )}
        {step === 3 && (
          <PricingStep
            price={parseFloat(formData.price) || 0}
            negotiable={false}
            shippingType=""
            city=""
            state=""
            hasSecurePayment={false}
            featured={false}
            onChange={updateMultipleFields}
          />
        )}
        {step === 4 && (
          <ReviewStep
            formData={productFormData}
            onEdit={goToStep}
          />
        )}
      </main>

      <PublishNavigation
        step={step}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
      />
    </div>
  )
}