"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  MapPin,
  Video,
  Building2,
  ShieldCheck,
  Upload,
  Clock3,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

/* ------------------------------------------------------------------ */
/* TIPOS                                                              */
/* ------------------------------------------------------------------ */

type PublishData = {
  categoryId?: string

  sportId?: string
  sportName?: string

  serviceAreaId?: string
  serviceAreaName?: string

  serviceId?: string
  serviceName?: string

  serviceMode?: string
  duration?: string

  priceType?: string
  price?: string

  cep?: string
  city?: string
  state?: string
  neighborhood?: string

  professionalRegistration?: string
  professionalRegistrationState?: string
  professionalDocument?: string
}

type ServiceOption = {
  id: string
  label: string
  description?: string
  requiresProfessionalVerification?: boolean
}

/* ------------------------------------------------------------------ */
/* SERVIÇOS                                                           */
/* ------------------------------------------------------------------ */

const SERVICES_BY_AREA: Record<
  string,
  ServiceOption[]
> = {
  manutencao: [
    {
      id: "revisao-bicicleta",
      label: "Revisão de bicicleta",
    },
    {
      id: "manutencao-suspensao",
      label: "Manutenção de suspensão",
    },
    {
      id: "manutencao-freios",
      label: "Manutenção de freios",
    },
    {
      id: "montagem-bicicleta",
      label: "Montagem de bicicleta",
    },
    {
      id: "montagem-rodas",
      label: "Montagem de rodas",
    },
    {
      id: "tubeless",
      label: "Conversão tubeless",
    },
    {
      id: "lavagem-estetica",
      label: "Lavagem e estética",
    },
  ],

  aulas: [
    {
      id: "aula-individual",
      label: "Aula individual",
    },
    {
      id: "aula-grupo",
      label: "Aula em grupo",
    },
    {
      id: "treinamento-tecnico",
      label: "Treinamento técnico",
    },
    {
      id: "iniciacao-esportiva",
      label: "Iniciação esportiva",
    },
    {
      id: "preparacao-competicao",
      label: "Preparação para competição",
    },
  ],

  "bike-fit": [
    {
      id: "bike-fit-completo",
      label: "Bike Fit completo",
    },
    {
      id: "avaliacao-biomecanica",
      label: "Avaliação biomecânica",
    },
    {
      id: "ajuste-posicao",
      label: "Ajuste de posição",
    },
  ],

  nutricao: [
    {
      id: "consulta-nutricional",
      label: "Consulta nutricional",
      description: "Atendimento nutricional individual",
      requiresProfessionalVerification: true,
    },
    {
      id: "plano-alimentar",
      label: "Plano alimentar",
      description: "Planejamento alimentar individual",
      requiresProfessionalVerification: true,
    },
    {
      id: "acompanhamento-nutricional",
      label: "Acompanhamento nutricional",
      description: "Acompanhamento profissional",
      requiresProfessionalVerification: true,
    },
    {
      id: "nutricao-competicao",
      label: "Nutrição para competição",
      description: "Estratégia nutricional para atletas",
      requiresProfessionalVerification: true,
    },
  ],

  fisioterapia: [
    {
      id: "fisioterapia-esportiva",
      label: "Fisioterapia esportiva",
      requiresProfessionalVerification: true,
    },
    {
      id: "avaliacao-fisioterapeutica",
      label: "Avaliação fisioterapêutica",
      requiresProfessionalVerification: true,
    },
    {
      id: "reabilitacao",
      label: "Reabilitação",
      requiresProfessionalVerification: true,
    },
    {
      id: "prevencao-lesoes",
      label: "Prevenção de lesões",
      requiresProfessionalVerification: true,
    },
  ],

  assessoria: [
    {
      id: "assessoria-individual",
      label: "Assessoria individual",
    },
    {
      id: "assessoria-competicao",
      label: "Assessoria para competição",
    },
    {
      id: "plano-treinamento",
      label: "Plano de treinamento",
    },
    {
      id: "acompanhamento-esportivo",
      label: "Acompanhamento esportivo",
    },
  ],

  transporte: [
    {
      id: "transporte-bike",
      label: "Transporte de bicicleta",
    },
    {
      id: "leva-traz",
      label: "Leva e traz",
    },
    {
      id: "transporte-competicao",
      label: "Transporte para competição",
    },
  ],

  personal: [
    {
      id: "personal-presencial",
      label: "Personal trainer presencial",
      requiresProfessionalVerification: true,
    },
    {
      id: "personal-online",
      label: "Personal trainer online",
      requiresProfessionalVerification: true,
    },
    {
      id: "treinamento-individual",
      label: "Treinamento individual",
      requiresProfessionalVerification: true,
    },
  ],

  avaliacao: [
    {
      id: "avaliacao-fisica",
      label: "Avaliação física",
      requiresProfessionalVerification: true,
    },
    {
      id: "avaliacao-desempenho",
      label: "Avaliação de desempenho",
      requiresProfessionalVerification: true,
    },
  ],

  medicina: [
    {
      id: "consulta-medica",
      label: "Consulta médica",
      requiresProfessionalVerification: true,
    },
    {
      id: "avaliacao-esportiva",
      label: "Avaliação esportiva",
      requiresProfessionalVerification: true,
    },
    {
      id: "acompanhamento-medico",
      label: "Acompanhamento médico",
      requiresProfessionalVerification: true,
    },
  ],

  psicologia: [
    {
      id: "consulta-psicologica",
      label: "Consulta psicológica",
      requiresProfessionalVerification: true,
    },
    {
      id: "acompanhamento-psicologico",
      label: "Acompanhamento psicológico",
      requiresProfessionalVerification: true,
    },
    {
      id: "preparacao-mental",
      label: "Preparação mental para competição",
      requiresProfessionalVerification: true,
    },
  ],

  treinamento: [
    {
      id: "treinamento-individual",
      label: "Treinamento individual",
    },
    {
      id: "treinamento-grupo",
      label: "Treinamento em grupo",
    },
    {
      id: "preparacao-competicao",
      label: "Preparação para competição",
    },
  ],

  "outros": [
    {
      id: "outro-servico",
      label: "Outro serviço",
    },
  ],
}

