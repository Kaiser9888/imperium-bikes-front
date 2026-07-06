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

export default function PublicarPage() {
    const { isSignedIn, isLoaded } = useUser()
    const {
        step, formData, totalSteps, isSaving, lastSaved,
        updateField, updateMultipleFields,
        addImage, removeImage, setMainImage, reorderImages,
        nextStep, prevStep, goToStep, clearDraft
    } = usePublishForm()

    if (!isLoaded) return <div className="min-h-screen bg-background flex items-center justify-center"><p>Carregando...</p></div>

    return (
        <div className="min-h-screen bg-background">
            <PublishHeader onClear={clearDraft} />
            <PublishStepper currentStep={step} totalSteps={totalSteps} onStepClick={goToStep} />
            <SaveDraftIndicator isSaving={isSaving} lastSaved={lastSaved} />

            <main className="mx-auto max-w-2xl px-4 py-6">
                {step === 0 && (
                    <CategoryStep
                        categoryId={formData.categoryId}
                        subcategoryId={formData.subcategoryId}
                        onCategoryChange={(categoryId, subcategoryId) => updateMultipleFields({ categoryId, subcategoryId })}
                    />
                )}
                {step === 1 && (
                    <DetailsStep
                        title={formData.title}
                        brand={formData.brand}
                        model={formData.model}
                        description={formData.description}
                        condition={formData.condition}
                        stock={formData.stock}
                        onChange={updateMultipleFields}
                    />
                )}
                {step === 2 && (
                    <PhotosStep
                        images={formData.images}
                        onAdd={addImage}
                        onRemove={removeImage}
                        onSetMain={setMainImage}
                        onReorder={reorderImages}
                    />
                )}
                {step === 3 && (
                    <PricingStep
                        price={formData.price}
                        negotiable={formData.negotiable}
                        shippingType={formData.shippingType}
                        city={formData.city}
                        state={formData.state}
                        hasSecurePayment={formData.hasSecurePayment}
                        featured={formData.featured}
                        onChange={updateMultipleFields}
                    />
                )}
                {step === 4 && (
                    <ReviewStep
                        formData={formData}
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