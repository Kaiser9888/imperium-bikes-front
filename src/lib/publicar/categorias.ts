// Config central das macro-categorias do fluxo de publicação.
// Adicionar uma categoria nova = adicionar uma entrada aqui, sem criar página nova.

export type CampoTipo = "text" | "textarea" | "select" | "number"

export interface OpcaoCampo {
  value: string
  label: string
}

export interface CampoCaracteristica {
  id: string
  label: string
  tipo: CampoTipo
  placeholder?: string
  opcoes?: OpcaoCampo[]
  obrigatorio?: boolean
}

export interface CategoriaConfig {
  label: string
  labelPlural: string
  campos: CampoCaracteristica[]
}

export const CATEGORIAS: Record<string, CategoriaConfig> = {
  bikes: {
    label: "Bicicleta",
    labelPlural: "Bicicletas",
    campos: [
      {
        id: "tipo",
        label: "Tipo",
        tipo: "select",
        obrigatorio: true,
        opcoes: [
          { value: "mountain_bike", label: "Mountain bike" },
          { value: "speed", label: "Speed" },
          { value: "urbana", label: "Urbana" },
          { value: "infantil", label: "Infantil" },
        ],
      },
      {
        id: "aro",
        label: "Aro",
        tipo: "select",
        obrigatorio: true,
        opcoes: [
          { value: "20", label: "Aro 20" },
          { value: "26", label: "Aro 26" },
          { value: "27.5", label: "Aro 27,5" },
          { value: "29", label: "Aro 29" },
        ],
      },
      { id: "marca", label: "Marca", tipo: "text", placeholder: "Ex.: Caloi, Specialized, Trek", obrigatorio: true },
      {
        id: "material_quadro",
        label: "Material do quadro",
        tipo: "select",
        opcoes: [
          { value: "aluminio", label: "Alumínio" },
          { value: "carbono", label: "Carbono" },
          { value: "aco", label: "Aço" },
        ],
      },
    ],
  },
  pecas: {
    label: "Peça",
    labelPlural: "Peças",
    campos: [
      {
        id: "categoria_peca",
        label: "Categoria da peça",
        tipo: "select",
        obrigatorio: true,
        opcoes: [
          { value: "transmissao", label: "Transmissão" },
          { value: "freios", label: "Freios" },
          { value: "rodas", label: "Rodas e pneus" },
          { value: "suspensao", label: "Suspensão" },
          { value: "outros", label: "Outros" },
        ],
      },
      { id: "marca", label: "Marca", tipo: "text", placeholder: "Ex.: Shimano, SRAM", obrigatorio: true },
      { id: "compatibilidade", label: "Compatibilidade", tipo: "text", placeholder: "Ex.: Aro 29, quadros MTB" },
    ],
  },
  consumiveis: {
    label: "Consumível",
    labelPlural: "Consumíveis",
    campos: [
      {
        id: "tipo_consumivel",
        label: "Tipo",
        tipo: "select",
        obrigatorio: true,
        opcoes: [
          { value: "nutricao", label: "Nutrição esportiva" },
          { value: "lubrificante", label: "Lubrificante e limpeza" },
          { value: "camara_pneu", label: "Câmara de ar" },
        ],
      },
      { id: "validade", label: "Validade", tipo: "text", placeholder: "Ex.: 12/2027" },
      { id: "quantidade", label: "Quantidade em estoque", tipo: "number", obrigatorio: true },
    ],
  },
  servicos: {
    label: "Serviço",
    labelPlural: "Serviços",
    campos: [
      {
        id: "tipo_servico",
        label: "Tipo de serviço",
        tipo: "select",
        obrigatorio: true,
        opcoes: [
          { value: "manutencao", label: "Manutenção e reparo" },
          { value: "montagem", label: "Montagem" },
          { value: "consultoria", label: "Consultoria" },
        ],
      },
      {
        id: "local_atendimento",
        label: "Local de atendimento",
        tipo: "select",
        obrigatorio: true,
        opcoes: [
          { value: "presencial", label: "Presencial" },
          { value: "remoto", label: "Remoto" },
          { value: "ambos", label: "Ambos" },
        ],
      },
      { id: "duracao_estimada", label: "Duração estimada", tipo: "text", placeholder: "Ex.: 2 horas" },
    ],
  },
  produtos: {
    label: "Produto",
    labelPlural: "Produtos",
    campos: [
      { id: "marca", label: "Marca", tipo: "text", obrigatorio: true },
      { id: "modelo", label: "Modelo", tipo: "text" },
    ],
  },
}

export function getCategoriaConfig(categoria: string): CategoriaConfig | undefined {
  return CATEGORIAS[categoria]
}

export function isCategoriaValida(categoria: string): boolean {
  return Boolean(CATEGORIAS[categoria])
}