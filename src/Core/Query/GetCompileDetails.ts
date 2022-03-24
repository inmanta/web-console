import { CompileDetails } from "@/Core/Domain";

export interface GetCompileDetails {
  kind: "GetCompileDetails";
  id: string;
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
