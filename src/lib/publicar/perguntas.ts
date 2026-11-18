// src/lib/publicar/perguntas.ts
//
// Perguntas da primeira etapa do publicar, por categoria. A tela
// app/publicar/[categoria]/page.tsx é uma só e se monta a partir daqui:
// mudar uma pergunta ou uma opção = mudar este arquivo, nada mais.
//
// REGRA: o `label` (texto) pode mudar à vontade; a `chave` da pergunta e o `id`
// da opção NUNCA mudam. Eles ficam gravados na ficha dos anúncios publicados e
// servem de filtro e de tradução. Para aposentar uma opção, apague-a da lista:
// os anúncios antigos continuam mostrando o texto que foi guardado com eles.
// (taxonomia.ts também lê bikeType, subModality, saleFormat e tipo.)

export type Respostas = Record<string, string>

export type Opcao = {
  id: string
  label: string
  descricao?: string
  /** Cabeçalho do grupo (lista longa vira grupos de cartões menores). */
  grupo?: string
}

export type Pergunta = {
  chave: string
  titulo: string
  /** Nome curto na ficha técnica do anúncio. */
  ficha: string
  opcoes?: Opcao[] | ((r: Respostas) => Opcao[])
  /** Campo de número em vez de cartões (ex.: medida do shock). */
  numero?: { placeholder: string; unidade: string }
  opcional?: boolean
  /** Some (e é apagada) quando a condição não vale. */
  mostrarSe?: (r: Respostas) => boolean
  /** Outras respostas que deixam de valer quando esta muda. */
  limpa?: string[]
  /** Como aparece no resumo (ex.: "Aro 29"). */
  resumo?: (label: string) => string
  aviso?: (r: Respostas) => string | null
}

export type Secao = {
  titulo: string
  /** Texto do cabeçalho enquanto nada foi escolhido. */
  dica: string
  perguntas: Pergunta[]
}

export type CategoriaPublicar = {
  titulo: string
  secoes: Secao[]
  /** Pergunta a modalidade de ciclismo (MTB, Speed...) na etapa de informações. */
  pedeModalidade: boolean
}

const lista = (itens: readonly string[]): Opcao[] => itens.map((item) => ({ id: item, label: item }))

/** Segundo nível: as opções dependem do que foi escolhido em `chavePai`. */
const porPai =
  (chavePai: string, mapa: Record<string, readonly string[]>) =>
  (r: Respostas): Opcao[] =>
    lista(mapa[r[chavePai]] ?? [])

// ------------------------------------------------------------------
// BIKES
// ------------------------------------------------------------------

const SUBMODALIDADES: Record<string, Opcao[]> = {
  urbana: [
    { id: "passe", label: "Passeio / Lazer", descricao: "Uso recreativo e deslocamentos" },
    { id: "cargo", label: "Carga / Utilitária", descricao: "Transporte de cargas e objetos" },
    { id: "bmx", label: "BMX", descricao: "BMX, street e pistas" },
    { id: "dirt-jump", label: "Dirt Jump / Street", descricao: "Saltos e uso urbano" },
    { id: "pumptrack", label: "Pump Track", descricao: "Pistas de pump track" },
  ],
  "mountain-bike": [
    { id: "cross-country", label: "Cross Country (XC)", descricao: "Trilhas e provas de XC" },
    { id: "trail", label: "Trail / All Mountain", descricao: "Uso misto em trilhas" },
    { id: "enduro", label: "Enduro", descricao: "Descidas técnicas e trilhas agressivas" },
    { id: "downhill", label: "Downhill (DH)", descricao: "Descidas e terrenos técnicos" },
  ],
  estrada: [
    { id: "speed-race", label: "Speed / Performance", descricao: "Competição e velocidade" },
    { id: "endurance", label: "Endurance", descricao: "Longas distâncias e conforto" },
    { id: "gravel", label: "Gravel", descricao: "Asfalto, terra e estradas mistas" },
  ],
  eletrica: [
    { id: "passe", label: "Urbana Elétrica", descricao: "Mobilidade urbana com assistência" },
    { id: "trail", label: "E-MTB", descricao: "Mountain bike elétrica" },
  ],
  fixa: [{ id: "nao-se-aplica", label: "Fixa / Pista", descricao: "Single speed e bicicletas de pista" }],
}

