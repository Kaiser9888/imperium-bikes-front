export interface CategoryGroup {
    id: string;
    label: string;
    options: { id: string; label: string }[];
}

/** Facilmente expansível: basta adicionar itens aqui. */
export const CATEGORY_GROUPS: CategoryGroup[] = [
    {
        id: "feed",
        label: "Feed",
        options: [
            { id: "todos", label: "Todos" },
            { id: "recomendados", label: "Recomendados" },
            { id: "seguindo", label: "Seguindo" },
        ],
    },
    {
        id: "modalidades",
        label: "Modalidades",
        options: [
            { id: "mtb", label: "MTB" },
            { id: "speed", label: "Speed" },
            { id: "gravel", label: "Gravel" },
            { id: "bmx", label: "BMX" },
            { id: "eletrica", label: "Elétrica" },
            { id: "downhill", label: "Downhill" },
            { id: "urban", label: "Urban" },
        ],
    },
    {
        id: "ordem",
        label: "Ordenar",
        options: [
            { id: "recentes", label: "Mais recentes" },
            { id: "vistos", label: "Mais vistos" },
        ],
    },
];

export const DEFAULT_CATEGORY = "todos";
