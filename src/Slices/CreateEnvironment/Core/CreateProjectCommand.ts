import { ProjectModel } from "@/Core/Domain";
import { Either } from "@/Core/Language";

export interface Command {
  kind: "CreateProject";
}
export interface Manifest {
  error: string;
  apiData: string;
  body: { name: string };
  command: Command;
  trigger: (
    name: string,
  ) => Promise<Either.Type<string, { data: ProjectModel }>>;
}
