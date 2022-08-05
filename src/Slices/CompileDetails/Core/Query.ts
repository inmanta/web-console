import { CompileDetails } from "./Domain";

export interface Query {
  kind: "GetCompileDetails";
  id: string;
}

export interface Manifest {
  error: string;
  apiResponse: {
    data: CompileDetails;
  };
  data: CompileDetails;
  usedData: CompileDetails;
  query: Query;
}
