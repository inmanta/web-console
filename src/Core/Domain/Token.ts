export type ClientType = "api" | "agent" | "compiler";

export interface TokenInfo {
  client_types: ClientType[];
}
