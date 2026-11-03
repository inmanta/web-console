import GraphQLWorker from "monaco-graphql/esm/graphql.worker.js?worker";

/**
 * Lets Monaco start the GraphQL language worker that the GraphiQL editor uses. The app sets up
 * Monaco's other workers (apps/web-console/src/monaco.ts); this adds the "graphql" label on top,
 * so the worker is only bundled in an app that includes GraphiQL, and only loaded with its page.
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
