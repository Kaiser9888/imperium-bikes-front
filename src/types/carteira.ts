// types/carteira.ts
export interface CarteiraResponse {
  id: string;
  saldoDisponivel: number;
  saldoPendente: number;
}

export interface TransacaoResponse {
  id: string;
  tipo: "VENDA_PENDENTE" | "VENDA_LIBERADA" | "ESTORNO" | "SAQUE";
  status: "PENDENTE" | "CONCLUIDA";
  valor: number;
  descricao: string;
  criadoEm: string;
}

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number; // página atual (0-indexed)
  last: boolean;
}