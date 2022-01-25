import { Maybe } from "@/Core/Language";

export interface CreateProject {
  kind: "CreateProject";
}
export interface CreateProjectManifest {
  error: string;
  apiData: string;
  body: { name: string };
  command: CreateProject;
  trigger: (name: string) => Promise<Maybe.Type<string>>;
}
