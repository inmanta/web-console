import { ProjectModel } from "@/Core/Domain";

export interface GetProjects {
  kind: "GetProjects";
}

export interface GetProjectsManifest {
  error: string;
  apiResponse: { data: ProjectModel[] };
  data: ProjectModel[];
  usedData: ProjectModel[];
  query: GetProjects;
}
