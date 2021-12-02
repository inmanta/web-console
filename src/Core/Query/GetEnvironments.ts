import { FlatEnvironment, ProjectModel } from "@/Core/Domain";

export interface GetEnvironments {
  kind: "GetEnvironments";
  details: boolean;
}

export interface GetEnvironmentsManifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: FlatEnvironment[];
  usedData: FlatEnvironment[];
  query: GetEnvironments;
}
