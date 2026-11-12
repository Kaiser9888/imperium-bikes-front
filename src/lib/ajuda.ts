/**
 * Perguntas da Central de Ajuda. Cada resposta descreve o que o app faz hoje;
 * ao mudar uma regra (taxa, prazo, mínimo), atualize aqui e nos Termos.
 */
import { ANUNCIOS_ABERTOS } from "@/lib/anuncios"
import { ETIQUETA_AUTOMATICA } from "@/lib/etiqueta"

export type Pergunta = { pergunta: string; resposta: string; link?: { href: string; label: string } }
export type Topico = { id: string; titulo: string; perguntas: Pergunta[] }

// Monetização e anúncios só aparecem quando estiverem abertos ao público (src/lib/anuncios.ts)
const monetizacao: Pergunta[] = [
    {
        pergunta: "Como funciona a monetização?",
        resposta: "Quando o canal é liberado, você ganha 55% de cada anúncio exibido antes dos seus vídeos. Só os anúncios geram ganho: visualizações sozinhas não são pagas, e só há ganho quando há anunciante com campanha no ar.",
        link: { href: "/videos/monetizacao", label: "Ver minha monetização" },
    },
    {
        pergunta: "O que conta para liberar a monetização?",
        resposta: "Vários fatores: audiência e engajamento reais, regularidade das publicações, tempo e situação da conta, histórico de denúncias e a procura de anunciantes. A análise é revista todo dia. Não divulgamos números exatos para não estimular seguidores ou visualizações artificiais, e bater uma meta de audiência sozinha não garante a liberação.",
    },
    {
        pergunta: "Por que meu ganho fica \"a liberar\"?",
        resposta: "Cada exibição fica 30 dias a liberar antes de ir para o saldo disponível. É o prazo para confirmar as exibições e o pagamento do anunciante. Depois disso, você pode sacar.",
    },
    {
        pergunta: "Qual o saque mínimo?",
        resposta: "R$ 50,00. O saque vai pelo Stripe para a sua conta de recebimentos (a mesma da Carteira) e de lá para o seu banco.",
    },
]

const anuncios: Topico = {
    id: "anuncios",
    titulo: "Anunciar nos vídeos",
    perguntas: [
        {
            pergunta: "Como funciona o anúncio?",
            resposta: "Você envia um vídeo de até 60 segundos, define o link e o orçamento e paga pelo Stripe. A equipe revisa antes de ir ao ar. Você paga por mil exibições até o orçamento acabar.",
            link: { href: "/anunciar", label: "Anunciar" },
        },
        {
            pergunta: "Quem pode anunciar?",
            resposta: "Contas com e-mail confirmado, pelo menos 7 dias de cadastro, sem suspensão e sem denúncias procedentes recentes. A primeira campanha vai até R$ 1.000,00; depois da primeira aprovada, o limite sobe. Cada conta pode ter até 2 campanhas em análise ao mesmo tempo.",
        },
        {
            pergunta: "O que faz um anúncio ser recusado?",
            resposta: "Propaganda enganosa, promessas sem comprovação, produtos proibidos, conteúdo impróprio ou uso de música, imagem ou marca de terceiros sem permissão. Campanha recusada tem o valor devolvido.",
        },
    ],
}

