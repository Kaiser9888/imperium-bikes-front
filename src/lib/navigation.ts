/** Rotas filhas (/torneios/123) contam como a seção ativa; "/" só casa com a própria home. */
export function isRouteActive(pathname: string | null | undefined, href: string): boolean {
    if (!pathname) return false
    if (href === "/") return pathname === "/"
    return pathname === href || pathname.startsWith(`${href}/`)
}
