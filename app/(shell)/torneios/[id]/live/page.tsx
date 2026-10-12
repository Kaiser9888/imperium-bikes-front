import Link from "next/link"

export default async function TournamentLivePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-4 text-center"><p className="text-xs font-semibold uppercase tracking-widest text-primary">Transmissão do torneio</p><h1 className="mt-3 font-heading text-3xl font-bold">Player indisponível</h1><p className="mt-2 text-sm text-muted-foreground">A transmissão ao vivo do torneio {id} ainda não está conectada a um serviço de vídeo.</p><Link href={`/torneios/${encodeURIComponent(id)}`} className="mt-6 rounded-lg border border-border px-5 py-2.5 text-sm font-medium">Voltar ao torneio</Link></main>
}
