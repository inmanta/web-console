#!/usr/bin/env node
/**
 * Puts a build of the ISO web console in one of the composer's ship modes (see "Features loaded
 * at runtime" in docs/notes.md), for the end-to-end tests of those modes:
 *
 * - without: no `composer-*` files, so the app starts without the composer;
 * - combined: the composer's build (packages/features/composer/dist) next to the app's files, as
 *   `yarn build` ships it. Applied to a running web console, this installs the composer later;
 * - mismatch: a second build of the composer with another version than the app's
 *   (`COMPOSER_VERSION_OVERRIDE`, see its vite.config.ts) next to the app's files, so the app
 *   leaves it out with a version mismatch notice. It builds into a temporary folder, so
 *   packages/features/composer/dist stays the real build.
 *
 * The target is a web console folder, `dist/` by default, or the folder an orchestrator's Docker
 * container serves it from.
 *
 * Usage: node scripts/composer-ship-mode.js <without|combined|mismatch> [--dir <folder>]
 *        [--container <name>]
 */
import { execFileSync } from "child_process";
import { chmodSync, copyFileSync, mkdtempSync, readdirSync, readFileSync, rmSync } from "fs";
import { createRequire } from "module";
import { tmpdir } from "os";
import { dirname, join, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const composerDir = join(repoRoot, "packages/features/composer");
const composerBuildDir = join(composerDir, "dist");

/**
 * The folder an orchestrator's container serves the web console from (see `update:dist`).
 */
const containerWebConsoleDir = "/usr/share/inmanta/web-console";

/**
 * The version the composer gets in the "mismatch" mode.
 */
const mismatchVersion = "0.0.0-mismatch";

const shipModes = ["without", "combined", "mismatch"];

const isComposerFile = (file) => file.startsWith("composer-");

/**
 * Builds the composer with `mismatchVersion` into a new temporary folder.
 *
 * @returns {string} the temporary folder
 */
const buildMismatchedComposer = () => {
  const buildDir = mkdtempSync(join(tmpdir(), "composer-mismatch-build-"));
  const viteBin = join(
    dirname(createRequire(join(composerDir, "package.json")).resolve("vite/package.json")),
    "bin/vite.js"
  );

  try {
    execFileSync("node", [viteBin, "build", "--outDir", buildDir], {
      cwd: composerDir,
      env: { ...process.env, COMPOSER_VERSION_OVERRIDE: mismatchVersion },
      stdio: "pipe",
    });

    if (!readFileSync(join(buildDir, "composer-feature.js"), "utf-8").includes(mismatchVersion)) {
      throw new Error(`The composer's build doesn't have version "${mismatchVersion}".`);
    }
  } catch (error) {
    rmSync(buildDir, { recursive: true, force: true });
    throw error;
  }

  return buildDir;
};

/**
 * Copies the composer's files of a build into a new temporary folder, without the manifest the
 * app's build reads, as the app's build copies them.
 *
 * @param {string} buildDir - the composer's build
 * @returns {string} the temporary folder
 */
const stageComposerFiles = (buildDir) => {
  const files = readdirSync(buildDir).filter(isComposerFile);

  if (files.length === 0) {
    throw new Error(`No composer build in ${buildDir}, run \`yarn build\` first.`);
  }

  const stageDir = mkdtempSync(join(tmpdir(), "composer-ship-mode-"));

  // `docker cp <folder>/.` may give the target folder the mode of this one, which is 0700 on Linux.
  chmodSync(stageDir, 0o755);

  for (const file of files) {
    copyFileSync(join(buildDir, file), join(stageDir, file));
  }

  return stageDir;
};

/**
 * Stages the composer's files for a ship mode: none for "without", the real build for
 * "combined", and a build with `mismatchVersion` for "mismatch".
 *
 * @param {string} mode - one of `shipModes`
 * @returns {string | undefined} the temporary folder with the files, if any
 */
const stageForMode = (mode) => {
  if (mode === "combined") {
    return stageComposerFiles(composerBuildDir);
  }

  if (mode === "mismatch") {
    const buildDir = buildMismatchedComposer();

    try {
      return stageComposerFiles(buildDir);
    } finally {
      rmSync(buildDir, { recursive: true, force: true });
    }
  }

  return undefined;
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

  const stageDir = stageForMode(mode);

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
