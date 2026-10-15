/**
 * dependency-cruiser config, run by `yarn check-circular-deps`.
 *
 * Only runtime imports are in the graph: dependencies are read from the
 * compiled output (`tsPreCompilationDeps: false`), so type-only imports are
 * gone whether or not they use the `type` keyword, and dynamic imports
 * (lazy-loaded pages) are excluded because they don't run at load time.
 *
 * The cycles that already exist are recorded in
 * .dependency-cruiser-known-violations.json and ignored, so the check fails on
 * new cycles only. Regenerate it with `yarn check-circular-deps:baseline`
 * after removing cycles or moving files that are in one. The baseline stores
 * one cycle per import, so removing an import can surface another cycle that
 * already existed: regenerating is fine then. Don't use it to accept a cycle
 * your change introduced: fix it.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "This import is part of a circular dependency. Break the cycle, e.g. use `import type` for type-only imports or import from the module instead of its index.",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.test\\.tsx?$", dynamic: true },
    tsPreCompilationDeps: false,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
    skipAnalysisNotInRules: true,
  },
};
