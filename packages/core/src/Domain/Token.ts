export type ClientType = "api" | "agent" | "compiler";

export interface TokenInfo {
  client_types: ClientType[];

  /**
   * When false, the generated token is registered in the token registry and can be individually
   * revoked. When true (the default), the token is reproducible and stateless (not revocable).
   */
  idempotent?: boolean;

  /**
   * The lifetime of the token in seconds. When not set, the server's signing configuration governs
   * the expiry. Only valid for non-idempotent (revocable) tokens.
   */
  expire?: number;
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
  revoked_at: string | null;
  last_used: string | null;
}