/* ------------------------------------------------------------------ */
/* MODALIDADES DE ATENDIMENTO                                         */
/* ------------------------------------------------------------------ */

const SERVICE_MODES = [
  {
    id: "presencial",
    label: "Presencial",
    description: "Atendimento em um local físico",
    icon: Building2,
  },
  {
    id: "online",
    label: "Online",
    description: "Atendimento pela internet",
    icon: Video,
  },
  {
    id: "presencial-online",
    label: "Presencial e online",
    description: "Ofereça as duas modalidades",
    icon: MapPin,
  },
]

/* ------------------------------------------------------------------ */
/* DURAÇÕES                                                           */
/* ------------------------------------------------------------------ */

const DURATIONS = [
  {
    id: "menos-1h",
    label: "Menos de 1 hora",
  },
  {
    id: "1h",
    label: "1 hora",
  },
  {
    id: "1-2h",
    label: "1 a 2 horas",
  },
  {
    id: "2-3h",
    label: "2 a 3 horas",
  },
  {
    id: "mais-3h",
    label: "Mais de 3 horas",
  },
  {
    id: "varia",
    label: "Varia conforme o serviço",
  },
]

/* ------------------------------------------------------------------ */
/* TIPOS DE PREÇO                                                     */
/* ------------------------------------------------------------------ */

const PRICE_TYPES = [
  {
    id: "por-servico",
    label: "Por serviço",
  },
  {
    id: "por-hora",
    label: "Por hora",
  },
  {
    id: "por-sessao",
    label: "Por sessão",
  },
  {
    id: "por-pacote",
    label: "Por pacote",
  },
  {
    id: "a-combinar",
    label: "A combinar",
  },
]

/* ------------------------------------------------------------------ */
/* PÁGINA                                                             */
/* ------------------------------------------------------------------ */

