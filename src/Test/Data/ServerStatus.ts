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
    {
      name: "ui",
      version: "1.3.3.dev20210927032727",
      package: "ui",
    },
    {
      name: "support",
      version: "1.3.3.dev20210927032639",
      package: "support",
    },
    {
      name: "license",
      version: "1.3.3.dev20210927032646",
      package: "license",
    },
  ],
  slices: [
    {
      name: "core.session",
      status: {
        hangtime: 22,
        interval: 30,
        sessions: 1,
      },
    },
    {
      name: "core.transport",
      status: {
        inflight: 2,
        running: true,
        sockets: ["0.0.0.0:8888"],
      },
    },
    {
      name: "lsm.database",
      status: {},
    },
    {
      name: "lsm.service_catalog",
      status: {},
    },
    {
      name: "lsm.service_inventory",
      status: {},
    },
    {
      name: "lsm.callback",
      status: {},
    },
    {
      name: "ui.ui",
      status: {},
    },
    {
      name: "support.support",
      status: {},
    },
    {
      name: "license.license",
      status: {
        projects: 1,
        environments: 2,
        service_entities: 1,
        resource_types: 12,
        resources: 185,
        licensee: "training0.inmanta.com",
        cert_valid_until: "2020-10-07T10:01:00.000000",
        entitlement_valid_until: "2021-10-07T20:06:38.000000",
      },
    },
    {
      name: "core.server",
      status: {},
    },
  ],
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
