import { ProjectModel } from "@/Core";
import * as Environment from "./Environment";

export const a: ProjectModel = {
  id: "project_id_a",
  name: "project_name_a",
  environments: [Environment.a],
};

export const b: ProjectModel = {
  id: "project_id_c",
  name: "project_name_c",
  environments: [Environment.b, Environment.c],
};

export const c: ProjectModel = {
  id: "project_id_c",
  name: "project_name_c",
  environments: [Environment.d],
};

export const d: ProjectModel = {
  id: "project_id_d",
  name: "project_name_d",
  environments: [Environment.e],
};

export const list = [a, b, c, d];