export default function PublicarServicosInformacoesPage() {
  const router = useRouter()

  const [data, setData] =
    useState<PublishData | null>(null)

  const [serviceId, setServiceId] =
    useState("")

  const [serviceMode, setServiceMode] =
    useState("")

  const [duration, setDuration] =
    useState("")

  const [priceType, setPriceType] =
    useState("")

  const [price, setPrice] =
    useState("")

  const [cep, setCep] =
    useState("")

  const [city, setCity] =
    useState("")

  const [state, setState] =
    useState("")

  const [neighborhood, setNeighborhood] =
    useState("")

  const [
    registration,
    setRegistration,
  ] = useState("")

  const [
    registrationState,
    setRegistrationState,
  ] = useState("")

  const [
    professionalDocument,
    setProfessionalDocument,
  ] = useState<File | null>(null)

  const [expanded, setExpanded] =
    useState<string | null>(
      "service"
    )

  /* ---------------------------------------------------------------- */
  /* CARREGAR DADOS                                                   */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const stored =
      sessionStorage.getItem(
        "imperium_bikes_publish"
      )

    if (!stored) {
      router.replace(
        "/publicar/servicos"
      )
      return
    }

    try {
      const parsed =
        JSON.parse(stored) as PublishData

      if (
        !parsed.sportId ||
        !parsed.serviceAreaId
      ) {
        router.replace(
          "/publicar/servicos"
        )
        return
      }

      setData(parsed)

      if (parsed.serviceId) {
        setServiceId(
          parsed.serviceId
        )
      }

      if (parsed.serviceMode) {
        setServiceMode(
          parsed.serviceMode
        )
      }

      if (parsed.duration) {
        setDuration(
          parsed.duration
        )
      }

      if (parsed.priceType) {
        setPriceType(
          parsed.priceType
        )
      }

      if (parsed.price) {
        setPrice(parsed.price)
      }

      if (parsed.cep) {
        setCep(parsed.cep)
      }

      if (parsed.city) {
        setCity(parsed.city)
      }

      if (parsed.state) {
        setState(parsed.state)
      }

      if (parsed.neighborhood) {
        setNeighborhood(
          parsed.neighborhood
        )
      }

      if (
        parsed.professionalRegistration
      ) {
        setRegistration(
          parsed.professionalRegistration
        )
      }

      if (
        parsed.professionalRegistrationState
      ) {
        setRegistrationState(
          parsed.professionalRegistrationState
        )
      }

    } catch {
      router.replace(
        "/publicar/servicos"
      )
    }
  }, [router])

  /* ---------------------------------------------------------------- */
  /* SERVIÇOS                                                         */
  /* ---------------------------------------------------------------- */

  const services = useMemo(() => {
    if (!data?.serviceAreaId) {
      return []
    }

    return (
      SERVICES_BY_AREA[
        data.serviceAreaId
      ] ?? []
    )
  }, [data?.serviceAreaId])

  const selectedService =
    services.find(
      (service) =>
        service.id === serviceId
    )

  const requiresVerification =
    Boolean(
      selectedService
        ?.requiresProfessionalVerification
    )

  /* ---------------------------------------------------------------- */
  /* VALIDAÇÃO                                                        */
  /* ---------------------------------------------------------------- */

  const serviceValid =
    Boolean(serviceId)

  const modeValid =
    Boolean(serviceMode)

  const durationValid =
    Boolean(duration)

  const priceValid =
    priceType === "a-combinar"
      ? true
      : Boolean(price)

  const locationValid =
    serviceMode === "online"
      ? true
      : Boolean(
          cep &&
            city &&
            state
        )

  const professionalValid =
    !requiresVerification ||
    Boolean(
      registration &&
        registrationState &&
        professionalDocument
    )

  const allValid =
    serviceValid &&
    modeValid &&
    durationValid &&
    priceValid &&
    locationValid &&
    professionalValid

  /* ---------------------------------------------------------------- */
  /* BUSCAR CEP                                                       */
  /* ---------------------------------------------------------------- */

  const handleCepBlur = async () => {
    const cleanCep =
      cep.replace(/\D/g, "")

    if (cleanCep.length !== 8) {
      return
    }

    try {
      const response =
        await fetch(
          `https://viacep.com.br/ws/${cleanCep}/json/`
  )

if (!response.ok) {
  return
}

const result =
  await response.json()

if (result.erro) {
  return
}

setCity(
  result.localidade ?? ""
)

setState(
  result.uf ?? ""
)

setNeighborhood(
  result.bairro ?? ""
)

} catch {
  // O usuário ainda pode preencher manualmente.
}
}