// Enduro e DH: suspensão traseira e shock pesam no preço
const descidaPesada = (r: Respostas) => r.subModality === "enduro" || r.subModality === "downhill"

const bikes: CategoriaPublicar = {
  titulo: "Classifique sua bike",
  pedeModalidade: true,
  secoes: [
    {
      titulo: "Tipo de bike",
      dica: "Selecione o tipo",
      perguntas: [
        {
          chave: "bikeType",
          titulo: "Tipo",
          ficha: "Tipo",
          limpa: ["subModality", "rearSuspensionType", "shockStatus", "shockMeasurementMM"],
          opcoes: [
            { id: "urbana", label: "Urbana", descricao: "Para deslocamentos e cidade" },
            { id: "mountain-bike", label: "Mountain bike", descricao: "Trilhas e terrenos irregulares" },
            { id: "estrada", label: "Estrada", descricao: "Asfalto e longas distâncias" },
            { id: "eletrica", label: "Elétrica", descricao: "Com assistência de motor" },
            { id: "fixa", label: "Fixa ou single speed", descricao: "Transmissão simples" },
          ],
        },
        {
          chave: "subModality",
          titulo: "Modalidade",
          ficha: "Modalidade",
          mostrarSe: (r) => Boolean(r.bikeType),
          limpa: ["rearSuspensionType", "shockStatus", "shockMeasurementMM"],
          opcoes: (r) => SUBMODALIDADES[r.bikeType] ?? [],
          aviso: (r) =>
            descidaPesada(r) ? "Nesta modalidade vamos perguntar também da suspensão traseira." : null,
        },
      ],
    },
    {
      titulo: "Formato e material",
      dica: "Bike completa ou quadro, e o material",
      perguntas: [
        {
          chave: "saleFormat",
          titulo: "Anúncio",
          ficha: "Vendido como",
          opcoes: [
            { id: "completa", label: "Bike completa", descricao: "Pronta para pedalar" },
            { id: "quadro", label: "Somente quadro", descricao: "Sem componentes montados" },
          ],
        },
        {
          chave: "material",
          titulo: "Material do quadro",
          ficha: "Material do quadro",
          opcoes: lista(["Alumínio", "Carbono", "Aço", "Titânio"]).map((o) => ({
            ...o,
            id: o.id.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
          })),
        },
      ],
    },
    {
      titulo: "Medidas",
      dica: "Aro e tamanho do quadro",
      perguntas: [
        {
          chave: "wheelSize",
          titulo: "Aro",
          ficha: "Aro",
          resumo: (label) => `Aro ${label}`,
          opcoes: [
            { id: "20", label: "20”", descricao: "BMX / Infantil" },
            { id: "24", label: "24”", descricao: "Dirt / Juvenil" },
            { id: "26", label: "26”", descricao: "Compacto / Clássico" },
            { id: "27-5", label: "27,5”", descricao: "Versátil / Trail" },
            { id: "29", label: "29”", descricao: "Maior alcance / XC" },
            { id: "700c", label: "700c", descricao: "Estrada e urbana" },
          ],
        },
        {
          chave: "frameSize",
          titulo: "Tamanho do quadro",
          ficha: "Tamanho do quadro",
          resumo: (label) => `Tamanho ${label}`,
          opcoes: [
            { id: "pp", label: "PP", descricao: "Extra pequeno" },
            { id: "p", label: "P", descricao: "Pequeno" },
            { id: "m", label: "M", descricao: "Médio" },
            { id: "g", label: "G", descricao: "Grande" },
            { id: "gg", label: "GG", descricao: "Extra grande" },
          ],
        },
        {
          chave: "rearSuspensionType",
          titulo: "Suspensão traseira",
          ficha: "Suspensão",
          mostrarSe: descidaPesada,
          limpa: ["shockStatus", "shockMeasurementMM"],
          opcoes: [
            { id: "rigida", label: "Rígida", descricao: "Sem suspensão" },
            { id: "hardtail", label: "Hardtail", descricao: "Só suspensão dianteira" },
            { id: "full-suspension", label: "Full Suspension", descricao: "Dianteira e traseira" },
          ],
        },
        {
          chave: "shockStatus",
          titulo: "Shock traseiro",
          ficha: "Shock traseiro",
          mostrarSe: (r) => descidaPesada(r) && r.rearSuspensionType === "full-suspension",
          limpa: ["shockMeasurementMM"],
          opcoes: [
            { id: "acompanha-shock", label: "Acompanha o shock", descricao: "Amortecedor traseiro incluso" },
            { id: "sem-shock", label: "Sem shock", descricao: "O comprador precisa comprar um" },
          ],
        },
        {
          chave: "shockMeasurementMM",
          titulo: "Medida do shock",
          ficha: "Medida do shock",
          opcional: true,
          numero: { placeholder: "Ex.: 210", unidade: "mm" },
          mostrarSe: (r) => descidaPesada(r) && r.shockStatus === "acompanha-shock",
        },
      ],
    },
  ],
}

