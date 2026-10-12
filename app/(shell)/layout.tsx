import { AppShell } from "@/components/layout/app-shell"

/** Páginas sem cabeçalho próprio ganham o Header (com o logo) e a BottomNav padrão. */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
    return <AppShell>{children}</AppShell>
}
