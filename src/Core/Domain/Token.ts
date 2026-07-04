export type ClientType = "api" | "agent" | "compiler";

export interface TokenInfo {
  client_types: ClientType[];

  /**
   * When false, the generated token is registered in the token registry and can be individually
   * revoked. When true (the default), the token is reproducible and stateless (not revocable).
   */
  idempotent?: boolean;
}

/**
 * A registered (revocable) token as returned by the token registry.
 */
export interface Token {
  jti: string;
  created_by: string | null;
  client_types: string[];
  environment: string | null;
  issued_at: string;
  expires_at: string | null;
  revoked: boolean;
  last_used: string | null;
}
