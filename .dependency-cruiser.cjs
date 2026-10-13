/**
 * dependency-cruiser config, run by `yarn check-circular-deps`.
 *
 * Only runtime imports count: type-only imports are erased by the compiler,
 * and dynamic imports (lazy-loaded pages) don't run at load time.
 *
 * The cycles that already exist are recorded in
 * .dependency-cruiser-known-violations.json and ignored, so the check fails on
 * new cycles only. After removing cycles or moving files that are in one,
 * regenerate it with `yarn check-circular-deps:baseline`. Don't use that to
 * accept a new cycle: fix it.
 *
 * @type {import('dependency-cruiser').IConfiguration}
 */
const ignoredDependencyTypes = ["type-only", "type-import", "dynamic-import"];

module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "This import is part of a circular dependency. Break the cycle, e.g. use `import type` for type-only imports or import from the module instead of its index.",
      from: {},
      to: {
        circular: true,
        dependencyTypesNot: ignoredDependencyTypes,
        viaOnly: { dependencyTypesNot: ignoredDependencyTypes },
      },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.test\\.tsx?$" },
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default", "types"],
    },
    skipAnalysisNotInRules: true,
  },
};
