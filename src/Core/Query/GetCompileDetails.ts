import { CompileDetails } from "@/Core/Domain";
import { WithId } from "@/Core/Language";

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
