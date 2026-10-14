/**
 * Reduz a imagem no navegador e devolve um data URL JPEG. O disco do Render
 * é apagado a cada deploy, então artes do painel vão direto para o banco
 * (mesma estratégia das fotos dos anúncios).
 */
export async function compactarImagem(arquivo: File, larguraMax = 1600, bytesMax = 600 * 1024): Promise<string> {
    if (!arquivo.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.")

    const bitmap = await createImageBitmap(arquivo)
    const escala = Math.min(1, larguraMax / bitmap.width)
    const canvas = document.createElement("canvas")
    canvas.width = Math.round(bitmap.width * escala)
    canvas.height = Math.round(bitmap.height * escala)
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()

    for (let qualidade = 0.85; qualidade >= 0.5; qualidade -= 0.07) {
        const dataUrl = canvas.toDataURL("image/jpeg", qualidade)
        // base64 ocupa ~4/3 dos bytes reais
        if (dataUrl.length * 0.75 <= bytesMax) return dataUrl
    }
    throw new Error("A imagem é grande demais mesmo compactada. Tente uma arte mais leve.")
}
