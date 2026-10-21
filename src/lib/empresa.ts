/**
 * Dados legais do responsável pelo site. Aparecem no rodapé, na Política de Privacidade e nos Termos.
 *
 * O Código de Defesa do Consumidor (Decreto 7.962/2013, art. 2º) exige nome, CNPJ ou CPF,
 * endereço e contato em sites de venda, e a LGPD exige identificar o controlador e o
 * encarregado (art. 9º e 41). Campo vazio não aparece.
 * Ao abrir a empresa: preencha razaoSocial e cnpj e apague o cpf.
 */
export const empresa = {
    marca: "Imperium Bikes",
    /** Nome empresarial (razão social) ou, sem empresa aberta, o nome do responsável. */
    razaoSocial: "Kelvin Lopes de Oliveira",
    /** CNPJ no formato 00.000.000/0000-00, quando a empresa for aberta. */
    cnpj: "",
    /** Enquanto não houver CNPJ (pessoa física). */
    cpf: "",
    /** Endereço completo: rua, número, bairro, cidade/UF, CEP. */
    endereco: "",
    /** E-mail de atendimento. */
    emailContato: "imperiumbikes@gmail.com",
    /** Encarregado de dados (LGPD): quem responde pedidos sobre dados pessoais. */
    encarregadoNome: "Kelvin Lopes de Oliveira",
    encarregadoEmail: "imperiumbikes@gmail.com",
    site: "https://www.imperiumbikes0.com.br",
} as const

/** Data da última revisão dos documentos legais (mostrada no topo de cada um). */
export const REVISAO_DOCUMENTOS = "21 de outubro de 2026"

/** "CNPJ ..." ou, sem empresa aberta, "CPF ...". */
export function documentoEmpresa(): string {
    return empresa.cnpj ? `CNPJ ${empresa.cnpj}` : empresa.cpf ? `CPF ${empresa.cpf}` : ""
}

/** "Imperium Bikes (Nome, CPF/CNPJ ...)" com o que estiver preenchido. */
export function identificacaoEmpresa(): string {
    const partes = [empresa.razaoSocial, documentoEmpresa()].filter(Boolean)
    return partes.length ? `${empresa.marca} (${partes.join(", ")})` : empresa.marca
}

/** Para onde mandar pedidos de privacidade: encarregado, senão o contato, senão a Central de Ajuda. */
export function contatoPrivacidade(): { texto: string; href: string } {
    const email = empresa.encarregadoEmail || empresa.emailContato
    return email ? { texto: email, href: `mailto:${email}` } : { texto: "Central de Ajuda", href: "/ajuda/contato" }
}
