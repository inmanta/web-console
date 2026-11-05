import GraphQLWorker from "monaco-graphql/esm/graphql.worker.js?worker";

/**
 * Lets Monaco start the GraphQL language worker that the GraphiQL editor uses. The app sets up
 * Monaco's other workers (apps/web-console/src/monaco.ts); this adds the "graphql" label on top,
 * so the worker is only bundled in an app that includes GraphiQL, and only loaded with its page.
 *
 * It must run after the app's Monaco setup, which assigns `self.MonacoEnvironment` outright. The
 * GraphiQL page calls it when it loads, and the page is lazy loaded, so the app's setup has run
 * by then. Importing the page statically would run it first and lose the GraphQL worker.
 */
export const registerGraphQLWorker = (): void => {
  const environment = self.MonacoEnvironment;
  const getWorker = environment?.getWorker;

  self.MonacoEnvironment = {
    ...environment,
    getWorker(workerId, label) {
      if (label === "graphql") {
        return new GraphQLWorker();
      }

      if (!getWorker) {
        throw new Error(`No Monaco worker for "${label}": the app hasn't set up Monaco.`);
      }

      return getWorker(workerId, label);
    },
  };
};
