import { TokenInfo } from "@/Core/Domain";
import { Either } from "@/Core/Language";

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
