import { Fact } from "@/Core/Domain";
import { EncodableParam } from "..";

export interface GetResourceFacts {
  kind: "GetResourceFacts";
  resourceId: EncodableParam;
}

export interface GetResourceFactsManifest {
  error: string;
  apiResponse: { data: Fact[] };
  data: Fact[];
  usedData: Fact[];
  query: GetResourceFacts;
}
