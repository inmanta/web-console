import { ProjectModel } from "@/Core";
import * as Environment from "./Environment";

export const a: ProjectModel = {
  id: "project_id_a",
  name: "project_name_a",
  environments: [Environment.a],
};

export const b: ProjectModel = {
  id: "project_id_b",
  name: "project_name_b",
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

export const filterable: ProjectModel[] = [
  {
    name: "default",
    id: "1",
    environments: [
      {
        id: "123",
        name: "test-env1",
        project_id: "1",
        repo_branch: "master",
        repo_url: "github.com/test",
      },
      {
        id: "456",
        name: "dev-env2",
        project_id: "1",
        repo_branch: "master",
        repo_url: "github.com/test2",
      },
    ],
  },
  {
    name: "prod",
    id: "444",
    environments: [
      {
        id: "789",
        name: "test-env1",
        project_id: "444",
        repo_branch: "master",
        repo_url: "gitlab.com/test",
      },
      {
        id: "101",
        name: "env2",
        project_id: "444",
        repo_branch: "master",
        repo_url: "gitlab.com/test123",
      },
    ],
  },
];