/* ---------------------------------------------------------------- */
/* SALVAR                                                           */
/* ---------------------------------------------------------------- */

const handleContinue = () => {
  if (!allValid || !data) {
    return
  }

  const updatedData: PublishData = {
    ...data,

    serviceId,

    serviceName:
      selectedService?.label ?? "",

    serviceMode,

    duration,

    priceType,

    price,

    cep:
      serviceMode === "online"
        ? ""
        : cep,

    city:
      serviceMode === "online"
        ? ""
        : city,

    state:
      serviceMode === "online"
        ? ""
        : state,

    neighborhood:
      serviceMode === "online"
        ? ""
        : neighborhood,

    professionalRegistration:
      requiresVerification
        ? registration
        : "",

    professionalRegistrationState:
      requiresVerification
        ? registrationState
        : "",

    professionalDocument:
      requiresVerification &&
      professionalDocument
        ? professionalDocument.name
        : "",
  }

  sessionStorage.setItem(
    "imperium_bikes_publish",
    JSON.stringify(updatedData)
  )

  router.push(
    "/publicar/servicos/revisao"
  )
}

/* ---------------------------------------------------------------- */
/* COMPONENTE DE SEÇÃO                                              */
/* ---------------------------------------------------------------- */

const SectionHeader = ({
                         id,
                         title,
                         subtitle,
                         completed,
                       }: {
  id: string
  title: string
  subtitle: string
  completed: boolean
}) => (
  <button
    type="button"
    onClick={() =>
      setExpanded(
        expanded === id
          ? null
          : id
      )
    }
    className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left"
  >
    <div className="min-w-0">
      <p className="text-sm font-semibold">
        {title}
      </p>

      <p
        className={`mt-0.5 text-xs ${
          completed
            ? "font-medium text-primary"
            : "text-muted-foreground"
        }`}
      >
        {subtitle}
      </p>
    </div>

    <span className="flex shrink-0 items-center gap-2">
        {completed && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-white">
            <Check className="size-3" />
          </span>
        )}

      <ChevronDown
        className={`size-4 text-muted-foreground transition-transform ${
          expanded === id
            ? "rotate-180"
            : ""
        }`}
      />
      </span>
  </button>
)

if (!data) {
  return null
}

