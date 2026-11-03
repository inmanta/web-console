#!/usr/bin/env node
/**
 * Builds dist/sbom.cdx.json from the two SBOMs that `yarn build:sbom` generates.
 *
 * Since the packages are Yarn workspaces (#7461), the root package.json only lists the tools,
 * and what ships comes from apps/web-console and the packages it depends on. The CycloneDX
 * plugin only follows the dependencies of the workspace it runs in, so:
 * - the SBOM of apps/web-console has the components and their dependency graph;
 * - the SBOM of the root has the main component: @inmanta/web-console with its version,
 *   licence and links, as the published package and earlier SBOMs have it.
 *
 * This keeps the root's metadata and swaps in the app's components and dependency graph, with
 * the app's main component replaced by the root's. The two input files are removed afterwards.
 */
import { readFileSync, rmSync, writeFileSync } from "fs";

const appFile = "dist/sbom-app.cdx.json";
const rootFile = "dist/sbom-root.cdx.json";
const outFile = "dist/sbom.cdx.json";

const appSbom = JSON.parse(readFileSync(appFile, "utf8"));
const rootSbom = JSON.parse(readFileSync(rootFile, "utf8"));

const appRef = appSbom.metadata.component["bom-ref"];
const rootRef = rootSbom.metadata.component["bom-ref"];
const toRootRef = (ref) => (ref === appRef ? rootRef : ref);

const sbom = {
  ...rootSbom,
  components: appSbom.components,
  dependencies: appSbom.dependencies.map((dependency) => ({
    ...dependency,
    ref: toRootRef(dependency.ref),
    ...(dependency.dependsOn && { dependsOn: dependency.dependsOn.map(toRootRef) }),
  })),
};

writeFileSync(outFile, JSON.stringify(sbom, null, 2) + "\n");
rmSync(appFile);
rmSync(rootFile);

console.log(
  `${outFile}: ${sbom.metadata.component.name}@${sbom.metadata.component.version}, ${sbom.components.length} components`
);
