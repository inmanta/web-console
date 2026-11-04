/**
 * Yarn constraints, checked by `yarn constraints` (part of `yarn lint`).
 * See https://yarnpkg.com/features/constraints.
 */

/**
 * Third-party packages that only one workspace may depend on, so that an app without that
 * feature doesn't install them. JointJS needs a licence token to install.
 */
const restrictedPackages = [
  {
    matches: (ident) => ident.startsWith("@joint/"),
    workspace: "packages/features/composer",
    reason: "JointJS needs a licence, so only the composer depends on it.",
  },
  {
    matches: (ident) =>
      ident === "graphiql" || ident.startsWith("@graphiql/") || ident === "monaco-graphql",
    workspace: "packages/features/graphiql",
    reason: "Only the GraphiQL feature depends on the GraphiQL packages.",
  },
];

module.exports = {
  async constraints({ Yarn }) {
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