// ------------------------------------------------------------------
// PEÇAS
// ------------------------------------------------------------------

const PECA_GRUPOS: { grupo: string; itens: { id: string; label: string; tipos: string[] }[] }[] = [
  {
    grupo: "Transmissão",
    itens: [
      { id: "transmissao-cambios", label: "Câmbios e Passadores", tipos: ["Câmbio Dianteiro", "Câmbio Traseiro", "Passador Dianteiro", "Passador Traseiro", "Kit Completo"] },
      { id: "transmissao-desgaste", label: "Cassetes, Correntes e Coroas", tipos: ["Cassete", "Corrente", "Coroa", "Kit Relação Completa"] },
      { id: "transmissao-pedivela-central", label: "Pedivelas e Movimentos Centrais", tipos: ["Pedivela", "Movimento Central", "Kit Pedivela + Central"] },
    ],
  },
  {
    grupo: "Freios",
    itens: [
      { id: "freio-dianteiro", label: "Freio Dianteiro", tipos: ["Kit Freio Dianteiro Completo", "Pinça Dianteira", "Manete Esquerda"] },
      { id: "freio-traseiro", label: "Freio Traseiro", tipos: ["Kit Freio Traseiro Completo", "Pinça Traseira", "Manete Direita"] },
      { id: "discos-rotores", label: "Discos, Rotores e Pastilhas", tipos: ["Disco de Freio", "Pastilhas", "Adaptador de Pinça", "Kit Discos + Pastilhas"] },
    ],
  },
  {
    grupo: "Suspensão",
    itens: [
      { id: "suspensao-single-crown", label: "Single Crown", tipos: ["Suspensão 100mm", "Suspensão 120mm", "Suspensão 140mm", "Suspensão 150mm+", "Suspensão 160mm+"] },
      { id: "suspensao-double-crown", label: "Double Crown", tipos: ["Suspensão Double Crown 200mm", "Suspensão Double Crown 180mm"] },
      { id: "shock-traseiro", label: "Shock Traseiro", tipos: ["Shock a Ar", "Shock a Mola", "Shock Eletrônico"] },
    ],
  },
  {
    grupo: "Rodas",
    itens: [
      { id: "rodas-par", label: "Pares de Rodas", tipos: ['Par de Rodas MTB 29"', 'Par de Rodas MTB 27.5"', "Par de Rodas Speed 700c", "Par de Rodas Gravel 650b"] },
      { id: "rodas-avulsas", label: "Rodas Avulsas", tipos: ["Roda Dianteira", "Roda Traseira"] },
      { id: "cubos-avulsos", label: "Cubos", tipos: ["Cubo Dianteiro", "Cubo Traseiro"] },
      { id: "aros-raios", label: "Aros e Raios", tipos: ['Aro MTB 29"', 'Aro MTB 27.5"', "Aro Speed 700c", "Aro Gravel 650b", "Kit Raios e Niples"] },
      { id: "pneus-camaras", label: "Pneus e Câmaras", tipos: ["Pneu MTB", "Pneu Speed", "Pneu Urbano", "Câmara de Ar", "Selante Tubeless"] },
    ],
  },
  {
    grupo: "Cockpit e Direção",
    itens: [{ id: "cockpit", label: "Guidão, Mesa e Direção", tipos: ["Guidão MTB", "Guidão Speed", "Guidão Gravel", "Mesa/Avanço", "Caixa de Direção", "Espaçadores", "Manopla e Fita de Guidão"] }],
  },
  {
    grupo: "Selim e Canote",
    itens: [{ id: "selim-canote", label: "Selim e Canote", tipos: ["Selim", "Canote Rígido", "Canote Retrátil (Dropper)", "Abraçadeira de Quadro"] }],
  },
  {
    grupo: "Pedais",
    itens: [{ id: "pedais", label: "Pedais", tipos: ["Pedal de Encaixe (Clip)", "Pedal Plataforma", "Tacos de Sapatilha"] }],
  },
  {
    grupo: "Cabos e Conduítes",
    itens: [{ id: "cabos-conduites", label: "Cabos, Conduítes e Guias", tipos: ["Cabo de Freio", "Cabo de Marcha", "Conduíte", "Capa de Cabo", "Terminal Protetor"] }],
  },
]

