/**
 * dependency-cruiser config, run by `yarn check-circular-deps`.
 *
 * Only runtime imports are in the graph: dependencies are read from the
 * compiled output (`tsPreCompilationDeps: false`), so type-only imports are
 * gone whether or not they use the `type` keyword, and dynamic imports
 * (lazy-loaded pages) are excluded because they don't run at load time.
 *
 * The check fails on any cycle, so fix a cycle your change introduces instead
 * of ignoring it.
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
    {
      name: "no-unresolvable-workspace-import",
      severity: "error",
      comment:
        "This import of a workspace package doesn't resolve, so the cycle check can't see past it. Check the package's `exports` in its package.json.",
      from: {},
      to: { couldNotResolve: true, path: "^@inmanta/web-console-" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: { path: "\\.test\\.tsx?$", dynamic: true },
    tsPreCompilationDeps: false,
    // The compiler options and path aliases; tsconfig.json itself only lists the project references.
    tsConfig: { fileName: "tsconfig.base.json" },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      // No "types": the workspace packages list their TypeScript fallbacks under "types",
      // and enhanced-resolve only tries the first one. "default" ("./src/*") lets it
      // find the file or the folder's index itself.
      conditionNames: ["import", "require", "node", "default"],
    },
    skipAnalysisNotInRules: true,
  },
};