return (
  <main className="min-h-screen bg-background text-foreground">

    {/* ------------------------------------------------------------ */}
    {/* HEADER                                                        */}
    {/* ------------------------------------------------------------ */}

    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-lg">

      <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4">

        <Link
          href="/publicar/servicos/area"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Voltar
        </Link>

        <span className="text-sm font-semibold">
            Informações
          </span>

        <div className="w-[52px]" />

      </div>

    </header>

    {/* ------------------------------------------------------------ */}
    {/* CONTEÚDO                                                      */}
    {/* ------------------------------------------------------------ */}

    <div className="mx-auto max-w-2xl px-4 pb-32 pt-6">

      <section className="mb-7">

        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {data.sportName}
        </p>

        <h1 className="mt-1 font-heading text-2xl font-bold tracking-tight">
          Informações do serviço
        </h1>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Agora vamos definir como seu serviço será oferecido.
        </p>

      </section>

      <div className="space-y-3">

        {/* ======================================================== */}
        {/* SERVIÇO                                                    */}
        {/* ======================================================== */}

        <section className="overflow-hidden rounded-xl border border-border">

          <SectionHeader
            id="service"
            title="Serviço"
            subtitle={
              selectedService?.label ??
              "Escolha o serviço"
            }
            completed={serviceValid}
          />

          {expanded === "service" && (

            <div className="border-t border-border px-2 pb-2 pt-1">

              {services.map(
                (service) => {

                  const selected =
                    service.id ===
                    serviceId

                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setServiceId(
                          service.id
                        )

                        setExpanded(
                          "mode"
                        )
                      }}
                      className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left ${
                        selected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/60"
                      }`}
                    >

                        <span>

                          <span
                            className={`text-sm ${
                              selected
                                ? "font-semibold"
                                : "font-medium"
                            }`}
                          >
                            {service.label}
                          </span>

                          {service.description && (
                            <span className="mt-0.5 block text-xs text-muted-foreground">
                              {service.description}
                            </span>
                          )}

                        </span>

                      {selected && (
                        <Check className="size-4 shrink-0" />
                      )}

                    </button>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ======================================================== */}
        {/* ATENDIMENTO                                                */}
        {/* ======================================================== */}

        <section className="overflow-hidden rounded-xl border border-border">

          <SectionHeader
            id="mode"
            title="Atendimento"
            subtitle={
              serviceMode
                ? SERVICE_MODES.find(
                  (item) =>
                    item.id ===
                    serviceMode
                )?.label ??
                "Escolhido"
                : "Como você atende?"
            }
            completed={modeValid}
          />

          {expanded === "mode" && (

            <div className="border-t border-border px-2 pb-2 pt-1">

              {SERVICE_MODES.map(
                (mode) => {

                  const Icon =
                    mode.icon

                  const selected =
                    serviceMode ===
                    mode.id

                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => {
                        setServiceMode(
                          mode.id
                        )

                        setExpanded(
                          "duration"
                        )
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left ${
                        selected
                          ? "bg-primary/10"
                          : "hover:bg-muted/60"
                      }`}
                    >

                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted">

                        <Icon
                          className={`size-4 ${
                            selected
                              ? "text-primary"
                              : "text-muted-foreground"
                          }`}
                        />

                      </div>

                      <div className="flex-1">

                        <p
                          className={`text-sm ${
                            selected
                              ? "font-semibold text-primary"
                              : "font-medium"
                          }`}
                        >
                          {mode.label}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {mode.description}
                        </p>

                      </div>

                      {selected && (
                        <Check className="size-4 text-primary" />
                      )}

                    </button>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ======================================================== */}
        {/* DURAÇÃO                                                    */}
        {/* ======================================================== */}

        <section className="overflow-hidden rounded-xl border border-border">

          <SectionHeader
            id="duration"
            title="Duração"
            subtitle={
              duration
                ? DURATIONS.find(
                  (item) =>
                    item.id ===
                    duration
                )?.label ??
                "Escolhida"
                : "Quanto tempo dura?"
            }
            completed={durationValid}
          />

          {expanded === "duration" && (

            <div className="border-t border-border px-2 pb-2 pt-1">

              {DURATIONS.map(
                (item) => {

                  const selected =
                    duration ===
                    item.id

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setDuration(
                          item.id
                        )

                        setExpanded(
                          "price"
                        )
                      }}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left ${
                        selected
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted/60"
                      }`}
                    >

                        <span className="flex items-center gap-2">

                          <Clock3 className="size-4" />

                          <span
                            className={`text-sm ${
                              selected
                                ? "font-semibold"
                                : "font-medium"
                            }`}
                          >
                            {item.label}
                          </span>

                        </span>

                      {selected && (
                        <Check className="size-4" />
                      )}

                    </button>
                  )
                }
              )}

            </div>
          )}

        </section>

        {/* ======================================================== */}
        {/* PREÇO                                                      */}
        {/* ======================================================== */}

        <section className="overflow-hidden rounded-xl border border-border">

          <SectionHeader
            id="price"
            title="Preço"
            subtitle={
              priceType
                ? PRICE_TYPES.find(
                  (item) =>
                    item.id ===
                    priceType
                )?.label ??
                "Definido"
                : "Como você cobra?"
            }
            completed={priceValid}
          />

          {expanded === "price" && (

            <div className="border-t border-border p-4">

              <div className="grid grid-cols-2 gap-2">

                {PRICE_TYPES.map(
                  (item) => {

                    const selected =
                      priceType ===
                      item.id

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() =>
                          setPriceType(
                            item.id
                          )
                        }
                        className={`rounded-lg border px-3 py-3 text-left text-sm ${
                          selected
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "border-border hover:bg-muted/60"
                        }`}
                      >
                        {item.label}
                      </button>
                    )
                  }
                )}

              </div>

              {priceType &&
                priceType !==
                "a-combinar" && (

                  <div className="mt-4">

                    <label
                      htmlFor="price"
                      className="mb-2 block text-xs font-medium"
                    >
                      Valor
                    </label>

                    <div className="flex items-center rounded-lg border border-border px-3">

                        <span className="text-sm text-muted-foreground">
                          R$
                        </span>

                      <input
                        id="price"
                        type="text"
                        inputMode="decimal"
                        value={price}
                        onChange={(event) =>
                          setPrice(
                            event.target.value
                          )
                        }
                        placeholder="0,00"
                        className="w-full bg-transparent px-2 py-3 text-sm outline-none"
                      />

                    </div>

                  </div>
                )}

              {priceType ===
                "a-combinar" && (

                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    O preço será combinado diretamente com o cliente.
                  </p>

                )}

            </div>
          )}

        </section>

        {/* ======================================================== */}
        {/* LOCALIZAÇÃO                                               */}
        {/* ======================================================== */}

        {serviceMode !== "online" && (

          <section className="overflow-hidden rounded-xl border border-border">

            <SectionHeader
              id="location"
              title="Localização"
              subtitle={
                city && state
                  ? `${city} - ${state}`
                  : "Onde você atende?"
              }
              completed={locationValid}
            />

            {expanded === "location" && (

              <div className="border-t border-border p-4">

                <label
                  htmlFor="cep"
                  className="mb-2 block text-xs font-medium"
                >
                  CEP
                </label>

                <input
                  id="cep"
                  type="text"
                  inputMode="numeric"
                  maxLength={9}
                  value={cep}
                  onChange={(event) =>
                    setCep(
                      event.target.value
                    )
                  }
                  onBlur={
                    handleCepBlur
                  }
                  placeholder="00000-000"
                  className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                />

                <div className="mt-3 grid grid-cols-3 gap-2">

                  <input
                    value={neighborhood}
                    onChange={(event) =>
                      setNeighborhood(
                        event.target.value
                      )
                    }
                    placeholder="Bairro"
                    className="col-span-2 rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none"
                  />

                  <input
                    value={state}
                    onChange={(event) =>
                      setState(
                        event.target.value
                      )
                    }
                    placeholder="UF"
                    maxLength={2}
                    className="rounded-lg border border-border bg-background px-3 py-3 text-sm uppercase outline-none"
                  />

                </div>

                <input
                  value={city}
                  onChange={(event) =>
                    setCity(
                      event.target.value
                    )
                  }
                  placeholder="Cidade"
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none"
                />

                <div className="mt-3 flex gap-2 rounded-lg bg-muted/40 p-3">

                  <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                  <p className="text-xs leading-5 text-muted-foreground">
                    O endereço completo não precisa ser exibido publicamente. O anúncio pode mostrar apenas a cidade e o estado.
                  </p>

                </div>

              </div>
            )}

          </section>
        )}

        {/* ======================================================== */}
        {/* VERIFICAÇÃO PROFISSIONAL                                   */}
        {/* ======================================================== */}

        {requiresVerification && (

          <section className="overflow-hidden rounded-xl border border-border">

            <SectionHeader
              id="professional"
              title="Qualificação profissional"
              subtitle={
                professionalValid
                  ? "Informações enviadas para verificação"
                  : "Comprovação necessária"
              }
              completed={
                professionalValid
              }
            />

            {expanded ===
              "professional" && (

                <div className="border-t border-border p-4">

                  <div className="mb-5 rounded-xl border border-primary/20 bg-primary/5 p-4">

                    <div className="flex gap-3">

                      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">

                        <ShieldCheck className="size-5 text-primary" />

                      </div>

                      <div>

                        <p className="text-sm font-semibold">
                          Verificação profissional
                        </p>

                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Este serviço envolve uma atividade profissional regulamentada. Antes da publicação, os dados profissionais serão analisados.
                        </p>

                      </div>

                    </div>

                  </div>

                  <label
                    htmlFor="registration"
                    className="mb-2 block text-xs font-medium"
                  >
                    Número do registro profissional
                  </label>

                  <input
                    id="registration"
                    value={registration}
                    onChange={(event) =>
                      setRegistration(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: 12345"
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm outline-none focus:border-primary"
                  />

                  <label
                    htmlFor="registrationState"
                    className="mb-2 mt-4 block text-xs font-medium"
                  >
                    Estado do registro
                  </label>

                  <input
                    id="registrationState"
                    value={registrationState}
                    onChange={(event) =>
                      setRegistrationState(
                        event.target.value
                      )
                    }
                    placeholder="Ex.: BA"
                    maxLength={2}
                    className="w-full rounded-lg border border-border bg-background px-3 py-3 text-sm uppercase outline-none focus:border-primary"
                  />

                  <label className="mb-2 mt-4 block text-xs font-medium">
                    Documento profissional
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-4 hover:bg-muted/40">

                    <Upload className="size-5 text-muted-foreground" />

                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-medium">
                        {professionalDocument
                          ? professionalDocument.name
                          : "Enviar documento"}
                      </p>

                      <p className="text-xs text-muted-foreground">
                        PDF, JPG ou PNG
                      </p>

                    </div>

                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      className="hidden"
                      onChange={(event) =>
                        setProfessionalDocument(
                          event.target.files?.[0] ??
                          null
                        )
                      }
                    />

                  </label>

                  <p className="mt-3 text-xs leading-5 text-muted-foreground">
                    O envio do documento não significa aprovação automática. A publicação de serviços regulamentados depende da validação das informações profissionais.
                  </p>

                </div>
              )}

          </section>
        )}

      </div>

      {/* ---------------------------------------------------------- */}
      {/* RESUMO                                                      */}
      {/* ---------------------------------------------------------- */}

      <section className="mt-6 rounded-2xl border border-border bg-muted/30 p-4">

        <p className="text-xs text-muted-foreground">
          Resumo
        </p>

        <div className="mt-3 space-y-2">

          <div className="flex justify-between gap-4 text-sm">

              <span className="text-muted-foreground">
                Esporte
              </span>

            <span className="font-medium">
                {data.sportName}
              </span>

          </div>

          <div className="flex justify-between gap-4 text-sm">

              <span className="text-muted-foreground">
                Área
              </span>

            <span className="text-right font-medium">
                {data.serviceAreaName}
              </span>

          </div>

          {selectedService && (

            <div className="flex justify-between gap-4 text-sm">

                <span className="text-muted-foreground">
                  Serviço
                </span>

              <span className="text-right font-medium">
                  {selectedService.label}
                </span>

            </div>
          )}

        </div>

      </section>

    </div>

    {/* ------------------------------------------------------------ */}
    {/* BOTÃO                                                         */}
    {/* ------------------------------------------------------------ */}

    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-lg">

      <div className="mx-auto max-w-2xl px-4 py-3">

        <button
          type="button"
          onClick={handleContinue}
          disabled={!allValid}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3.5 text-sm font-semibold text-white transition-all hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
        >

          Revisar anúncio

          <ArrowRight className="size-4" />

        </button>

      </div>

    </div>

  </main>
)
}

