#!/usr/bin/env node
/**
 * Builds dist/sbom.cdx.json. The CycloneDX plugin only follows the workspace it runs in, so this
 * runs it twice: in apps/web-console for the components and their dependency graph, and at the
 * root for the main component (@inmanta/web-console with its version, licence and links). It
 * keeps the root's metadata and main component, takes the app's components and graph, and
 * removes the two intermediate files.
 *
 * Our own workspace packages are part of @inmanta/web-console, not published on their own, so
 * they aren't listed as components: their place in the graph goes to the main component.
 */
import { execSync } from "child_process";
import { readFileSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";

const plugin =
  "yarn dlx -q @cyclonedx/yarn-plugin-cyclonedx@3.4.0 --production --output-reproducible";
const appFile = resolve("dist/sbom-app.cdx.json");
const rootFile = resolve("dist/sbom-root.cdx.json");
const outFile = "dist/sbom.cdx.json";

execSync(`${plugin} -o ${JSON.stringify(appFile)}`, { cwd: "apps/web-console", stdio: "inherit" });
execSync(`${plugin} -o ${JSON.stringify(rootFile)}`, { stdio: "inherit" });

const appSbom = JSON.parse(readFileSync(appFile, "utf8"));
const rootSbom = JSON.parse(readFileSync(rootFile, "utf8"));
const rootRef = rootSbom.metadata.component["bom-ref"];

// Yarn's bom-refs of workspaces end in "@workspace:<folder>", e.g.
// "@inmanta/web-console-core@workspace:packages/core".
const isWorkspace = (ref) => ref.includes("@workspace:");
const toRootRef = (ref) => (isWorkspace(ref) ? rootRef : ref);

// The dependencies of every workspace become dependencies of the main component.
const dependsOn = new Map();
for (const { ref, dependsOn: refs = [] } of appSbom.dependencies) {
  const from = toRootRef(ref);
  const targets = dependsOn.get(from) ?? new Set();
  refs
    .map(toRootRef)
    .filter((to) => to !== from)
    .forEach((to) => targets.add(to));
  dependsOn.set(from, targets);
}

const sbom = {
  ...rootSbom,
  components: appSbom.components.filter((component) => !isWorkspace(component["bom-ref"])),
  dependencies: [...dependsOn].map(([ref, targets]) => ({ ref, dependsOn: [...targets].sort() })),
};

writeFileSync(outFile, JSON.stringify(sbom, null, 2) + "\n");
rmSync(appFile);
rmSync(rootFile);

console.log(
  `${outFile}: ${sbom.metadata.component.name}@${sbom.metadata.component.version}, ${sbom.components.length} components`
);
