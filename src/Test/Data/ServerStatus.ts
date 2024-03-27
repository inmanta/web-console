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
  features: [
    {
      slice: "lsm.service_catalog",
      name: "supported_lifecycles",
      value: ["*"],
    },
    {
      slice: "lsm.order",
      name: "order_api",
      value: false,
    },
    {
      slice: "ui.ui",
      name: "smart_composer",
      value: false,
    },
    {
      slice: "core.resource",
      name: "resource_discovery",
      value: false,
    },
  ],
};

export const withoutFeatures = base;

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

export const withoutSupport = base;

export const withSupport: ServerStatus = {
  ...base,
  extensions: [
    ...base.extensions,
    {
      name: "support",
      version: "1.3.3.dev20210927032639",
      package: "support",
    },
  ],
};

export const withAllFeatures: ServerStatus = {
  ...base,
  extensions: [
    ...base.extensions,
    {
      name: "lsm",
      version: "1.6.0.dev20210219121525",
      package: "lsm",
    },
  ],
  features: [
    {
      slice: "lsm.service_catalog",
      name: "supported_lifecycles",
      value: ["*"],
    },
    {
      slice: "lsm.order",
      name: "order_api",
      value: true,
    },
    {
      slice: "ui.ui",
      name: "smart_composer",
      value: true,
    },
    {
      slice: "core.resource",
      name: "resource_discovery",
      value: true,
    },
  ],
};

export const supportArchiveBase64 =
  "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";
