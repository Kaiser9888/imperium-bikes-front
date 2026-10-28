import type { Metadata } from "next"
import Link from "next/link"

import { Documento, Secao } from "@/components/legal/documento"
import { empresa, identificacaoEmpresa } from "@/lib/empresa"

export const metadata: Metadata = {
    title: "Termos de Uso | Imperium Bikes",
    description: "Regras para usar o Imperium Bikes: conta, marketplace, pagamentos, eventos, vídeos, anúncios e monetização.",
}

const secoes = [
    { id: "aceite", titulo: "Aceite e quem somos" },
    { id: "conta", titulo: "Sua conta" },
    { id: "conduta", titulo: "Regras de convivência" },
    { id: "marketplace", titulo: "Compra e venda" },
    { id: "pagamentos", titulo: "Pagamentos, taxas e repasses" },
    { id: "eventos", titulo: "Eventos" },
    { id: "conteudo", titulo: "Vídeos e conteúdo" },
    { id: "anuncios", titulo: "Anúncios nos vídeos" },
    { id: "monetizacao", titulo: "Monetização" },
    { id: "moderacao", titulo: "Denúncias e moderação" },
    { id: "responsabilidade", titulo: "Responsabilidades" },
    { id: "encerramento", titulo: "Suspensão e encerramento" },
    { id: "geral", titulo: "Disposições gerais" },
]

