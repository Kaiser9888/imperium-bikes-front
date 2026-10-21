/**
 * Perguntas da Central de Ajuda. Cada resposta descreve o que o app faz hoje;
 * ao mudar uma regra (taxa, prazo, mínimo), atualize aqui e nos Termos.
 */
export type Pergunta = { pergunta: string; resposta: string; link?: { href: string; label: string } }
export type Topico = { id: string; titulo: string; perguntas: Pergunta[] }

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
                resposta: "O pagamento é feito pelo Stripe e fica retido até você confirmar que recebeu, ou até acabar o prazo de disputa (7 dias mais o prazo do frete). Se der problema nesse período, abra uma disputa no pedido e o valor não vai para o vendedor.",
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
                resposta: "Não recomendamos e é contra as regras: fora do app não há como proteger a compra nem devolver o dinheiro.",
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
                pergunta: "Quanto o Imperium Bikes cobra?",
                resposta: "10% sobre o preço do produto vendido. O frete não entra no cálculo. Anunciar é grátis; destacar o anúncio é opcional e pago.",
            },
            {
                pergunta: "Quando recebo o dinheiro da venda?",
                resposta: "Quando o comprador confirma o recebimento, ou quando acaba o prazo de disputa. Aí o valor é transferido pelo Stripe para a sua conta de recebimentos, e o Stripe deposita na sua conta bancária.",
                link: { href: "/carteira", label: "Abrir Carteira" },
            },
            {
                pergunta: "Preciso cadastrar uma conta para receber?",
                resposta: "Sim. Na Carteira, conecte sua conta de recebimentos no Stripe. É lá que você informa seus dados e o banco; nós não vemos sua conta bancária.",
            },
        ],
    },
    {
        id: "eventos",
        titulo: "Eventos",
        perguntas: [
            {
                pergunta: "Como crio um evento?",
                resposta: "Em Eventos, toque em Criar torneio e preencha os três passos. A capa é uma foto do seu aparelho. O evento é publicado na hora.",
                link: { href: "/torneios/criar", label: "Criar torneio" },
            },
            {
                pergunta: "Posso criar um evento para hoje?",
                resposta: "Pode. As inscrições ficam abertas até o fim do dia do evento, ou até a data que você escolher.",
            },
            {
                pergunta: "Como recebo o valor das inscrições?",
                resposta: "90% de cada inscrição vai para a sua Carteira quando você encerra o evento, e é transferido pelo Stripe para a sua conta de recebimentos.",
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
        titulo: "Vídeos e monetização",
        perguntas: [
            {
                pergunta: "Como publico um vídeo?",
                resposta: "Na Central de Vídeos, use Publicar vídeo. Ele fica em processamento por alguns minutos e depois aparece no seu canal. Publique só conteúdo seu ou que você tem permissão para usar.",
            },
            {
                pergunta: "Como funciona a monetização?",
                resposta: "Canais com 1.000 inscritos e 100 mil visualizações podem ativar. Você ganha 55% de cada anúncio exibido antes dos seus vídeos. Só os anúncios geram ganho: visualizações sozinhas não são pagas.",
                link: { href: "/videos/monetizacao", label: "Ver minha monetização" },
            },
            {
                pergunta: "Qual o saque mínimo?",
                resposta: "R$ 50,00. O saque vai pelo Stripe para a sua conta de recebimentos (a mesma da Carteira) e de lá para o seu banco.",
            },
        ],
    },
    {
        id: "anuncios",
        titulo: "Anunciar nos vídeos",
        perguntas: [
            {
                pergunta: "Como funciona o anúncio?",
                resposta: "Você envia um vídeo de até 60 segundos, define o link e o orçamento e paga pelo Stripe. A equipe revisa antes de ir ao ar. Você paga por mil exibições até o orçamento acabar.",
                link: { href: "/anunciar", label: "Anunciar" },
            },
            {
                pergunta: "O que faz um anúncio ser recusado?",
                resposta: "Propaganda enganosa, promessas sem comprovação, produtos proibidos, conteúdo impróprio ou uso de música, imagem ou marca de terceiros sem permissão. Campanha recusada tem o valor devolvido.",
            },
        ],
    },
    {
        id: "seguranca",
        titulo: "Segurança, denúncias e privacidade",
        perguntas: [
            {
                pergunta: "Como denuncio um anúncio, vídeo, evento ou perfil?",
                resposta: "Use o botão Denunciar na página. A denúncia é anônima para quem publicou e a equipe analisa. Para uso indevido de foto, vídeo ou marca sua, escolha 'Usa sem autorização' e diga onde está o original.",
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
