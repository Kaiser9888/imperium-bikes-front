import { redirect } from "next/navigation"

export default async function ComprarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  redirect(`/checkout?productId=${encodeURIComponent(id)}`)
}