export default function TermosPage() {
    return (
        <Documento
            titulo="Termos de Uso"
            resumo="As regras para comprar, vender, criar eventos, publicar vídeos e anunciar no Imperium Bikes."
            secoes={secoes}
        >
            <Secao id="aceite" titulo="1. Aceite e quem somos">
                <p>
                    O {empresa.marca} é operado por <strong>{identificacaoEmpresa()}</strong>
                    {empresa.endereco ? `, ${empresa.endereco}` : ""}. Ao criar conta ou usar o app, você concorda com estes Termos e
                    com a <Link href="/privacidade">Política de Privacidade</Link>. Se não concordar, não use o app.
                </p>
                <p>
                    O {empresa.marca} é uma plataforma que aproxima compradores e vendedores, organizadores e participantes de eventos,
                    criadores e público. Nas vendas entre usuários, não somos os vendedores dos produtos anunciados.
                </p>
            </Secao>

            <Secao id="conta" titulo="2. Sua conta">
                <ul>
                    <li>
                        É preciso ter 18 anos, ou de 16 a 18 anos com autorização do responsável legal. Vender, organizar eventos pagos,
                        anunciar e monetizar são só para maiores de 18 anos.
                    </li>
                    <li>Use dados verdadeiros. A conta é pessoal; não empreste nem venda.</li>
                    <li>Você é responsável pelo que acontece na sua conta. Se perceber uso indevido, avise o suporte.</li>
                    <li>
                        O selo &quot;Verificado&quot; indica apenas que o e-mail e o telefone foram confirmados; não é garantia sobre a
                        pessoa nem sobre os produtos dela.
                    </li>
                    <li>
                        Você pode excluir a conta quando quiser em <Link href="/configuracoes#excluir-conta">Configurações</Link>.
                    </li>
                </ul>
            </Secao>

            <Secao id="conduta" titulo="3. Regras de convivência">
                <p>É proibido:</p>
                <ul>
                    <li>anunciar produtos ilegais, roubados, falsificados, perigosos ou que dependam de autorização que você não tem;</li>
                    <li>enganar outros usuários, fazer propaganda enganosa ou promessas que não possa comprovar;</li>
                    <li>publicar avaliações, comentários ou visualizações falsas, ou comprar/combinar avaliações;</li>
                    <li>assediar, ameaçar, discriminar ou expor dados pessoais de outras pessoas;</li>
                    <li>publicar fotos, vídeos, músicas ou marcas de terceiros sem permissão;</li>
                    <li>combinar pagamento por fora do app para fugir das taxas ou da proteção da compra;</li>
                    <li>usar robôs, scripts ou contas falsas para inflar números, anúncios ou ganhos.</li>
                </ul>
            </Secao>

            <Secao id="marketplace" titulo="4. Compra e venda">
                <ul>
                    <li>
                        O vendedor é o responsável pelo produto: descrição fiel, fotos reais do item, estado de conservação, preço, estoque,
                        emissão de nota fiscal quando exigida e envio no prazo.
                    </li>
                    <li>
                        Avaliações só podem ser feitas por quem comprou e recebeu o produto, e refletem a experiência real do comprador.
                    </li>
                    <li>
                        Depois do pagamento, o valor fica retido até o comprador confirmar o recebimento ou até terminar o prazo para abrir
                        disputa (7 dias mais o prazo do frete). Se houver problema, o comprador abre a disputa pela página do pedido.
                    </li>
                    <li>
                        <strong>Retirada em mãos:</strong> o comprador paga pelo app e recebe um código de retirada. Ele só passa o código
                        ao vendedor depois de conferir o produto, e o pagamento só é liberado ao vendedor com esse código, sem liberação
                        automática por prazo. Recomendamos combinar a entrega em local público e movimentado.
                    </li>
                    <li>
                        Trocas, devoluções e arrependimento seguem a <Link href="/reembolso">Política de Reembolso</Link> e o Código de
                        Defesa do Consumidor.
                    </li>
                </ul>
            </Secao>

            <Secao id="pagamentos" titulo="5. Pagamentos, taxas e repasses">
                <ul>
                    <li>
                        <strong>
                            Todo pagamento de compra, inscrição ou anúncio deve ser feito dentro do Imperium Bikes, inclusive na retirada em
                            mãos.
                        </strong>{" "}
                        É proibido pedir ou aceitar Pix, depósito, transferência, dinheiro em espécie, boleto ou link de pagamento fora do
                        app. Quem combina, faz ou recebe um pagamento por fora age por conta e risco próprios: essa operação não tem
                        nenhuma das proteções destes Termos (retenção do valor, código de retirada, disputa e reembolso), e o Imperium
                        Bikes não responde por ela. Pedir pagamento por fora pode levar à suspensão da conta.
                    </li>
                    <li>
                        Todo pagamento e repasse passa pelo <strong>Stripe</strong>. O dinheiro não fica conosco: o que aparece na sua
                        Carteira é o que está ou será transferido para a sua conta de recebimentos no Stripe, e de lá para a sua conta
                        bancária, nos prazos do Stripe.
                    </li>
                    <li>
                        <strong>Vendas:</strong> em cada venda são descontados do vendedor (1) a taxa de pagamento, de 3,99% + R$ 0,39,
                        que cobre a operadora do cartão, e (2) a comissão do destaque escolhido ao anunciar: 0% no Gratuito, 2% no
                        Básico, 5% no Avançado e 7% no Topo. As duas são calculadas sobre o preço do produto (o frete não entra) e
                        aparecem para o vendedor antes de publicar. O restante vai para o vendedor quando o valor é liberado. O preço
                        mínimo de um anúncio é R$ 5,00.
                    </li>
                    <li><strong>Eventos pagos:</strong> 90% de cada inscrição vai para o organizador quando ele encerra o evento.</li>
                    <li><strong>Anúncios:</strong> 55% do valor de cada exibição vai para o criador do vídeo.</li>
                    <li>
                        Para receber, é preciso concluir o cadastro da conta de recebimentos no Stripe (pela Carteira). As tarifas do
                        próprio Stripe para depósito em banco, quando houver, seguem a tabela dele.
                    </li>
                    <li>Os valores das taxas podem mudar; a mudança vale só para operações feitas depois do aviso no app.</li>
                </ul>
            </Secao>

            <Secao id="eventos" titulo="6. Eventos">
                <ul>
                    <li>
                        O organizador é o responsável pelo evento: local, segurança, autorizações, regras, premiação e comunicação com os
                        participantes.
                    </li>
                    <li>Se o organizador cancelar o evento, as inscrições pagas são reembolsadas automaticamente.</li>
                    <li>
                        Eventos com menos inscritos que o mínimo definido quando o prazo de inscrição termina são cancelados e reembolsados
                        automaticamente.
                    </li>
                    <li>A capa do evento deve ser uma imagem própria ou que o organizador tenha permissão para usar.</li>
                </ul>
            </Secao>

            <Secao id="conteudo" titulo="7. Vídeos e conteúdo">
                <ul>
                    <li>
                        O conteúdo que você publica continua sendo seu. Você nos dá uma licença gratuita e não exclusiva para exibir,
                        armazenar e divulgar esse conteúdo dentro do app enquanto ele estiver publicado.
                    </li>
                    <li>
                        Você garante que tem os direitos sobre tudo que publica (imagens, vídeos, músicas, marcas). Conteúdo de terceiros sem
                        permissão será removido após denúncia.
                    </li>
                    <li>
                        Se você é dono de um conteúdo publicado sem autorização, envie a denúncia pelo botão Denunciar ou pela{" "}
                        <Link href="/ajuda/contato">Central de Ajuda</Link>, informando o link e por que o conteúdo é seu.
                    </li>
                </ul>
            </Secao>

            <Secao id="anuncios" titulo="8. Anúncios nos vídeos">
                <ul>
                    <li>
                        O anúncio é um vídeo de até 60 segundos exibido antes dos vídeos de criadores monetizados. A pessoa pode pular
                        depois de 5 segundos.
                    </li>
                    <li>
                        Para anunciar, a conta precisa ter e-mail confirmado, pelo menos 7 dias de cadastro, estar em dia (sem
                        suspensão) e sem denúncias procedentes recentes. A primeira campanha tem orçamento de até R$ 1.000,00; o limite
                        sobe depois da primeira aprovada. Cada conta pode ter até 2 campanhas em análise ao mesmo tempo.
                    </li>
                    <li>
                        <strong>Toda campanha é revisada pela equipe antes de ir ao ar.</strong> Recusamos anúncios enganosos ou abusivos
                        (Código de Defesa do Consumidor, art. 37), com promessas sem comprovação, de produtos proibidos, com conteúdo
                        impróprio ou com material de terceiros sem permissão.
                    </li>
                    <li>
                        O anunciante é responsável pelo conteúdo do anúncio e pelo que oferece no link de destino, e precisa ter
                        comprovação das afirmações que faz.
                    </li>
                    <li>
                        Cobramos por mil exibições. Uma exibição conta quando o anúncio passa pelo menos 5 segundos; repetições da mesma
                        pessoa no mesmo vídeo em 24 horas não contam. O orçamento é pago antes e consumido conforme as exibições.
                    </li>
                    <li>Campanha recusada tem o valor devolvido integralmente.</li>
                </ul>
            </Secao>

            <Secao id="monetizacao" titulo="9. Monetização">
                <ul>
                    <li>
                        A liberação da monetização é decidida pelo Imperium Bikes e revista periodicamente. Ela considera vários
                        fatores, entre eles audiência e engajamento reais do canal, regularidade das publicações, tempo e situação da
                        conta, histórico de denúncias procedentes e a disponibilidade de anunciantes. Os critérios exatos não são
                        divulgados, para não estimular números artificiais, e podem mudar sem aviso.
                    </li>
                    <li>
                        Cumprir números de audiência não garante a liberação, e o canal liberado pode perdê-la se deixar de atender aos
                        critérios. A conta de recebimentos do Stripe precisa estar conectada.
                    </li>
                    <li>
                        Os ganhos de cada exibição ficam &quot;a liberar&quot; por 30 dias antes de entrar no saldo disponível. Esse prazo é
                        para confirmar as exibições e o pagamento do anunciante. Exibições invalidadas nesse período não são pagas.
                    </li>
                    <li>
                        <strong>O criador ganha somente com anúncios exibidos antes dos seus vídeos.</strong> Visualizações, inscritos e
                        curtidas não geram pagamento por si só. Não há valor mínimo garantido de ganhos.
                    </li>
                    <li>O saque mínimo é de R$ 50,00 e vai pelo Stripe para a sua conta de recebimentos.</li>
                    <li>
                        Exibições geradas por fraude (robôs, contas falsas, troca de visualizações) não são pagas, e os valores podem ser
                        estornados.
                    </li>
                </ul>
            </Secao>

            <Secao id="moderacao" titulo="10. Denúncias e moderação">
                <p>
                    Produtos, vídeos, eventos e posts entram no ar na hora. Qualquer pessoa pode denunciar o que violar estes Termos, e a
                    equipe analisa as denúncias e pode remover o conteúdo, avisando quem publicou e o motivo. Anúncios pagos são a
                    exceção: passam por revisão antes de serem exibidos.
                </p>
            </Secao>

            <Secao id="responsabilidade" titulo="11. Responsabilidades">
                <ul>
                    <li>
                        Trabalhamos para manter o app no ar e seguro, mas ele pode ter interrupções para manutenção ou por falhas de
                        fornecedores.
                    </li>
                    <li>
                        O app está em versão beta (fase de testes): algumas funções podem mudar ou apresentar erros. Se encontrar um
                        problema, avise pela <Link href="/ajuda/contato">Central de Ajuda</Link>. Pagamentos e pedidos continuam protegidos
                        como descrito nestes Termos.
                    </li>
                    <li>
                        Não respondemos pelo que é de responsabilidade exclusiva de outro usuário (como a qualidade do produto de um
                        vendedor ou a realização de um evento), sem prejuízo dos direitos garantidos pelo Código de Defesa do Consumidor.
                    </li>
                    <li>
                        O app oferece meios de proteção (pagamento retido, código de retirada, disputa, avisos no chat). Quem os contorna,
                        por exemplo pagando por fora ou entregando o código antes de conferir o produto, assume o risco dessa escolha.
                    </li>
                    <li>
                        Quem cometer fraude, golpe, furto, roubo ou outro crime usando o app responde pessoalmente por ele. Guardamos os
                        registros de acesso exigidos pelo Marco Civil da Internet e, junto com cadastro, conversas, pedidos e pagamentos,
                        podemos fornecê-los às autoridades e à vítima nos termos da lei, inclusive por ordem judicial.
                    </li>
                </ul>
            </Secao>

            <Secao id="encerramento" titulo="12. Suspensão e encerramento">
                <p>
                    Podemos suspender ou encerrar contas que violem estes Termos ou a lei, com aviso do motivo. Valores legítimos já
                    devidos a você continuam sendo repassados, salvo os ligados a fraude ou a disputas em aberto.
                </p>
            </Secao>

            <Secao id="geral" titulo="13. Disposições gerais">
                <p>
                    Estes Termos seguem a lei brasileira. Se você é consumidor, pode recorrer ao foro do seu domicílio. Mudanças importantes
                    são avisadas no app antes de valer. Dúvidas: <Link href="/ajuda">Central de Ajuda</Link>
                    {empresa.emailContato ? <> ou <a href={`mailto:${empresa.emailContato}`}>{empresa.emailContato}</a></> : null}.
                </p>
            </Secao>
        </Documento>
    )
}
