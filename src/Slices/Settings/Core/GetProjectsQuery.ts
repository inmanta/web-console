import { ProjectModel } from "@/Core/Domain";

export interface Query {
  kind: "GetProjects";
  environmentDetails: boolean;
}

export interface Manifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: ProjectModel[];
  usedData: ProjectModel[];
  query: Query;
}