const pecas: CategoriaPublicar = {
  titulo: "Classifique sua peça",
  pedeModalidade: true,
  secoes: [
    {
      titulo: "Categoria da peça",
      dica: "Escolha onde sua peça se encaixa",
      perguntas: [
        {
          chave: "subcategoryId",
          titulo: "Categoria da peça",
          ficha: "Categoria",
          limpa: ["tipo"],
          opcoes: PECA_GRUPOS.flatMap(({ grupo, itens }) => itens.map(({ id, label }) => ({ id, label, grupo }))),
        },
      ],
    },
    {
      titulo: "Tipo específico",
      dica: "Escolha a categoria primeiro",
      perguntas: [
        {
          chave: "tipo",
          titulo: "Tipo específico",
          ficha: "Tipo",
          opcoes: porPai(
            "subcategoryId",
            Object.fromEntries(PECA_GRUPOS.flatMap(({ itens }) => itens.map(({ id, tipos }) => [id, tipos]))),
          ),
        },
      ],
    },
    {
      titulo: "Compatibilidade",
      dica: "Fabricante ou padrão compatível",
      perguntas: [
        {
          chave: "compatibilidade",
          titulo: "Compatível com",
          ficha: "Compatível com",
          opcoes: lista(["Shimano", "SRAM", "Campagnolo", "MicroSHIFT", "Universal", "Não se aplica"]),
        },
      ],
    },
  ],
}

// ------------------------------------------------------------------
// EQUIPAMENTOS E ROUPAS (slug "produtos")
// ------------------------------------------------------------------

const PRODUTO_TIPOS: Record<string, string[]> = {
  capacetes: ["Capacete Aberto", "Capacete Coquinho", "Capacete Full-Face", "Capacete Infantil"],
  vestuario: ["Camisa de Ciclismo", "Bermuda/Bretelle", "Jaqueta Corta-Vento", "Meia", "Manguito/Pernito", "Luva"],
  calcados: ["Sapatilha de Encaixe", "Sapatilha Speed", "Sapatilha MTB", "Tênis de Ciclismo", "Capa de Sapatilha"],
  oculos: ["Óculos de Sol", "Óculos de Proteção", "Óculos Fotocromático", "Óculos com Lente Reserva"],
  eletronicos: ["Ciclocomputador", "GPS", "Sensor de Cadência", "Sensor Cardíaco", "Câmera de Ação", "Suporte de Celular"],
  iluminacao: ["Farol Dianteiro", "Lanterna Traseira", "Sinalizador", "Kit de Iluminação"],
  seguranca: ["Cadeado U-Lock", "Cadeado de Cabo", "Cadeado Dobrável", "Alarme", "Rastreador GPS"],
  hidratacao: ["Caramanhola", "Suporte de Caramanhola", "Mochila de Hidratação", "Reservatório de Água"],
  bolsas: ["Bolsa de Selim", "Bolsa de Quadro", "Bolsa de Guidão", "Alforge", "Bagageiro"],
  ferramentas: ["Multi-ferramenta", "Chave de Corrente", "Chave de Raio", "Bomba de Chão", "Bomba de Mão", "Kit de Reparo"],
  protecao: ["Joelheira", "Cotoveleira", "Colete de Proteção", "Protetor de Coluna", "Coxim"],
}

// Tamanho só faz sentido no que se veste
const VESTE = ["capacetes", "vestuario", "calcados", "protecao"]

