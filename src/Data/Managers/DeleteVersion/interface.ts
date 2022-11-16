import { Maybe, ParsedNumber } from "@/Core/Language";
import { Query } from "../../../Core/Query";

export interface DeleteVersion {
  kind: "DeleteVersion";
  version: ParsedNumber;
}

export interface DeleteVersionManifest {
  error: string;
  apiData: undefined;
  body: null;
  command: DeleteVersion;
  trigger: (
    query: Query.SubQuery<"GetDesiredStates">
  ) => Promise<Maybe.Type<string>>;
}
