// types/pedido.ts
export interface PedidoResponse {
  id: string;
  status: string;
  valor: number;
  clientSecret?: string;
}