// types/contaConectada.ts
export interface ContaConectadaResponse {
  temConta: boolean;
  onboardingCompleto: boolean;
  /** Cadastro enviado e o Stripe conferindo: não mandar de volta ao formulário. */
  emAnalise?: boolean;
  onboardingUrl?: string;
}