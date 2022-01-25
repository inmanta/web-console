import { Maybe } from "@/Core/Language";

interface Body {
  update: boolean;
  metadata: {
    type: string;
    message: string;
  };
}

export interface TriggerCompile {
  kind: "TriggerCompile";
}

export interface TriggerCompileManifest {
  error: string;
  apiData: undefined;
  body: Body;
  command: TriggerCompile;
  trigger: (update: boolean) => Promise<Maybe.Type<string>>;
}
