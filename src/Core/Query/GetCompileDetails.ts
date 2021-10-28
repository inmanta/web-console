import { WithId } from "@/Core/Language";
import { CompileDetails } from "@/Core/Domain";

export interface GetCompileDetails extends WithId {
  kind: "GetCompileDetails";
}

export interface GetCompileDetailsManifest {
  error: string;
  apiResponse: {
    data: CompileDetails;
  };
  data: CompileDetails;
  usedData: CompileDetails;
  query: GetCompileDetails;
}
