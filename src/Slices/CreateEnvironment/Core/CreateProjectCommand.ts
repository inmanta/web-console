import { ProjectModel } from "@/Core/Domain";

export interface Command {
  kind: "CreateProject";
}
export interface Manifest {
  error: string;
  apiData: string;
  body: { name: string };
  command: Command;
  trigger: (
    name: string
  ) => Promise<{ kind: "error"; message: string } | { kind: "success"; data: ProjectModel }>;
}