export const topicos: Topico[] = [
    {
        id: "conta",
        titulo: "Conta e perfil",
        perguntas: [
            {
                pergunta: "Como crio minha conta?",
                resposta: "Toque em Cadastrar no menu e use seu e-mail. É preciso ter 18 anos, ou de 16 a 18 com autorização do responsável.",
            },
            {
                pergunta: "Como mudo meu nome, foto ou bio?",
                resposta: "Abra Configurações pelo menu e use Editar perfil. Os patrocinadores do seu perfil ficam em Configurações, Patrocinadores.",
                link: { href: "/perfil", label: "Editar perfil" },
            },
            {
                pergunta: "O que significa o selo Verificado?",
                resposta: "Que a pessoa confirmou o e-mail e o telefone. Não é uma garantia sobre ela ou sobre os produtos dela: continue comprando sempre pelo app.",
            },
            {
                pergunta: "Como excluo minha conta?",
                resposta: "Em Configurações, no fim da página, use Excluir conta. Seus dados pessoais são apagados, seus anúncios e vídeos saem do ar. Pedidos em andamento precisam ser concluídos antes.",
                link: { href: "/configuracoes#excluir-conta", label: "Excluir conta" },
            },
        ],
    },
    {
        id: "compras",
        titulo: "Compras",
        perguntas: [
            {
                pergunta: "Como sei que meu dinheiro está protegido?",
                resposta: "O pagamento é feito pelo Stripe e fica retido até você confirmar que recebeu, ou até acabar o prazo de disputa (7 dias mais o prazo do frete, contados de quando o vendedor posta). Na retirada em mãos, ele só é liberado com o seu código de retirada. Se der problema, abra uma disputa no pedido e o valor não vai para o vendedor.",
            },
            {
                pergunta: "Quais formas de pagamento posso usar?",
                resposta: "As que aparecem na página de pagamento do Stripe na hora da compra (cartão e, quando disponíveis, outras formas como Pix). Seus dados de pagamento vão direto para o Stripe.",
            },
            {
                pergunta: "Como é calculado o frete?",
                resposta: "Na página do produto ou no checkout, informe o CEP: aparecem as transportadoras e prazos disponíveis para aquele envio. Alguns vendedores oferecem frete grátis acima de um valor.",
            },
            {
                pergunta: "Me arrependi da compra. E agora?",
                resposta: "Você tem 7 dias a partir do recebimento para desistir, com devolução de tudo que pagou, inclusive o frete. Abra a disputa em Pedidos.",
                link: { href: "/reembolso#arrependimento", label: "Ver Política de Reembolso" },
            },
            {
                pergunta: "O produto não chegou ou veio diferente. O que faço?",
                resposta: "Em Pedidos, abra uma disputa explicando o problema antes do fim do prazo. O vendedor pode reembolsar direto; se não houver acordo, a equipe decide.",
                link: { href: "/pedidos", label: "Abrir Pedidos" },
            },
            {
                pergunta: "Posso pagar por fora do app?",
                resposta: "Pague pelo Imperium: é o que segura o dinheiro até você receber. Pix, depósito, dinheiro ou link fora do app não têm retenção, código de retirada, disputa nem reembolso: quem paga por fora assume o risco. Se o vendedor pedir pagamento por fora, denuncie. As exceções são os serviços \"a partir de\" e a retirada em mãos quando o anúncio diz que o vendedor aceita pagamento direto: aí é combinado entre vocês, sem garantia do Imperium.",
            },
            {
                pergunta: "O que é um serviço \"a partir de\"?",
                resposta: "É um serviço cujo valor depende de avaliação, como um reparo. O anúncio mostra o preço inicial e o local; você fala com o prestador pelo chat e combinam o valor final e o pagamento direto, sem garantia do Imperium. Serviços com valor fixo são pagos pelo app, com a mesma proteção de uma compra.",
                link: { href: "/termos#servicos", label: "Ver nos Termos" },
            },
            {
                pergunta: "Como funciona a retirada em mãos?",
                resposta: "Você paga pelo app e recebe um código de 6 números em Pedidos. No encontro, confira o produto e só então passe o código ao vendedor: é ele que libera o pagamento. Sem o código, o dinheiro não sai, e se algo der errado você abre uma disputa. Combine em local público e movimentado e não leve dinheiro.",
                link: { href: "/pedidos", label: "Abrir Pedidos" },
            },
            {
                pergunta: "Posso combinar o envio com o vendedor?",
                resposta: "Sim. No pagamento, escolha \"Combinar envio com o vendedor\": você paga o produto pelo app e o frete direto a ele (ônibus, transportadora ou outro jeito). Você recebe um código e só passa ao vendedor quando a bike chegar: é ele que libera o pagamento. Se travar, a equipe analisa o caso pelas provas de envio.",
                link: { href: "/protecao", label: "Como funciona a proteção" },
            },
        ],
    },
    {
        id: "vendas",
        titulo: "Vendas",
        perguntas: [
            {
                pergunta: "Como anuncio um produto?",
                resposta: "Abra a Central do vendedor, escolha a categoria e siga as etapas: informações, fotos, frete e preço. O anúncio entra no ar na hora.",
                link: { href: "/vendedor", label: "Central do vendedor" },
            },
            {
                pergunta: "Como embalo e envio uma bike?",
                resposta: "Tire as duas rodas, os pedais, o guidão e o canote, proteja câmbio e freios e monte numa caixa de até 129 × 85 × 82 cm e 50 kg (bicicletarias costumam dar a caixa). Informe no anúncio o peso e as medidas da caixa fechada. Se não quer ou não consegue enviar, anuncie com \"Não vou enviar: retirada no local ou em local combinado\". A cartilha tem o passo a passo com desenhos.",
                link: { href: "/ajuda/envio-de-bike", label: "Ver a cartilha de envio" },
            },
            {
                pergunta: "Quanto o Imperium Bikes cobra?",
                resposta: "Nada. Anunciar e vender são grátis: você recebe 100% do preço, mais o frete pago pelo comprador. Quem paga a Proteção Imperium é o comprador. O preço mínimo de um anúncio é R$ 20,00.",
            },
            {
                pergunta: "Quando recebo o dinheiro da venda?",
                resposta: ETIQUETA_AUTOMATICA
                    ? "Quando o comprador confirma o recebimento, ou quando acaba o prazo de disputa. O frete não entra no valor: ele já pagou a etiqueta que o site gerou para você. Aí o valor é transferido pelo Stripe para a sua conta de recebimentos, e o Stripe deposita na sua conta bancária."
                    : "Quando o comprador confirma o recebimento, ou quando acaba o prazo de disputa. O frete que o comprador pagou vem junto. Aí o valor é transferido pelo Stripe para a sua conta de recebimentos, e o Stripe deposita na sua conta bancária.",
                link: { href: "/carteira", label: "Abrir Carteira" },
            },
            {
                pergunta: "Vendi com envio. Como despacho?",
                resposta: ETIQUETA_AUTOMATICA
                    ? "O site compra a etiqueta com o frete que o comprador pagou. Em Minhas vendas, na Central do vendedor, toque em Imprimir etiqueta, cole na caixa com o peso e as medidas do anúncio e poste em até 3 dias úteis no local indicado (sem pagar nada). O rastreio entra sozinho. Antes da primeira venda, cadastre seu endereço de envio em Configurações."
                    : "Em Minhas vendas, na Central do vendedor, aparecem o endereço de quem recebe e o serviço de frete escolhido. Compre a etiqueta no Melhor Envio nesse mesmo serviço (assim o valor bate com o frete pago, que você recebe junto com a venda), use a caixa com o peso e as medidas do anúncio, poste em até 3 dias úteis e informe o código de rastreio no pedido. O prazo de liberação só começa depois disso.",
                link: { href: "/vendedor/vendas", label: "Abrir Minhas vendas" },
            },
            {
                pergunta: "Preciso cadastrar uma conta para receber?",
                resposta: "Sim, antes do primeiro anúncio. O site pede na hora de anunciar (ou na Carteira): você informa no Stripe nome, CPF, data de nascimento, endereço e o banco. Não precisa ter empresa. Nós não vemos sua conta bancária. Só serviço com valor a combinar pode ser anunciado sem isso.",
            },
        ],
    },
    {
        id: "eventos",
        titulo: "Eventos",
        perguntas: [
            {
                pergunta: "Como crio um evento?",
                resposta: "Em Eventos, toque em Criar evento e preencha os três passos. A capa é uma foto do seu aparelho. O evento é publicado na hora.",
                link: { href: "/torneios/criar", label: "Criar evento" },
            },
            {
                pergunta: "Posso criar um evento para hoje?",
                resposta: "Pode. As inscrições ficam abertas até o fim do dia do evento, ou até a data que você escolher.",
            },
            {
                pergunta: "Como recebo o valor das inscrições?",
                resposta: "De cada inscrição, 10% ficam com a Imperium, já incluindo a tarifa do cartão; os outros 90% vão para a sua Carteira 7 dias depois do fim do evento (prazo para algum inscrito reclamar) e é transferido pelo Stripe para a sua conta de recebimentos. Ao criar o evento, o site mostra quanto você recebe por inscrição. Para cobrar inscrição, ative seus recebimentos antes; a inscrição paga mínima é R$ 10,00.",
            },
            {
                pergunta: "Desisti de um evento. Recebo o dinheiro de volta?",
                resposta: "Sim, se cancelar a inscrição na página do evento antes de ele começar. Se o organizador cancelar o evento, o reembolso é automático.",
                link: { href: "/reembolso#eventos", label: "Ver regras de reembolso" },
            },
        ],
    },
    {
        id: "videos",
        titulo: ANUNCIOS_ABERTOS ? "Vídeos e monetização" : "Vídeos",
        perguntas: [
            {
                pergunta: "Como publico um vídeo?",
                resposta: "Na Central de Vídeos, use Publicar vídeo. Ele fica em processamento por alguns minutos e depois aparece no seu canal. Publique só conteúdo seu ou que você tem permissão para usar.",
            },
            ...(ANUNCIOS_ABERTOS ? monetizacao : []),
        ],
    },
    ...(ANUNCIOS_ABERTOS ? [anuncios] : []),
    {
        id: "seguranca",
        titulo: "Segurança, denúncias e privacidade",
        perguntas: [
            {
                pergunta: "Como denuncio um anúncio, vídeo, evento ou perfil?",
                resposta: "Use o botão Denunciar na página. A denúncia é anônima para quem publicou e a equipe analisa. Para uso indevido de foto, vídeo ou marca sua, escolha 'Usa sem autorização' e diga onde está o original.",
            },
            {
                pergunta: "Roubaram minha bike. Como aviso?",
                resposta: "Registre o alerta com o número de série do quadro e o número do boletim de ocorrência. A equipe confere o boletim e, a partir daí, ninguém consegue anunciar uma bike com esse número no Imperium; anúncios que já estavam no ar com ele saem. Antes de comprar uma usada, você também pode consultar o número de série na mesma página.",
                link: { href: "/seguranca/bike-roubada", label: "Bike roubada" },
            },
            {
                pergunta: "Acho que invadiram minha conta. O que faço?",
                resposta: "Em Configurações > Segurança, toque em Congelar minha conta: todos os aparelhos saem na hora e ninguém entra até o suporte confirmar que você é o dono. Se o e-mail da conta foi trocado, use o link \"Não fui eu\" que mandamos para o e-mail antigo. Seu dinheiro não muda de destino: saques e repasses só vão para a sua conta de recebimentos no Stripe. Para evitar, ligue a verificação em duas etapas.",
                link: { href: "/configuracoes#seguranca", label: "Abrir Segurança" },
            },
            {
                pergunta: "O conteúdo é revisado antes de ser publicado?",
                resposta: "Produtos, vídeos, eventos e posts entram no ar na hora e são analisados quando alguém denuncia. Anúncios pagos são revisados antes de ir ao ar.",
            },
            {
                pergunta: "Quais dados meus vocês guardam?",
                resposta: "Só o necessário para o app funcionar. A lista completa, com quem compartilhamos e por quanto tempo, está na Política de Privacidade.",
                link: { href: "/privacidade", label: "Política de Privacidade" },
            },
            {
                pergunta: "Vocês usam cookies?",
                resposta: "Só os necessários para manter você logado e proteger o pagamento. Estatísticas de uso, sem cookies, só se você aceitar no aviso.",
                link: { href: "/privacidade#cookies", label: "Ver detalhes" },
            },
        ],
    },
]
