import { ServerStatus } from "@/Core";

const base: ServerStatus = {
  product: "Inmanta Service Orchestrator",
  edition: "Standard Edition",
  version: "4.2.2.dev20210927032634",
  license: "Inmanta EULA",
  extensions: [
    {
      name: "core",
      version: "4.3.1.dev20210927032747",
      package: "core",
    },
  ],
  slices: [],
  features: [],
};

export const withoutLsm = base;

export const withLsm: ServerStatus = {
  ...base,
  extensions: [
    ...base.extensions,
    {
      name: "lsm",
      version: "1.6.0.dev20210219121525",
      package: "lsm",
    },
  ],
};