const produtos: CategoriaPublicar = {
  titulo: "Classifique seu produto",
  pedeModalidade: false,
  secoes: [
    {
      titulo: "Categoria do produto",
      dica: "Qual o tipo de produto?",
      perguntas: [
        {
          chave: "subcategoryId",
          titulo: "Categoria do produto",
          ficha: "Categoria",
          limpa: ["tipo", "tamanho"],
          opcoes: [
            { id: "capacetes", label: "Capacetes", descricao: "Abertos, coquinho e full-face" },
            { id: "vestuario", label: "Roupas", descricao: "Camisas, bermudas, bretelles, jaquetas" },
            { id: "calcados", label: "Calçados", descricao: "Sapatilhas e tênis de ciclismo" },
            { id: "oculos", label: "Óculos", descricao: "De sol e de proteção" },
            { id: "eletronicos", label: "Eletrônicos", descricao: "GPS, ciclocomputadores, sensores" },
            { id: "iluminacao", label: "Iluminação", descricao: "Faróis, lanternas e sinalizadores" },
            { id: "seguranca", label: "Segurança", descricao: "Cadeados, travas e alarmes" },
            { id: "hidratacao", label: "Caramanholas e mochilas", descricao: "Caramanholas, suportes e mochilas de hidratação" },
            { id: "bolsas", label: "Bolsas e bagageiros", descricao: "Bolsas de selim, quadro e guidão" },
            { id: "ferramentas", label: "Ferramentas", descricao: "Multi-ferramentas, bombas e kits" },
            { id: "protecao", label: "Proteção corporal", descricao: "Joelheiras, cotoveleiras e coletes" },
          ],
        },
      ],
    },
    {
      titulo: "Tipo específico",
      dica: "Escolha a categoria primeiro",
      perguntas: [
        {
          chave: "tipo",
          titulo: "Tipo específico",
          ficha: "Tipo",
          opcoes: porPai("subcategoryId", PRODUTO_TIPOS),
        },
      ],
    },
    {
      titulo: "Tamanho",
      dica: "Tamanho do produto",
      perguntas: [
        {
          chave: "tamanho",
          titulo: "Tamanho",
          ficha: "Tamanho",
          mostrarSe: (r) => VESTE.includes(r.subcategoryId),
          resumo: (label) => (label === "Único" ? "Tamanho único" : `Tamanho ${label}`),
          opcoes: lista(["PP", "P", "M", "G", "GG", "Único"]),
        },
      ],
    },
  ],
}

// ------------------------------------------------------------------
// NUTRIÇÃO E HIDRATAÇÃO (slug "consumiveis")
// ------------------------------------------------------------------

const CONSUMIVEL_TIPOS: Record<string, string[]> = {
  energia: ["Gel de carboidrato", "Goma energética", "Bebida energética", "Carboidrato em pó", "Cafeína esportiva"],
  hidratacao: ["Isotônico", "Bebida eletrolítica", "Repositor de eletrólitos", "Sachê para hidratação", "Tablete de eletrólitos"],
  nutricao: ["Bebida nutricional", "Carboidrato", "Proteína", "Maltodextrina", "Produto para pré-treino"],
  recuperacao: ["Bebida de recuperação", "Proteína para recuperação", "Carboidrato para recuperação", "Eletrólitos", "Produto pós-treino"],
  suplementos: ["Proteína", "Creatina", "Beta-alanina", "Pré-treino", "Aminoácidos"],
  alimentos: ["Barrinha energética", "Barrinha proteica", "Biscoito esportivo", "Doce esportivo", "Alimento desidratado"],
  vitaminas: ["Multivitamínico", "Vitamina", "Minerais", "Magnésio", "Eletrólitos"],
  outros: ["Outro alimento esportivo", "Outro produto nutricional", "Outro consumível"],
}

