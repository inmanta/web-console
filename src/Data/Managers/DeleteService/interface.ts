import { ServiceIdentifier } from "@/Core/Domain";
import { Maybe } from "@/Core/Language";

export interface DeleteService extends ServiceIdentifier {
  kind: "DeleteService";
}

export interface DeleteServiceManifest {
  error: string;
  apiData: string;
  body: null;
  command: DeleteService;
  trigger: () => Promise<Maybe.Type<string>>;
}
