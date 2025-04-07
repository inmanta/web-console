import { FlatEnvironment, ProjectModel } from "@/Core/Domain";

export interface GetEnvironmentsContinuous {
  kind: "GetEnvironmentsContinuous";
  details: boolean;
}

export interface GetEnvironmentsContinuousManifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: FlatEnvironment[];
  usedData: FlatEnvironment[];
  query: GetEnvironmentsContinuous;
}
