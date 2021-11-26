import { Fact } from "@/Core/Domain/Fact";

export interface GetFacts {
  kind: "GetFacts";
  resourceId: string;
}

export interface GetFactsManifest {
  error: string;
  apiResponse: { data: Fact[] };
  data: Fact[];
  usedData: Fact[];
  query: GetFacts;
}