const consumiveis: CategoriaPublicar = {
  titulo: "Classifique seu produto",
  pedeModalidade: false,
  secoes: [
    {
      titulo: "Para que serve",
      dica: "Energia, hidratação, recuperação...",
      perguntas: [
        {
          chave: "subcategoryId",
          titulo: "Para que serve",
          ficha: "Uso",
          limpa: ["tipo"],
          opcoes: [
            { id: "energia", label: "Energia", descricao: "Durante o exercício" },
            { id: "hidratacao", label: "Hidratação", descricao: "Reposição de líquidos e sais" },
            { id: "nutricao", label: "Nutrição esportiva", descricao: "Alimentação e desempenho" },
            { id: "recuperacao", label: "Recuperação", descricao: "Depois do exercício" },
            { id: "suplementos", label: "Suplementos", descricao: "Proteína, creatina e outros" },
            { id: "alimentos", label: "Alimentos esportivos", descricao: "Barrinhas e lanches" },
            { id: "vitaminas", label: "Vitaminas e minerais", descricao: "Multivitamínicos e sais" },
            { id: "outros", label: "Outros", descricao: "Outro produto de nutrição" },
          ],
        },
      ],
    },
    {
      titulo: "Produto",
      dica: "Escolha para que serve primeiro",
      perguntas: [
        {
          chave: "tipo",
          titulo: "Produto",
          ficha: "Produto",
          opcoes: porPai("subcategoryId", CONSUMIVEL_TIPOS),
        },
      ],
    },
    {
      titulo: "Como é vendido",
      dica: "Unidade, caixa, pote...",
      perguntas: [
        {
          chave: "volume",
          titulo: "Como é vendido",
          ficha: "Vendido por",
          opcoes: lista(["Unidade", "Caixa", "Pacote", "Kit", "Pote", "Sachê"]).map((o) => ({
            ...o,
            id: o.id.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase(),
          })),
        },
      ],
    },
  ],
}

// ------------------------------------------------------------------
// OFICINA E SERVIÇOS
// ------------------------------------------------------------------

const SERVICO_GRUPOS: { grupo: string; itens: { id: string; label: string; tipos: string[] }[] }[] = [
  {
    grupo: "Oficina",
    itens: [
      { id: "revisao-basica", label: "Revisão básica", tipos: ["Regulagem de Freio", "Regulagem de Marcha", "Regulagem Geral", "Ajuste de Cabos"] },
      { id: "revisao-completa", label: "Revisão geral", tipos: ["Revisão Completa", "Revisão Completa + Suspensão", "Revisão Completa + Freios"] },
      { id: "sangria-freio", label: "Sangria de freio", tipos: ["Sangria Freio Dianteiro", "Sangria Freio Traseiro", "Sangria Completa"] },
      { id: "suspensao", label: "Revisão de suspensão", tipos: ["Revisão Suspensão Dianteira", "Revisão Amortecedor Traseiro", "Revisão Completa Suspensão"] },
      { id: "montagem", label: "Montagem de bike", tipos: ["Montagem de Bike na Caixa", "Montagem + Revisão Básica", "Montagem + Revisão Completa"] },
      { id: "rodas", label: "Montagem de rodas", tipos: ["Montagem de Roda", "Alinhamento de Roda", "Raiamento Completo"] },
      { id: "tubeless", label: "Tubeless", tipos: ["Conversão Tubeless", "Instalação Pneu Tubeless", "Reparo Tubeless"] },
      { id: "lavagem", label: "Lavagem e estética", tipos: ["Lavagem Simples", "Lavagem Detalhada", "Vitrificação", "Polimento"] },
      { id: "bike-fit", label: "Bike fit", tipos: ["Bike Fit Completo", "Bike Fit Básico", "Ajuste de Posição"] },
      { id: "leva-traz", label: "Leva e traz", tipos: ["Leva e Traz Ida", "Leva e Traz Ida e Volta"] },
    ],
  },
  {
    grupo: "Treino e aulas",
    itens: [
      { id: "treino", label: "Treino e assessoria", tipos: ["Planilha de Treino", "Assessoria Mensal", "Treino Acompanhado"] },
      { id: "aulas", label: "Aulas", tipos: ["Aula de Pedal (iniciante)", "Aula de Técnica (MTB/DH)", "Aula de Mecânica"] },
      { id: "passeios", label: "Passeios guiados", tipos: ["Pedal Guiado", "Trilha Guiada", "Viagem de Bike"] },
    ],
  },
  {
    grupo: "Aluguel",
    itens: [{ id: "aluguel", label: "Aluguel", tipos: ["Aluguel de Bike", "Aluguel de E-bike", "Aluguel de Equipamento", "Aluguel de Rack/Transbike"] }],
  },
]

