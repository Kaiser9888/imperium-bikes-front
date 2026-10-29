import type { Metadata } from "next"
import Link from "next/link"

import { Documento, Secao } from "@/components/legal/documento"
import { contatoPrivacidade, empresa, identificacaoEmpresa } from "@/lib/empresa"

export const metadata: Metadata = {
    title: "Política de Privacidade | Imperium Bikes",
    description: "Quais dados pessoais o Imperium Bikes trata, para quê, com quem compartilha e como exercer seus direitos (LGPD).",
}

const secoes = [
    { id: "quem-somos", titulo: "Quem cuida dos seus dados" },
    { id: "dados", titulo: "Dados que tratamos" },
    { id: "finalidades", titulo: "Para que usamos e base legal" },
    { id: "compartilhamento", titulo: "Com quem compartilhamos" },
    { id: "internacional", titulo: "Transferência internacional" },
    { id: "cookies", titulo: "Cookies e armazenamento local" },
    { id: "retencao", titulo: "Por quanto tempo guardamos" },
    { id: "direitos", titulo: "Seus direitos" },
    { id: "seguranca", titulo: "Segurança" },
    { id: "menores", titulo: "Crianças e adolescentes" },
    { id: "mudancas", titulo: "Mudanças nesta política" },
]

export default function PrivacidadePage() {
    const contato = contatoPrivacidade()
    const linkContato = contato.href.startsWith("mailto:") ? (
        <a href={contato.href}>{contato.texto}</a>
    ) : (
        <Link href={contato.href}>{contato.texto}</Link>
    )

    return (
        <Documento
            titulo="Política de Privacidade"
            resumo="Como tratamos seus dados pessoais, em linguagem direta, conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018)."
            secoes={secoes}
        >
            <Secao id="quem-somos" titulo="1. Quem cuida dos seus dados">
                <p>
                    O controlador dos dados é <strong>{identificacaoEmpresa()}</strong>
                    {empresa.endereco ? `, com endereço em ${empresa.endereco}` : ""}, responsável pelo site e app {empresa.marca}.
                </p>
                <p>
                    Encarregado pelo tratamento de dados (LGPD, art. 41):{" "}
                    {empresa.encarregadoNome ? <strong>{empresa.encarregadoNome}</strong> : "atendimento de privacidade"} — {linkContato}.
                </p>
            </Secao>

            <Secao id="dados" titulo="2. Dados que tratamos">
                <p>Só pedimos o que é necessário para cada função. Em resumo:</p>
                <ul>
                    <li>
                        <strong>Cadastro:</strong> nome, e-mail, foto de perfil e, se você confirmar, telefone. O login é feito pelo
                        Clerk; nós não vemos nem guardamos a sua senha.
                    </li>
                    <li>
                        <strong>Perfil público (opcional):</strong> bio, cidade, estado e patrocinadores que você mesmo preencher.
                    </li>
                    <li>
                        <strong>Compras e vendas:</strong> produtos anunciados, pedidos, CEP e dados de entrega usados para calcular e
                        enviar o frete, e o histórico de disputas. Numa compra com envio, o nome, endereço, telefone e CPF de quem recebe
                        são mostrados só ao vendedor daquele pedido, para ele gerar a etiqueta da transportadora (o telefone e o CPF
                        deixam de aparecer para ele quando o pedido é enviado).
                    </li>
                    <li>
                        <strong>Pagamentos:</strong> o pagamento é feito na página do Stripe. Os dados do cartão (ou do Pix/boleto, quando
                        disponíveis) vão direto para o Stripe e não passam pelos nossos servidores. Guardamos o valor, a situação e o
                        identificador da transação.
                    </li>
                    <li>
                        <strong>Recebimentos (vendedores, organizadores e criadores):</strong> a conta de recebimentos é criada no Stripe,
                        que pede os dados exigidos por lei (como CPF/CNPJ e conta bancária) diretamente a você. Nós guardamos só o
                        identificador dessa conta e se o cadastro foi concluído.
                    </li>
                    <li>
                        <strong>Conteúdo que você publica:</strong> fotos, vídeos, comentários, posts na Comunidade, eventos, campanhas de
                        anúncio e mensagens do chat.
                    </li>
                    <li>
                        <strong>Uso e segurança:</strong> endereço IP, tipo de navegador, data e hora de acesso, visualizações de vídeos e
                        exibições de anúncios. Para quem não está logado, a contagem de visualizações usa um código derivado do IP e do
                        navegador, sem identificar a pessoa pelo nome.
                    </li>
                </ul>
                <p>Não tratamos dados sensíveis (como saúde, religião ou biometria) e não pedimos documentos de identidade.</p>
            </Secao>

            <Secao id="finalidades" titulo="3. Para que usamos e base legal">
                <ul>
                    <li>
                        <strong>Criar e manter sua conta, intermediar compras, vendas, inscrições em eventos e anúncios, calcular frete e
                        repassar valores</strong> — execução do contrato (art. 7º, V).
                    </li>
                    <li>
                        <strong>Guardar pedidos e pagamentos, emitir comprovantes e atender autoridades</strong> — cumprimento de obrigação
                        legal (art. 7º, II).
                    </li>
                    <li>
                        <strong>Prevenir fraude, spam e abuso (limite de requisições, conferência de exibições de anúncios, moderação de
                        denúncias)</strong> — legítimo interesse e proteção do crédito (art. 7º, IX e X).
                    </li>
                    <li>
                        <strong>Avisos dentro do app (notificações de pedidos, mensagens, inscritos, respostas do suporte)</strong> —
                        execução do contrato.
                    </li>
                    <li>
                        <strong>Estatísticas de uso do site</strong> — consentimento (art. 7º, I), que você pode recusar ou retirar a
                        qualquer momento no aviso de cookies.
                    </li>
                </ul>
                <p>Não vendemos dados pessoais e não usamos seus dados para publicidade de terceiros fora do app.</p>
            </Secao>

            <Secao id="compartilhamento" titulo="4. Com quem compartilhamos">
                <p>Compartilhamos dados apenas com fornecedores que operam funções do app, e só o necessário para cada uma:</p>
                <ul>
                    <li><strong>Clerk</strong> — login e gestão da conta.</li>
                    <li><strong>Stripe</strong> — pagamentos, reembolsos e repasses para vendedores, organizadores e criadores.</li>
                    <li><strong>Mux</strong> — armazenamento e reprodução de vídeos e lives, com métricas técnicas de qualidade da reprodução (sem cookies).</li>
                    <li><strong>Stream</strong> — chat entre usuários.</li>
                    <li><strong>Melhor Envio</strong> — cotação e envio de fretes.</li>
                    <li><strong>Vercel</strong> — hospedagem do site e estatísticas de uso (quando você aceita).</li>
                    <li><strong>Google Analytics</strong> — estatísticas de uso do site, como páginas vistas, origem da visita e tipo de aparelho (quando você aceita).</li>
                    <li><strong>Render</strong> — hospedagem do servidor.</li>
                    <li><strong>Neon</strong> — banco de dados.</li>
                    <li><strong>Resend</strong> — envio de e-mails do app (avisos de conta e de pedidos).</li>
                    <li><strong>Sentry</strong> — registro de erros técnicos do site e do servidor, para corrigirmos falhas (sem cookies).</li>
                </ul>
                <p>
                    Entre usuários: o seu nome, foto e perfil público aparecem para os outros. Numa compra, o vendedor recebe os dados
                    necessários para entregar o pedido. O organizador de um evento vê a lista de inscritos.
                </p>
                <p>Também podemos fornecer dados quando houver ordem judicial ou requisição de autoridade competente.</p>
            </Secao>

            <Secao id="internacional" titulo="5. Transferência internacional">
                <p>
                    Alguns desses fornecedores guardam dados fora do Brasil (principalmente nos Estados Unidos e na União Europeia). A
                    transferência se apoia nas garantias contratuais de proteção de dados oferecidas por eles (LGPD, art. 33).
                </p>
            </Secao>

            <Secao id="cookies" titulo="6. Cookies e armazenamento local">
                <ul>
                    <li>
                        <strong>Necessários:</strong> mantêm você logado (cookies do Clerk) e protegem o pagamento (Stripe, na página do
                        checkout). Sem eles o app não funciona, por isso não dependem de consentimento.
                    </li>
                    <li>
                        <strong>Armazenamento no seu aparelho:</strong> carrinho, tema claro/escuro, rascunhos de anúncio e sua escolha
                        sobre cookies ficam salvos só no seu navegador.
                    </li>
                    <li>
                        <strong>Estatísticas (opcional):</strong> Vercel Web Analytics, que conta visitas de forma agregada e não usa
                        cookies, e Google Analytics, que usa cookies próprios (como <code>_ga</code>) para contar visitantes e sessões,
                        com os recursos de publicidade e Google Signals desligados. Os dois só são ativados se você aceitar no aviso de
                        cookies, e você pode mudar a escolha em &quot;Preferências de cookies&quot;, no rodapé.
                    </li>
                </ul>
                <p>O player de vídeo funciona sem cookies de rastreamento. Não usamos cookies de publicidade de terceiros.</p>
            </Secao>

            <Secao id="retencao" titulo="7. Por quanto tempo guardamos">
                <ul>
                    <li>Dados da conta: enquanto a conta existir.</li>
                    <li>
                        Pedidos e pagamentos: pelo prazo exigido pelas leis fiscais e de consumo (em regra, 5 anos), mesmo depois de a
                        conta ser excluída — mas sem seu nome, e-mail ou contato.
                    </li>
                    <li>Registros de acesso (IP, data e hora): até 6 meses, como prevê o Marco Civil da Internet (art. 15).</li>
                </ul>
                <p>
                    Ao excluir a conta, seus dados pessoais são apagados ou anonimizados, seus anúncios e vídeos saem do ar e o seu login
                    é apagado. Comentários e posts continuam visíveis, mas como &quot;Usuário removido&quot;.
                </p>
            </Secao>

            <Secao id="direitos" titulo="8. Seus direitos">
                <p>Pela LGPD (art. 18) você pode, a qualquer momento:</p>
                <ul>
                    <li>confirmar se tratamos seus dados e ter acesso a eles;</li>
                    <li>corrigir dados incompletos ou desatualizados;</li>
                    <li>pedir anonimização, bloqueio ou eliminação de dados desnecessários;</li>
                    <li>pedir a portabilidade dos dados;</li>
                    <li>excluir sua conta e os dados tratados com base no consentimento;</li>
                    <li>saber com quem compartilhamos seus dados;</li>
                    <li>retirar o consentimento e se opor a tratamentos que considere irregulares;</li>
                    <li>pedir revisão de decisões tomadas só por meios automáticos.</li>
                </ul>
                <p>
                    Você mesmo edita o perfil e <Link href="/configuracoes#excluir-conta">exclui a conta em Configurações</Link>. Para os
                    demais pedidos, fale com {linkContato}. Respondemos em até 15 dias. Você também pode reclamar à Autoridade Nacional de
                    Proteção de Dados (ANPD).
                </p>
            </Secao>

            <Secao id="seguranca" titulo="9. Segurança">
                <p>
                    Usamos conexão criptografada (HTTPS), acesso restrito aos dados, limite de tentativas contra ataques automatizados e
                    fornecedores especializados para login e pagamentos. Nenhum sistema é 100% invulnerável; se houver um incidente que
                    possa trazer risco a você, avisaremos você e a ANPD, como manda a LGPD (art. 48).
                </p>
            </Secao>

            <Secao id="menores" titulo="10. Crianças e adolescentes">
                <p>
                    O app não é destinado a crianças. Para criar conta é preciso ter 18 anos, ou ter entre 16 e 18 anos com autorização
                    do responsável legal. Vender, organizar eventos pagos, anunciar e monetizar vídeos são só para maiores de 18 anos.
                </p>
            </Secao>

            <Secao id="mudancas" titulo="11. Mudanças nesta política">
                <p>
                    Se mudarmos algo importante, avisaremos no app antes de a mudança valer. A data no topo mostra a última atualização.
                    Veja também os <Link href="/termos">Termos de Uso</Link> e a <Link href="/reembolso">Política de Reembolso</Link>.
                </p>
            </Secao>
        </Documento>
    )
}
