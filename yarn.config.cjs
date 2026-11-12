/**
 * Yarn constraints, checked by `yarn constraints` (part of `yarn lint`).
 * See https://yarnpkg.com/features/constraints.
 */

/**
 * Third-party packages that only one workspace may depend on, so that an app without that
 * feature doesn't install them.
 */
const restrictedPackages = [
  {
    matches: (ident) =>
      ident === "graphiql" || ident.startsWith("@graphiql/") || ident === "monaco-graphql",
    workspace: "packages/features/graphiql",
    reason: "Only the GraphiQL feature depends on the GraphiQL packages.",
  },
];

const editions = ["oss", "iso"];

/**
 * Every package and app declares its edition in its package.json (`"inmanta": { "edition":
 * "oss" }`), and an OSS one never depends on an ISO one, directly or through other workspaces.
 * That keeps the ISO features out of the OSS app's install and bundle. The root workspace only
 * holds the tooling and isn't checked.
 */
const checkEditions = (Yarn) => {
  const editionOf = (workspace) => workspace.manifest.inmanta?.edition;
  const workspaceDependencies = (workspace) =>
    Yarn.dependencies({ workspace })
      .filter(({ type }) => type !== "peerDependencies")
      .map(({ ident }) => Yarn.workspace({ ident }))
      .filter(Boolean);

  // The first path from the workspace to an ISO workspace, or undefined. The workspace itself is
  // seen already, so the path doesn't loop back through it (core and test-utils depend on each other).
  const pathToIso = (workspace, seen = new Set([workspace.cwd])) => {
    for (const dependency of workspaceDependencies(workspace)) {
      if (seen.has(dependency.cwd)) {
        continue;
      }
      seen.add(dependency.cwd);
      if (editionOf(dependency) === "iso") {
        return [dependency.ident];
      }
      const rest = pathToIso(dependency, seen);
      if (rest) {
        return [dependency.ident, ...rest];
      }
    }

    return undefined;
  };

  for (const workspace of Yarn.workspaces()) {
    if (workspace.cwd === ".") {
      continue;
    }
    if (!editions.includes(editionOf(workspace))) {
      workspace.error(
        `Declare the edition of ${workspace.ident} in its package.json: "inmanta": { "edition": "oss" } or "iso".`
      );
      continue;
    }
    if (editionOf(workspace) === "oss") {
      const path = pathToIso(workspace);
      if (path) {
        workspace.error(
          `${workspace.ident} is OSS but depends on the ISO workspace ${path.at(-1)} (${[workspace.ident, ...path].join(" -> ")}).`
        );
      }
    }
  }
};

module.exports = {
  async constraints({ Yarn }) {
    checkEditions(Yarn);

    for (const dependency of Yarn.dependencies()) {
      if (dependency.type === "peerDependencies") {
        continue;
      }

      // The packages of this repository depend on each other through the workspace protocol.
      if (Yarn.workspace({ ident: dependency.ident })) {
        dependency.update("workspace:^");
        continue;
      }

      // One version of each third-party package: every workspace uses the same range.
      for (const other of Yarn.dependencies({ ident: dependency.ident })) {
        if (other.type !== "peerDependencies") {
          dependency.update(other.range);
        }
      }

      for (const { matches, workspace, reason } of restrictedPackages) {
        if (matches(dependency.ident) && dependency.workspace.cwd !== workspace) {
          dependency.error(`${dependency.ident} is only allowed in ${workspace}: ${reason}`);
        }
      }
    }
  },
};
