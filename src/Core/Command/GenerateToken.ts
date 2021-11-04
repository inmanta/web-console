import { Either } from "@/Core/Language";

type ClientType = "api" | "agent" | "compiler";

interface TokenInfo {
  client_types: ClientType[];
  idempotent: boolean;
}

export interface GenerateToken {
  kind: "GenerateToken";
}

export interface GenerateTokenManifest {
  error: string;
  apiData: { data: string };
  body: TokenInfo;
  command: GenerateToken;
  trigger: (info: TokenInfo) => Promise<Either.Type<string, string>>;
}
