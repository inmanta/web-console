import { Either } from "@/Core/Language";
import { TokenInfo } from "@/Core/Domain";

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
