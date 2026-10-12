export type Modalidade = { nome: string; imagem: string; href: string }
export type Esporte = { slug: string; nome: string; imagem: string; modalidades: Modalidade[] }

// Fonte única de esportes e modalidades. Só entra aqui o que tem página real;
// para incluir um esporte, adicione um item com as modalidades dele.
export const esportes: Esporte[] = [
    {
        slug: "ciclismo",
        nome: "Ciclismo",
        imagem: "/images/mod-mountain.png",
        modalidades: [
            { nome: "Downhill", imagem: "/images/mod-downhill.png", href: "/modalidades/downhill" },
            { nome: "BMX", imagem: "/images/mod-bmx.png", href: "/modalidades/bmx" },
            { nome: "Mountain Bike", imagem: "/images/mod-mountain.png", href: "/modalidades/mountain" },
            { nome: "Speed", imagem: "/images/mod-speed.png", href: "/modalidades/speed" },
            { nome: "Urbana", imagem: "/images/mod-urbana.png", href: "/modalidades/urbana" },
            { nome: "Outros", imagem: "/images/mod-outros.png", href: "/modalidades/outros" },
        ],
    },
]
