/**
 * The English messages of the GraphiQL page.
 */
export const graphiqlMessages = {
  /**
   * Dashboard
   */
  "graphiql.title": "GraphiQL",
};

type GraphiqlMessages = typeof graphiqlMessages;

declare module "@inmanta/web-console-core/I18n/Words" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface WordsRegistry extends GraphiqlMessages {}
}
