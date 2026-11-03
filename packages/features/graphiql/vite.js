// @ts-check
/// <reference types="vitest/config" />
// Plain JavaScript, so Node loads it as it is when a Vite config imports it, whatever Vite's
// config loader; the JSDoc types are checked by `yarn tsc`.

/**
 * The Vite settings the GraphiQL feature needs in an app that ships it, and in the tests (#7461).
 * They live with the feature, so an app without it has no GraphiQL in its Vite config either.
 *
 * @returns {import("vite").Plugin} The Vite plugin.
 */
export const graphiqlVitePlugin = () => ({
  name: "inmanta-graphiql",
  config: () => ({
    optimizeDeps: {
      exclude: ["monaco-graphql"],
    },
    test: {
      deps: {
        optimizer: {
          // No package imports @graphiql/react; the graphiql feature declares it for this list.
          web: { include: ["graphiql", "@graphiql/react"] },
        },
      },
    },
  }),
});
