import { Maybe, ParsedNumber } from "@/Core/Language";
import { Query } from "@/Core/Query";

export interface PromoteVersion {
  kind: "PromoteVersion";
  version: ParsedNumber;
}

export interface PromoteVersionManifest {
  error: string;
  apiData: undefined;
  body: null;
  command: PromoteVersion;
  trigger: (
    query: Query.SubQuery<"GetDesiredStates">,
  ) => Promise<Maybe.Type<string>>;
}
