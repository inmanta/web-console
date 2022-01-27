import { Fact } from "@/Core/Domain/Fact";

export interface GetResourceFacts {
  kind: "GetResourceFacts";
  resourceId: string;
}

export interface GetResourceFactsManifest {
  error: string;
  apiResponse: { data: Fact[] };
  data: Fact[];
  usedData: Fact[];
  query: GetResourceFacts;
}
