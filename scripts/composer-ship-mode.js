#!/usr/bin/env node
/**
 * Puts a build of the ISO web console in one of the composer's ship modes (see "Features loaded
 * at runtime" in docs/notes.md), for the end-to-end tests of those modes:
 *
 * - without: no `composer-*` files, so the app starts without the composer;
 * - combined: the composer's build (packages/features/composer/dist) next to the app's files, as
 *   `yarn build` ships it. Applied to a running web console, this installs the composer later;
 * - mismatch: the composer's build, stamped with another version than the app's, so the app
 *   leaves it out with a version mismatch notice.
 *
 * The target is a web console folder, `dist/` by default, or the folder an orchestrator's Docker
 * container serves it from.
 *
 * Usage: node scripts/composer-ship-mode.js <without|combined|mismatch> [--dir <folder>]
 *        [--container <name>]
 */
import { execFileSync } from "child_process";
import {
  chmodSync,
  copyFileSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "fs";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const composerBuildDir = join(repoRoot, "packages/features/composer/dist");

/**
 * The folder an orchestrator's container serves the web console from (see `update:dist`).
 */
export const containerWebConsoleDir = "/usr/share/inmanta/web-console";

/**
 * The version the composer gets in the "mismatch" mode.
 */
export const mismatchVersion = "0.0.0-mismatch";

export const shipModes = ["without", "combined", "mismatch"];

const isComposerFile = (file) => file.startsWith("composer-");

/**
 * Copies the composer's build into a new temporary folder, without the manifest the app's build
 * reads, as the app's build copies it. In the "mismatch" mode, the composer's version (the app's
 * version at build time, `APP_VERSION`) is replaced with `mismatchVersion`.
 *
 * @param {"combined" | "mismatch"} mode - the ship mode
 * @returns {string} the temporary folder
 */
const stageComposerFiles = (mode) => {
  const files = readdirSync(composerBuildDir).filter(isComposerFile);

  if (files.length === 0) {
    throw new Error(`No composer build in ${composerBuildDir}, run \`yarn build\` first.`);
  }

  const appVersion = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf-8")).version;
  // The minifier may quote it with any of ", ' or `.
  const versionPattern = new RegExp(
    `version:\\s*(["'\`])${appVersion.replaceAll(".", "\\.")}\\1`,
    "g"
  );
  const stageDir = mkdtempSync(join(tmpdir(), "composer-ship-mode-"));

  // `docker cp <folder>/.` may give the target folder the mode of this one, which is 0700 on Linux.
  chmodSync(stageDir, 0o755);
  let stamped = 0;

  for (const file of files) {
    if (mode === "mismatch" && file.endsWith(".js")) {
      const code = readFileSync(join(composerBuildDir, file), "utf-8");
      const matches = code.match(versionPattern)?.length ?? 0;

      stamped += matches;
      writeFileSync(
        join(stageDir, file),
        matches > 0 ? code.replace(versionPattern, `version:$1${mismatchVersion}$1`) : code
      );
    } else {
      copyFileSync(join(composerBuildDir, file), join(stageDir, file));
    }
  }

  if (mode === "mismatch" && stamped === 0) {
    rmSync(stageDir, { recursive: true, force: true });
    throw new Error(`The composer's build has no version "${appVersion}" to replace.`);
  }

  return stageDir;
};

/**
 * Puts a web console in the given ship mode: removes its composer files, then copies in the
 * composer's build for the "combined" and "mismatch" modes.
 *
 * @param {string} mode - one of `shipModes`
 * @param {{ dir?: string, container?: string }} [target] - the web console folder (default
 *   `dist/`), or the Docker container that serves it
 * @returns {string} what was done, for the logs
 */
export const setComposerShipMode = (mode, { dir, container } = {}) => {
  if (!shipModes.includes(mode)) {
    throw new Error(`Unknown ship mode "${mode}", expected one of: ${shipModes.join(", ")}.`);
  }

  const stageDir = mode === "without" ? undefined : stageComposerFiles(mode);

  try {
    if (container) {
      execFileSync("docker", [
        "exec",
        "-u",
        "root",
        container,
        "sh",
        "-c",
        `rm -f ${containerWebConsoleDir}/composer-*`,
      ]);

      if (stageDir) {
        execFileSync("docker", ["cp", `${stageDir}/.`, `${container}:${containerWebConsoleDir}`]);
      }

      return `${container}:${containerWebConsoleDir} is now "${mode}"`;
    }

    const targetDir = resolve(dir ?? join(repoRoot, "dist"));

    for (const file of readdirSync(targetDir).filter(isComposerFile)) {
      rmSync(join(targetDir, file));
    }

    for (const file of stageDir ? readdirSync(stageDir) : []) {
      copyFileSync(join(stageDir, file), join(targetDir, file));
    }

    return `${targetDir} is now "${mode}"`;
  } finally {
    if (stageDir) {
      rmSync(stageDir, { recursive: true, force: true });
    }
  }
};

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const [mode, ...options] = process.argv.slice(2);
  const option = (name) => {
    const index = options.indexOf(name);

    return index === -1 ? undefined : options[index + 1];
  };

  try {
    console.log(
      setComposerShipMode(mode, { dir: option("--dir"), container: option("--container") })
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