const servicos: CategoriaPublicar = {
  titulo: "Descreva seu serviço",
  pedeModalidade: false,
  secoes: [
    {
      titulo: "Tipo de serviço",
      dica: "Qual serviço você oferece?",
      perguntas: [
        {
          chave: "subcategoryId",
          titulo: "Tipo de serviço",
          ficha: "Serviço",
          limpa: ["tipo"],
          opcoes: SERVICO_GRUPOS.flatMap(({ grupo, itens }) => itens.map(({ id, label }) => ({ id, label, grupo }))),
        },
      ],
    },
    {
      titulo: "Serviço específico",
      dica: "Escolha o tipo primeiro",
      perguntas: [
        {
          chave: "tipo",
          titulo: "Serviço específico",
          ficha: "Inclui",
          opcoes: porPai(
            "subcategoryId",
            Object.fromEntries(SERVICO_GRUPOS.flatMap(({ itens }) => itens.map(({ id, tipos }) => [id, tipos]))),
          ),
        },
      ],
    },
    {
      titulo: "Tempo estimado",
      dica: "Quanto tempo leva?",
      perguntas: [
        {
          chave: "tempoEstimado",
          titulo: "Tempo estimado",
          ficha: "Duração",
          opcoes: [
            { id: "menos-1h", label: "Menos de 1 hora" },
            { id: "1-3h", label: "1 a 3 horas" },
            { id: "1-dia", label: "1 dia" },
            { id: "2-3-dias", label: "2 a 3 dias" },
            { id: "1-semana", label: "1 semana" },
            { id: "continuo", label: "Contínuo / por mês" },
          ],
        },
      ],
    },
  ],
}

export const PERGUNTAS: Record<string, CategoriaPublicar> = {
  bikes,
  pecas,
  produtos,
  consumiveis,
  servicos,
}

// ------------------------------------------------------------------
// AJUDANTES (usados pela tela e, depois, pela ficha técnica)
// ------------------------------------------------------------------

export function opcoesDe(pergunta: Pergunta, r: Respostas): Opcao[] {
  const { opcoes } = pergunta
  return typeof opcoes === "function" ? opcoes(r) : opcoes ?? []
}

export const visivel = (pergunta: Pergunta, r: Respostas) => !pergunta.mostrarSe || pergunta.mostrarSe(r)

export const respondida = (pergunta: Pergunta, r: Respostas) =>
  pergunta.opcional || !visivel(pergunta, r) || Boolean(r[pergunta.chave])

/** Texto da resposta como o comprador vê (ex.: "Aro 29”", "Caixa", "210 mm"). */
export function textoDaResposta(pergunta: Pergunta, r: Respostas): string {
  const valor = r[pergunta.chave]
  if (!valor || !visivel(pergunta, r)) return ""
  if (pergunta.numero) return `${valor} ${pergunta.numero.unidade}`
  return opcoesDe(pergunta, r).find((o) => o.id === valor)?.label ?? ""
}

/** Item da ficha gravado no anúncio: código (valor) + o texto da época (rotulo/texto). */
export type ItemFicha = { chave: string; valor: string; rotulo: string; texto: string }

const perguntasDe = (categoria: string) => PERGUNTAS[categoria]?.secoes.flatMap((s) => s.perguntas) ?? []

/** O que vai para o servidor ao publicar, na ordem das perguntas. */
export function fichaParaEnviar(categoria: string, rascunho: Record<string, unknown>): ItemFicha[] {
  const r: Respostas = {}
  for (const [chave, valor] of Object.entries(rascunho)) if (typeof valor === "string") r[chave] = valor
  return perguntasDe(categoria)
    .map((p) => ({ chave: p.chave, valor: r[p.chave] ?? "", rotulo: p.ficha, texto: textoDaResposta(p, r) }))
    .filter((item) => item.valor && item.texto)
}

/**
 * Ficha para mostrar no anúncio. Usa o texto atual da lista (assim uma tradução ou um nome
 * melhor vale também para anúncios antigos) e, se a pergunta ou a opção saiu da lista,
 * o texto guardado no anúncio.
 */
export function lerFicha(categoria: string | null | undefined, itens: ItemFicha[] | null | undefined) {
  if (!itens?.length) return []
  const r: Respostas = Object.fromEntries(itens.map((i) => [i.chave, i.valor]))
  const perguntas = perguntasDe(categoria ?? "")
  return itens.map((item) => {
    const p = perguntas.find((q) => q.chave === item.chave)
    return { rotulo: p?.ficha ?? item.rotulo, valor: (p && textoDaResposta(p, r)) || item.texto }
  })
}
