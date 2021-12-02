import { ProjectModel } from "@/Core/Domain";

export interface GetProjects {
  kind: "GetProjects";
  environmentDetails: boolean;
}

export interface GetProjectsManifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: ProjectModel[];
  usedData: ProjectModel[];
  query: GetProjects;
}
