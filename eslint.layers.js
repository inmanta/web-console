import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * The layers of the composition architecture (#7451), mapped onto today's folders. Each layer
 * only imports from the layers below it:
 *
 * | Layer    | May import                        |
 * | -------- | --------------------------------- |
 * | core     | vendor libraries only             |
 * | ui       | core                              |
 * | shell    | core, ui                          |
 * | features | core, ui, their own files         |
 * | app      | everything (it composes the rest) |
 *
 * Every slice and every folder in `src/Features` belongs to exactly one feature or to the shell.
 * A new one has to be added here, or linting fails.
 */

/**
 * The folder the paths below are relative to: the root of the repository.
 */
export const basePath = dirname(fileURLToPath(import.meta.url));

const inRoot = (path) => resolve(basePath, path);

const core = [
  "./src/Core",
  "./src/Data",
  "./src/UI/Dependency",
  "./src/UI/Routing",
  "./src/dayjs.ts",
];

const ui = [
  ...readdirSync(inRoot("./src/UI/Components"), { withFileTypes: true })
    .filter((entry) => entry.name !== "Composer")
    .map((entry) => `./src/UI/Components/${entry.name}`),
  "./src/UI/Presenters",
  "./src/UI/Styles",
  "./src/UI/Utils",
];

const shellSlices = ["Login", "NotFound", "Notification", "Status"];

const shell = [
  "./src/UI/Root",
  "./src/Injector.tsx",
  ...shellSlices.map((slice) => `./src/Slices/${slice}`),
];

const app = ["./src/index.tsx", "./src/appFeatures.ts"];

/**
 * The folders of each feature: its slices, its folder in `src/Features` and any other folder it
 * owns.
 */
const features = {
  composer: {
    folder: "Composer",
    slices: ["InstanceComposerCreator", "InstanceComposerEditor", "InstanceComposerViewer"],
    other: ["./src/UI/Components/Composer"],
  },
  environment: {
    folder: "Environment",
    slices: ["CreateEnvironment", "Dashboard", "Settings"],
  },
  graphiql: {
    folder: "GraphiQL",
    slices: ["GraphiQL"],
  },
  lsm: {
    folder: "Lsm",
    slices: [
      "CreateInstance",
      "Diagnose",
      "DuplicateInstance",
      "EditInstance",
      "Events",
      "MarkdownPreviewer",
      "OrderDetails",
      "Orders",
      "ServiceCatalog",
      "ServiceDetails",
      "ServiceInstanceDetails",
      "ServiceInventory",
    ],
  },
  "orchestration-engine": {
    folder: "OrchestrationEngine",
    slices: [
      "CompileDetails",
      "CompileReports",
      "ComplianceCheck",
      "DesiredState",
      "DesiredStateCompare",
      "DesiredStateDetails",
      "DesiredStateResourceDetails",
      "Parameters",
    ],
  },
  "resource-manager": {
    folder: "ResourceManager",
    slices: [
      "Agents",
      "Facts",
      "Resource",
      "ResourceDetails",
      "ResourceDiscovery",
      "ResourceDiscoveryDetails",
    ],
  },
  "user-management": {
    folder: "UserManagement",
    slices: ["UserManagement"],
  },
};

const featurePaths = Object.fromEntries(
  Object.entries(features).map(([name, { folder, slices, other = [] }]) => [
    name,
    [`./src/Features/${folder}`, ...slices.map((slice) => `./src/Slices/${slice}`), ...other],
  ])
);

const allFeatures = Object.values(featurePaths).flat();

const assertAllAssigned = (directory, assigned) => {
  const missing = readdirSync(inRoot(directory), { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !assigned.includes(entry.name))
    .map((entry) => `${directory}/${entry.name}`);

  if (missing.length > 0) {
    throw new Error(`eslint.layers.js: assign ${missing.join(", ")} to a layer.`);
  }
};

assertAllAssigned("./src/Slices", [
  ...shellSlices,
  ...Object.values(features).flatMap(({ slices }) => slices),
]);
assertAllAssigned(
  "./src/Features",
  Object.values(features).map(({ folder }) => folder)
);

for (const path of [...core, ...ui, ...shell, ...app, ...allFeatures]) {
  if (!existsSync(inRoot(path))) {
    throw new Error(`eslint.layers.js: ${path} does not exist.`);
  }
}

const testUtils = ["./src/Test"];

/**
 * The zones of `import/no-restricted-paths` that enforce the layers.
 */
export const importBoundaryZones = [
  {
    target: core,
    from: [...ui, ...shell, ...allFeatures, ...app, ...testUtils],
    message: "The web-console core layer only imports vendor libraries and its own code.",
  },
  {
    target: ui,
    from: [...shell, ...allFeatures, ...app, ...testUtils],
    message:
      "Shared components only import the web-console core layer and other shared components.",
  },
  {
    target: shell,
    from: [...allFeatures, ...app, ...testUtils],
    message:
      "The shell only imports the web-console core layer and shared components. It gets the features from the app.",
  },
  ...Object.entries(featurePaths).map(([name, paths]) => ({
    target: paths,
    from: [...shell, ...allFeatures.filter((path) => !paths.includes(path)), ...app, ...testUtils],
    message: `The ${name} feature only imports the web-console core layer, shared components and its own code. Move code that features share into one of those.`,
  })),
];
