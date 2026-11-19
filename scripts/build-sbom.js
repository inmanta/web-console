#!/usr/bin/env node
/**
 * Builds the SBOM of each app next to its build: dist/sbom.cdx.json for the ISO app and
 * dist-oss/sbom.cdx.json for the OSS app, so each orchestrator ships the SBOM of the app it
 * installs. The CycloneDX plugin only follows the workspace it runs in, so this runs it in each
 * app's folder for the components and their dependency graph, and once at the root for the main
 * component (@inmanta/web-console with its version, licence and links). Each SBOM keeps the
 * root's metadata and main component, takes the app's components and graph, and the
 * intermediate files are removed.
 *
 * Our own workspace packages are part of @inmanta/web-console, not published on their own, so
 * they aren't listed as components: their place in the graph goes to the main component.
 */
import { execSync } from "child_process";
import { readFileSync, rmSync, writeFileSync } from "fs";

const plugin =
  "yarn dlx -q @cyclonedx/yarn-plugin-cyclonedx@3.4.0 --production --output-reproducible";
// Relative to the repository root. The commands are constants; each app's SBOM is written from
// its folder, two folders down.
const apps = [
  { dir: "apps/web-console", outDir: "dist" },
  { dir: "apps/oss", outDir: "dist-oss" },
];
const rootFile = "dist/sbom-root.cdx.json";

execSync(`${plugin} -o ${rootFile}`, { stdio: "inherit" });
const rootSbom = JSON.parse(readFileSync(rootFile, "utf8"));
const rootRef = rootSbom.metadata.component["bom-ref"];

// Yarn's bom-refs of workspaces end in "@workspace:<folder>", e.g.
// "@inmanta/web-console-core@workspace:packages/core".
const isWorkspace = (ref) => ref.includes("@workspace:");
const toRootRef = (ref) => (isWorkspace(ref) ? rootRef : ref);

for (const { dir, outDir } of apps) {
  const appFile = `${outDir}/sbom-app.cdx.json`;
  const outFile = `${outDir}/sbom.cdx.json`;

  execSync(`${plugin} -o ../../${appFile}`, { cwd: dir, stdio: "inherit" });
  const appSbom = JSON.parse(readFileSync(appFile, "utf8"));

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

  console.log(
    `${outFile}: ${sbom.metadata.component.name}@${sbom.metadata.component.version}, ${sbom.components.length} components`
  );
}

rmSync(rootFile);
